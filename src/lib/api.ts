const base = (import.meta.env.VITE_API_BASE ?? "").replace(/\/+$/, "");

export type JobState = "queued" | "running" | "done" | "error";

export interface JobStatus {
  state: JobState;
  progress?: number;
  file?: { name: string; size?: number };
  message?: string;
}

export type ApiErrorKind = "unsupported" | "generic";

export class ApiError extends Error {
  kind: ApiErrorKind;

  constructor(kind: ApiErrorKind) {
    super(kind);
    this.kind = kind;
  }
}

export async function fetchHealth(): Promise<boolean> {
  const response = await fetch(`${base}/api/health`, { signal: AbortSignal.timeout(6000) });
  if (!response.ok) return false;
  const data = (await response.json()) as { ok?: boolean };
  return data.ok === true;
}

export async function createJob(
  url: string,
  format: "mp4" | "mp3",
  height?: number,
): Promise<string> {
  const response = await fetch(`${base}/api/download`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, format, height }),
    signal: AbortSignal.timeout(15000),
  });
  if (response.status === 400 || response.status === 415) throw new ApiError("unsupported");
  if (!response.ok) throw new ApiError("generic");
  const data = (await response.json()) as { id?: string };
  if (!data.id) throw new ApiError("generic");
  return data.id;
}

export async function getJob(id: string): Promise<JobStatus> {
  const response = await fetch(`${base}/api/job/${id}`, { signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new ApiError("generic");
  return (await response.json()) as JobStatus;
}

export function fileHref(id: string): string {
  return `${base}/api/file/${id}`;
}

const CHUNK = 8 * 1024 * 1024;
const SMALL_MAX = 15 * 1024 * 1024;
const UPLOAD_PART = 9 * 1024 * 1024;

export class EnhanceError extends Error {
  status: number;

  constructor(status: number) {
    super(`enhance ${status}`);
    this.status = status;
  }
}

async function putUploadPart(fileID: string, index: number, blob: Blob): Promise<void> {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(`${base}/api/enhance-part/${fileID}/${index}`, {
        method: "PUT",
        headers: { "Content-Type": "application/octet-stream" },
        body: blob,
        signal: AbortSignal.timeout(60_000),
      });
      if (res.ok) return;
    } catch {
      // retry below
    }
    if (attempt < 3) await new Promise((r) => setTimeout(r, attempt * 1000));
  }
  throw new EnhanceError(0);
}

async function getUploadPart(fileID: string, index: number): Promise<Blob> {
  let last: EnhanceError | null = null;
  for (let attempt = 1; attempt <= 8; attempt++) {
    try {
      const res = await fetch(`${base}/api/enhance-part/${fileID}/${index}`, {
        signal: AbortSignal.timeout(30_000),
      });
      if (res.ok) return res.blob();
      if (res.status !== 404) throw new EnhanceError(res.status);
    } catch (err) {
      if (err instanceof EnhanceError) throw err;
    }
    last = new EnhanceError(404);
    await new Promise((r) => setTimeout(r, 1500));
  }
  throw last ?? new EnhanceError(0);
}

export type EnhanceModel = "anime" | "photo";

async function enhanceImageBig(
  file: File,
  mode: "clean" | "x2" | "x4",
  engine: "local" | "ai",
  model: EnhanceModel,
): Promise<Blob> {
  const fileID = crypto.randomUUID().toLowerCase();
  const total = Math.ceil(file.size / UPLOAD_PART);
  for (let i = 0; i < total; i++) {
    const chunk = file.slice(i * UPLOAD_PART, Math.min(file.size, (i + 1) * UPLOAD_PART));
    await putUploadPart(fileID, i, chunk);
  }
  const res = await fetch(`${base}/api/enhance-big`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileId: fileID, parts: total, mode, engine, model }),
    signal: AbortSignal.timeout(95_000),
  });
  if (!res.ok) throw new EnhanceError(res.status);
  const data = (await res.json()) as { resultId?: string; parts?: number; type?: string };
  if (!data.resultId || !data.parts) throw new EnhanceError(0);
  const parts: Blob[] = [];
  for (let i = 0; i < data.parts; i++) {
    parts.push(await getUploadPart(data.resultId, i));
  }
  return new Blob(parts, data.type ? { type: data.type } : undefined);
}

export async function enhanceImage(
  file: File,
  mode: "clean" | "x2" | "x4",
  engine: "local" | "ai",
  model: EnhanceModel,
): Promise<Blob> {
  if (file.size > SMALL_MAX) return enhanceImageBig(file, mode, engine, model);
  const form = new FormData();
  form.append("file", file);
  form.append("mode", mode);
  form.append("engine", engine);
  form.append("model", model);
  const response = await fetch(`${base}/api/enhance`, {
    method: "POST",
    body: form,
    signal: AbortSignal.timeout(95_000),
  });
  if (!response.ok) throw new EnhanceError(response.status);
  return response.blob();
}

export async function saveFile(
  id: string,
  name: string,
  size: number,
  onProgress?: (received: number, total: number) => void,
): Promise<void> {
  const parts: BlobPart[] = [];
  let received = 0;
  let type = "";
  while (received < size) {
    const end = Math.min(size, received + CHUNK) - 1;
    let part: Blob | null = null;
    for (let attempt = 1; attempt <= 4; attempt++) {
      try {
        const res = await fetch(`${base}/api/file/${id}`, {
          headers: { Range: `bytes=${received}-${end}` },
          signal: AbortSignal.timeout(95_000),
        });
        if (res.status === 206 || res.status === 200) {
          if (!type) type = res.headers.get("content-type") ?? "";
          part = await res.blob();
          if (res.status === 200) {
            parts.push(part);
            received = size;
            onProgress?.(size, size);
            break;
          }
          if (part.size > size - received) part = part.slice(0, size - received);
          break;
        }
        part = null;
      } catch {
        part = null;
      }
      if (attempt < 4) await new Promise((r) => setTimeout(r, attempt * 1000));
    }
    if (received >= size) break;
    if (!part || part.size === 0) throw new ApiError("generic");
    parts.push(part);
    received += part.size;
    onProgress?.(received, size);
  }
  const blob = new Blob(parts, type ? { type } : undefined);
  const href = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = href;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(href), 60_000);
}

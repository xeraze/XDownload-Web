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

import { execSync } from "node:child_process";
import { cpSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

execSync("npm run build", { stdio: "inherit" });

const dist = join(process.cwd(), "dist");
if (!existsSync(dist)) {
  console.error("dist not found");
  process.exit(1);
}

const dst = join(tmpdir(), "xdownload-web-gh-pages");
rmSync(dst, { recursive: true, force: true });
cpSync(dist, dst, { recursive: true });

const git = (cmd) => execSync(cmd, { cwd: dst, stdio: ["ignore", "inherit", "inherit"] });

try {
  git("git init -b gh-pages");
} catch {
  git("git init");
  git("git checkout -b gh-pages");
}
git("git add -A");
git('git -c core.autocrlf=false commit --allow-empty -m "deploy"');
const remote = execSync("git remote get-url origin", { encoding: "utf8" }).trim();
git(`git push --force "${remote}" gh-pages`);
console.log("deployed: https://xeraze.github.io/XDownload-Web/");

import { execFileSync, spawnSync } from "node:child_process";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { channelVersion, distTag, utcDateStamp } from "./version.mjs";

const packages = readdirSync("packages")
  .map((name) => `packages/${name}/package.json`)
  .filter((file) => JSON.parse(readFileSync(file, "utf8")).private !== true)
  .sort();

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const positional = args.filter((arg) => arg !== "--dry-run" && !arg.startsWith("--base"));
const baseFlag = args.indexOf("--base");
const base = baseFlag >= 0 ? args[baseFlag + 1] : undefined;
const channel = positional[0];
const bump = positional[1] ?? "patch";

if (!channel) {
  console.error("Usage: pnpm release <latest|rc|beta|experimental> [patch|minor|major] [--base x.y.z] [--dry-run]");
  process.exit(1);
}

if (packages.length === 0) {
  console.error("No public packages to release.");
  process.exit(1);
}

const current = JSON.parse(readFileSync(packages[0], "utf8")).version;
const hash = git("rev-parse", "HEAD");
const version = channelVersion(channel, {
  current,
  bump,
  base,
  hash,
  date: utcDateStamp(),
});
const tag = distTag(channel, version);

console.log(`version ${version}`);
console.log(`dist-tag ${tag}`);
console.log(`git-tag ${version}`);
console.log(`packages ${packages.join(", ")}`);

if (dryRun) process.exit(0);

assertClean();
writeVersions(version);
run("pnpm", ["test"]);
for (const file of packages) {
  const name = JSON.parse(readFileSync(file, "utf8")).name;
  run("pnpm", ["--filter", name, "build"]);
  run("pnpm", ["--filter", name, "publish", "--access", "public", "--tag", tag, "--no-git-checks"]);
}

git("add", "--", ...packages);
git("commit", "-m", `release: ${version}`);
git("tag", version);

if (channel !== "latest") {
  writeVersions(current);
  git("add", "--", ...packages);
  git("commit", "-m", `chore: restore package version to ${current}`);
}

function writeVersions(next) {
  for (const file of packages) {
    const manifest = JSON.parse(readFileSync(file, "utf8"));
    manifest.version = next;
    writeFileSync(file, `${JSON.stringify(manifest, null, 2)}\n`);
  }
}

function assertClean() {
  const status = git("status", "--porcelain");
  if (status.trim()) {
    console.error("Release requires a clean git worktree.");
    process.exit(1);
  }
}

function git(...gitArgs) {
  return execFileSync("git", gitArgs, { encoding: "utf8" }).trim();
}

function run(command, commandArgs) {
  const result = spawnSync(command, commandArgs, { stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

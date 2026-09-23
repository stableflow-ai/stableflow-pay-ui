/**
 * Version math for `pnpm release`. Pure functions so the rules can be tested
 * without publishing or touching git.
 */

const STABLE = /^(\d+)\.(\d+)\.(\d+)$/;

export function stableCore(version) {
  const match = STABLE.exec(version) ?? /^(\d+)\.(\d+)\.(\d+)-/.exec(version);
  if (!match) {
    throw new Error(`Cannot read a stable core from version "${version}".`);
  }
  return `${match[1]}.${match[2]}.${match[3]}`;
}

export function increment(version, bump) {
  const [major, minor, patch] = stableCore(version).split(".").map(Number);
  if (bump === "major") return `${major + 1}.0.0`;
  if (bump === "minor") return `${major}.${minor + 1}.0`;
  if (bump === "patch") return `${major}.${minor}.${patch + 1}`;
  throw new Error(`Unknown bump "${bump}". Use patch, minor, or major.`);
}

export function latestVersion(current, bump) {
  if (stableCore(current) === "0.0.0") return "0.0.1";
  return increment(current, bump);
}

export function nextBase(current, explicitBase) {
  if (explicitBase) {
    if (!STABLE.test(explicitBase)) {
      throw new Error(`--base must be x.y.z, received "${explicitBase}".`);
    }
    return explicitBase;
  }
  const core = stableCore(current);
  if (core === "0.0.0") return "0.0.1";
  return increment(core, "patch");
}

export function prereleaseHash(fullHash) {
  const suffix = fullHash.slice(-10);
  if (suffix.length !== 10) {
    throw new Error("Commit hash must contain at least 10 characters.");
  }
  return /^\d+$/.test(suffix) ? `h${suffix}` : suffix;
}

export function utcDateStamp(date = new Date()) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

export function channelVersion(channel, options) {
  const { current, bump = "patch", base, hash, date } = options;
  if (channel === "latest") return latestVersion(current, bump);
  if (channel === "experimental") {
    return `0.0.0-experimental-${prereleaseHash(hash)}-${date}`;
  }
  if (channel === "rc" || channel === "beta") {
    return `${nextBase(current, base)}-${channel}-${prereleaseHash(hash)}-${date}`;
  }
  throw new Error(`Unknown channel "${channel}". Use latest, rc, beta, or experimental.`);
}

export function distTag(channel, version) {
  if (channel === "latest" || channel === "rc" || channel === "beta") return channel;
  if (channel === "experimental") return version.slice("0.0.0-".length);
  throw new Error(`Unknown channel "${channel}".`);
}

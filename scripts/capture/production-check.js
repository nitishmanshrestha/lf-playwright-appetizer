/**
 * @fileoverview Production hostname guard.
 *
 * Hybrid policy:
 *   - HARD denylist: refuses execution unless --allow-production is provided.
 *   - SOFT denylist: prints warning, requires y/N confirmation.
 */

const HARD_DENY = /(?:^|\.)production\./i;
const SOFT_DENY = /(?:^|\.)(prod|live)(?:\.|$)/i;

function classifyHostname(rawUrl) {
  let hostname = "";
  try {
    hostname = new URL(rawUrl).hostname;
  } catch (error) {
    return { level: "invalid", hostname: "", reason: "Invalid URL" };
  }

  if (HARD_DENY.test(hostname)) {
    return {
      level: "hard",
      hostname,
      reason: "Hostname matches production pattern (production.*)",
    };
  }
  if (SOFT_DENY.test(hostname)) {
    return {
      level: "soft",
      hostname,
      reason: "Hostname looks production-like (prod/live)",
    };
  }
  return { level: "safe", hostname, reason: "" };
}

module.exports = {
  classifyHostname,
};

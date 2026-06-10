/* eslint-disable no-useless-escape */
/**
 * @fileoverview Redaction engine for captured DOM artifacts.
 *
 * Applies default + user-supplied patterns to text content and string-typed
 * values inside captured snapshots. Operates in-place on plain JSON-safe
 * objects; never throws on unexpected shapes.
 */

const DEFAULT_PATTERNS = Object.freeze({
  email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  phone: /(?:\+?\d{1,3}[\s.-])?(?:\(?\d{2,4}\)?[\s.-]){1,3}\d{3,4}/g,
  ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
  creditCard: /\b(?:\d[ -]?){13,19}\b/g,
  jwt: /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g,
  authHeader: /(?:Bearer|Basic)\s+[A-Za-z0-9._\-+/=]{8,}/gi,
});

const REDACTED_TOKEN = "[REDACTED]";

function compileCustomPatterns(rawPatterns) {
  if (!Array.isArray(rawPatterns)) return [];
  return rawPatterns
    .map((pattern) => String(pattern).trim())
    .filter(Boolean)
    .map((pattern) => {
      try {
        return new RegExp(pattern, "g");
      } catch (error) {
        return null;
      }
    })
    .filter(Boolean);
}

function redactString(value, patterns) {
  if (typeof value !== "string" || value.length === 0) return value;
  let redacted = value;
  for (const pattern of patterns) {
    redacted = redacted.replace(pattern, REDACTED_TOKEN);
  }
  return redacted;
}

function buildPatternList(customPatterns = []) {
  return [
    ...Object.values(DEFAULT_PATTERNS),
    ...compileCustomPatterns(customPatterns),
  ];
}

function redactValue(value, patterns) {
  if (value === null || value === undefined) return value;
  if (typeof value === "string") return redactString(value, patterns);
  if (Array.isArray(value)) return value.map((item) => redactValue(item, patterns));
  if (typeof value === "object") {
    const next = {};
    for (const key of Object.keys(value)) {
      next[key] = redactValue(value[key], patterns);
    }
    return next;
  }
  return value;
}

function redactObject(input, customPatterns = []) {
  const patterns = buildPatternList(customPatterns);
  return redactValue(input, patterns);
}

module.exports = {
  DEFAULT_PATTERNS,
  REDACTED_TOKEN,
  buildPatternList,
  redactObject,
  redactString,
};

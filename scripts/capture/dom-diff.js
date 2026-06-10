/**
 * @fileoverview DOM diff between two consecutive snapshots.
 *
 * Compares the structural output of captureStructuredSnapshot() to produce a
 * human+AI-readable delta. Used to enrich each captured state file with a
 * "what changed since the last state" record.
 *
 * Compared axes:
 *   - uniqueTestIds: test-ids that appeared / disappeared
 *   - roleInventory: roles whose element count changed (buttons, dialogs, etc.)
 *   - headings:      visible headings that changed (page/section transition)
 *   - formControls:  form controls that became enabled/disabled/required
 *   - labels:        new labels that appeared (dynamic forms)
 */

function setDiff(before, after) {
  const beforeSet = new Set(before);
  const afterSet = new Set(after);
  return {
    added: after.filter((id) => !beforeSet.has(id)),
    removed: before.filter((id) => !afterSet.has(id)),
  };
}

function diffRoles(beforeInventory = {}, afterInventory = {}) {
  const allRoles = new Set([
    ...Object.keys(beforeInventory),
    ...Object.keys(afterInventory),
  ]);
  const changes = [];

  for (const role of allRoles) {
    const beforeCount = (beforeInventory[role] || {}).count || 0;
    const afterCount = (afterInventory[role] || {}).count || 0;
    if (beforeCount !== afterCount) {
      changes.push({
        role,
        before: beforeCount,
        after: afterCount,
        delta: afterCount - beforeCount,
      });
    }
  }
  return changes;
}

function diffHeadings(before = [], after = []) {
  const beforeTexts = before.map((h) => `${h.level}:${h.text}`);
  const afterTexts = after.map((h) => `${h.level}:${h.text}`);
  const diff = setDiff(beforeTexts, afterTexts);
  return {
    added: diff.added,
    removed: diff.removed,
    changed: diff.added.length > 0 || diff.removed.length > 0,
  };
}

function diffFormControls(before = [], after = []) {
  const key = (ctrl) =>
    `${ctrl.tag}|${ctrl.name || ""}|${ctrl.id || ""}|${ctrl.testId || ""}`;

  const beforeMap = new Map(before.map((c) => [key(c), c]));
  const afterMap = new Map(after.map((c) => [key(c), c]));

  const appeared = [];
  const disappeared = [];
  const stateChanged = [];

  for (const [k, ctrl] of afterMap) {
    if (!beforeMap.has(k)) {
      appeared.push({ tag: ctrl.tag, name: ctrl.name, testId: ctrl.testId });
    } else {
      const prev = beforeMap.get(k);
      if (prev.disabled !== ctrl.disabled || prev.required !== ctrl.required) {
        stateChanged.push({
          tag: ctrl.tag,
          name: ctrl.name,
          testId: ctrl.testId,
          disabled: { before: prev.disabled, after: ctrl.disabled },
          required: { before: prev.required, after: ctrl.required },
        });
      }
    }
  }
  for (const [k, ctrl] of beforeMap) {
    if (!afterMap.has(k)) {
      disappeared.push({ tag: ctrl.tag, name: ctrl.name, testId: ctrl.testId });
    }
  }
  return { appeared, disappeared, stateChanged };
}

function diffLabels(before = [], after = []) {
  const beforeTexts = new Set(before.map((l) => l.text));
  const afterTexts = new Set(after.map((l) => l.text));
  return {
    added: after.filter((l) => !beforeTexts.has(l.text)).map((l) => l.text),
    removed: before.filter((l) => !afterTexts.has(l.text)).map((l) => l.text),
  };
}

/**
 * Compute a full diff between two snapshot payloads.
 * Returns null if either argument is missing (first capture has no "before").
 *
 * @param {object|null} beforeSnapshot  snapshot.snapshot from previous state file
 * @param {object}      afterSnapshot   snapshot.snapshot from current state file
 * @returns {object|null}
 */
function diffSnapshots(beforeSnapshot, afterSnapshot) {
  if (!beforeSnapshot || !afterSnapshot) return null;

  const testIds = setDiff(
    beforeSnapshot.uniqueTestIds || [],
    afterSnapshot.uniqueTestIds || [],
  );
  const roles = diffRoles(
    beforeSnapshot.roleInventory,
    afterSnapshot.roleInventory,
  );
  const headings = diffHeadings(beforeSnapshot.headings, afterSnapshot.headings);
  const formControls = diffFormControls(
    beforeSnapshot.formControls,
    afterSnapshot.formControls,
  );
  const labels = diffLabels(beforeSnapshot.labels, afterSnapshot.labels);

  const hasChanges =
    testIds.added.length > 0 ||
    testIds.removed.length > 0 ||
    roles.length > 0 ||
    headings.changed ||
    formControls.appeared.length > 0 ||
    formControls.disappeared.length > 0 ||
    formControls.stateChanged.length > 0 ||
    labels.added.length > 0 ||
    labels.removed.length > 0;

  return {
    hasChanges,
    testIds,
    roles,
    headings,
    formControls,
    labels,
  };
}

/**
 * Format a diff for terminal output (concise, human-readable).
 */
function formatDiffSummary(diff) {
  if (!diff || !diff.hasChanges) return "  (no structural changes detected)";
  const lines = [];

  if (diff.testIds.added.length) {
    lines.push(`  + test-ids appeared : ${diff.testIds.added.join(", ")}`);
  }
  if (diff.testIds.removed.length) {
    lines.push(`  - test-ids removed  : ${diff.testIds.removed.join(", ")}`);
  }
  for (const r of diff.roles) {
    const sign = r.delta > 0 ? "+" : "";
    lines.push(`  ${sign}${r.delta} ${r.role} elements (${r.before} → ${r.after})`);
  }
  if (diff.headings.added.length) {
    lines.push(`  + headings          : ${diff.headings.added.join(" | ")}`);
  }
  if (diff.headings.removed.length) {
    lines.push(`  - headings          : ${diff.headings.removed.join(" | ")}`);
  }
  if (diff.formControls.appeared.length) {
    const names = diff.formControls.appeared
      .map((c) => c.testId || c.name || c.tag)
      .join(", ");
    lines.push(`  + form controls     : ${names}`);
  }
  if (diff.formControls.disappeared.length) {
    const names = diff.formControls.disappeared
      .map((c) => c.testId || c.name || c.tag)
      .join(", ");
    lines.push(`  - form controls     : ${names}`);
  }
  if (diff.formControls.stateChanged.length) {
    const names = diff.formControls.stateChanged
      .map((c) => c.testId || c.name || c.tag)
      .join(", ");
    lines.push(`  ~ state changed     : ${names}`);
  }
  if (diff.labels.added.length) {
    lines.push(`  + labels            : ${diff.labels.added.join(", ")}`);
  }
  return lines.join("\n");
}

module.exports = { diffSnapshots, formatDiffSummary };

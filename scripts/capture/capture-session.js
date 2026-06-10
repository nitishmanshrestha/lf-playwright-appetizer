/**
 * @fileoverview Interactive capture session.
 *
 * Three complementary capture mechanisms so every meaningful DOM state —
 * including transient states triggered by user interactions — can be captured
 * without leaving the browser:
 *
 * ─── Mechanism 1: In-browser capture toolbar (primary) ──────────────────────
 *   A floating panel injected via page.addInitScript() + page.exposeFunction().
 *   Type a state key in the input, click "📸 Capture" — no terminal switching.
 *
 * ─── Mechanism 2: MutationObserver auto-notification ────────────────────────
 *   Watches for significant DOM mutations (test-ids appearing, dialogs opening,
 *   aria-expanded toggling). Prints a terminal notification so the user knows
 *   a transient state (dropdown, modal, inline validation) is available.
 *
 * ─── Mechanism 3: Terminal REPL (fallback / CSP-protected pages) ────────────
 *   c <key>, u, r, n, q, ?  — same as before.
 *
 * ─── DOM diff ────────────────────────────────────────────────────────────────
 *   After every capture, a structural diff against the previous state is stored
 *   inside the state file under "diff" and printed as a terminal summary.
 */

/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const readline = require("readline");

const { captureStructuredSnapshot } = require("./dom-snapshot");
const { redactObject } = require("./redaction");
const { diffSnapshots, formatDiffSummary } = require("./dom-diff");

function nowIso() {
  return new Date().toISOString();
}

function safeStateKey(input) {
  return String(input || "")
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function printHelp() {
  console.log("");
  console.log("  Terminal commands:");
  console.log("    c <state-key>  capture current DOM under a named state");
  console.log("    u              print current URL");
  console.log("    r              reload iteration start URL");
  console.log("    n              done with this iteration");
  console.log("    q              abort capture");
  console.log("    ?              show this help");
  console.log("");
  console.log("  In-browser: type state key in the floating 📸 toolbar and click Capture.");
  console.log("  Mutation notifications appear automatically when the DOM changes.");
  console.log("");
}

// ─── Injected browser code ─────────────────────────────────────────────────
// Self-contained — no module imports.  Injected via page.addInitScript().
const BROWSER_INJECT_SCRIPT = `
(function () {
  'use strict';

  // ── Floating capture toolbar ─────────────────────────────────────────────
  function buildToolbar() {
    const panel = document.createElement('div');
    panel.id = '__capture-toolbar';
    panel.setAttribute('data-capture-internal', 'true');
    panel.style.cssText = [
      'position:fixed','bottom:16px','right:16px','z-index:2147483647',
      'display:flex','align-items:center','gap:6px','padding:8px 12px',
      'background:rgba(15,15,15,0.92)','border:1px solid rgba(255,255,255,0.15)',
      'border-radius:8px','box-shadow:0 4px 16px rgba(0,0,0,0.5)',
      'font:13px/1 system-ui,sans-serif','color:#fff',
    ].join(';');

    const emoji = document.createElement('span');
    emoji.textContent = '📸';
    emoji.style.cssText = 'font-size:16px;cursor:default;user-select:none';

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'state-key…';
    input.id = '__capture-key-input';
    input.style.cssText = [
      'width:140px','padding:4px 8px','border-radius:4px',
      'border:1px solid rgba(255,255,255,0.2)','background:rgba(255,255,255,0.1)',
      'color:#fff','font:12px/1 system-ui,sans-serif','outline:none',
    ].join(';');
    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') triggerCapture();
    });

    const btn = document.createElement('button');
    btn.textContent = 'Capture';
    btn.style.cssText = [
      'padding:4px 10px','border-radius:4px','border:none',
      'background:#4f8ef7','color:#fff','cursor:pointer',
      'font:12px/1 system-ui,sans-serif',
    ].join(';');
    btn.addEventListener('click', triggerCapture);

    const muteBadge = document.createElement('span');
    muteBadge.id = '__capture-mute';
    muteBadge.title = 'Toggle mutation notifications';
    muteBadge.textContent = '🔔';
    muteBadge.style.cssText = 'cursor:pointer;font-size:14px;user-select:none';
    muteBadge.addEventListener('click', function() {
      window.__captureMuted = !window.__captureMuted;
      muteBadge.textContent = window.__captureMuted ? '🔕' : '🔔';
    });

    panel.appendChild(emoji);
    panel.appendChild(input);
    panel.appendChild(btn);
    panel.appendChild(muteBadge);
    return panel;
  }

  function triggerCapture() {
    var input = document.getElementById('__capture-key-input');
    var rawKey = (input && input.value.trim()) || '';
    if (typeof window.__captureSignal === 'function') {
      window.__captureSignal({ type: 'capture', key: rawKey });
    }
    if (input) input.value = '';
  }

  // ── MutationObserver ──────────────────────────────────────────────────────
  var TEST_ID_ATTRS = ['data-testid', 'data-test'];
  var SIGNIFICANT_ROLES = {
    dialog:1, alertdialog:1, menu:1, listbox:1, tooltip:1,
    combobox:1, tree:1, grid:1, tabpanel:1,
  };

  function isSignificant(mutation) {
    if (mutation.type === 'childList') {
      for (var i = 0; i < mutation.addedNodes.length; i++) {
        var node = mutation.addedNodes[i];
        if (node.nodeType !== 1) continue;
        for (var a = 0; a < TEST_ID_ATTRS.length; a++) {
          if (node.getAttribute && node.getAttribute(TEST_ID_ATTRS[a])) return true;
        }
        var role = node.getAttribute && node.getAttribute('role');
        if (role && SIGNIFICANT_ROLES[role]) return true;
        for (var b = 0; b < TEST_ID_ATTRS.length; b++) {
          if (node.querySelector && node.querySelector('[' + TEST_ID_ATTRS[b] + ']')) return true;
        }
      }
    }
    if (mutation.type === 'attributes') {
      var attr = mutation.attributeName;
      if (attr === 'aria-expanded' || attr === 'aria-hidden' ||
          attr === 'disabled' || attr === 'aria-selected' ||
          attr === 'required') return true;
    }
    return false;
  }

  var DEBOUNCE_MS = 600;
  var debounceTimer = null;
  var pendingSummaries = [];

  var observer = new MutationObserver(function(mutations) {
    if (window.__captureMuted) return;
    var sig = mutations.filter(isSignificant);
    if (!sig.length) return;
    var summary = sig.slice(0, 5).map(function(m) {
      if (m.type === 'childList') {
        var names = [];
        for (var i = 0; i < m.addedNodes.length; i++) {
          var n = m.addedNodes[i];
          if (n.nodeType !== 1) continue;
          for (var a = 0; a < TEST_ID_ATTRS.length; a++) {
            var v = n.getAttribute && n.getAttribute(TEST_ID_ATTRS[a]);
            if (v) { names.push(v); break; }
          }
          if (!names.length) {
            var r = n.getAttribute && n.getAttribute('role');
            if (r) names.push('[role=' + r + ']');
          }
        }
        return names.length ? 'added:' + names.join(',') : null;
      }
      if (m.type === 'attributes') {
        var el = m.target;
        var id = '';
        for (var a = 0; a < TEST_ID_ATTRS.length; a++) {
          var v = el.getAttribute && el.getAttribute(TEST_ID_ATTRS[a]);
          if (v) { id = v; break; }
        }
        if (!id) id = el.tagName ? el.tagName.toLowerCase() : 'el';
        return id + '[' + m.attributeName + '=' + (el.getAttribute(m.attributeName) || 'removed') + ']';
      }
      return null;
    }).filter(Boolean);
    pendingSummaries.push.apply(pendingSummaries, summary);
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(function() {
      if (!window.__captureMuted && typeof window.__captureSignal === 'function') {
        window.__captureSignal({ type: 'mutation', summary: pendingSummaries.slice(0, 10).join(' | ') });
      }
      pendingSummaries = [];
    }, DEBOUNCE_MS);
  });

  observer.observe(document.documentElement, {
    subtree: true, childList: true, attributes: true,
    attributeFilter: [
      'aria-expanded','aria-hidden','aria-selected',
      'disabled','required',
      'data-testid','data-test',
    ],
  });

  // ── Mount toolbar ─────────────────────────────────────────────────────────
  function mount() {
    if (!document.body || document.getElementById('__capture-toolbar')) return;
    document.body.appendChild(buildToolbar());
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
  // Re-mount after SPA route changes
  var _push = history.pushState.bind(history);
  history.pushState = function() { _push.apply(history, arguments); setTimeout(mount, 300); };
})();
`;

// ─── Core capture function (shared by toolbar + REPL) ────────────────────
async function performCapture({
  page, stateKey, stateCounter, iterationDir, iterationKey,
  testIdAttribute, hiddenSelectors, customRedactionPatterns, previousSnapshot,
}) {
  const fileName = `${String(stateCounter).padStart(2, "0")}-${stateKey}.json`;
  const fullPath = path.join(iterationDir, fileName);

  const snapshot = await captureStructuredSnapshot(page, { testIdAttribute, hiddenSelectors });
  const diff = diffSnapshots(previousSnapshot, snapshot);

  const rawPayload = {
    capturedAt: nowIso(),
    capturedVia: "capture-session",
    iterationKey,
    stateKey,
    url: page.url(),
    snapshot,
    diff: diff || { hasChanges: false, note: "first state — no previous state to diff" },
  };

  const sanitized = redactObject(rawPayload, customRedactionPatterns);
  fs.writeFileSync(fullPath, JSON.stringify(sanitized, null, 2), "utf8");
  return { fileName, fullPath, snapshot, diff };
}

async function captureIteration({
  iteration, iterationDir, startUrl, storageState,
  testIdAttribute, hiddenSelectors, customRedactionPatterns,
  harRecording, playwright,
}) {
  fs.mkdirSync(iterationDir, { recursive: true });

  const browser = await playwright.chromium.launch({ headless: false });
  const contextOptions = storageState ? { storageState } : {};
  if (harRecording) {
    contextOptions.recordHar = {
      path: harRecording.outputPath,
      urlFilter: harRecording.urlPattern,
      mode: "minimal",
      content: "omit",
    };
  }

  const context = await browser.newContext(contextOptions);
  const page = await context.newPage();

  // Bridge: browser → Node.  Filled by toolbar clicks and mutation observer.
  const pendingSignals = [];
  await page.exposeFunction("__captureSignal", (payload) => {
    pendingSignals.push(payload);
  });

  // Inject toolbar + mutation observer before any app scripts run.
  await page.addInitScript(BROWSER_INJECT_SCRIPT);

  await page.goto(startUrl, { waitUntil: "domcontentloaded" });

  console.log(`\n▶  Iteration: ${iteration.key}`);
  if (iteration.description) console.log(`   ${iteration.description}`);
  console.log(`   URL: ${startUrl}`);
  console.log("   📸 Floating toolbar injected — type state key + click Capture in the browser.");
  console.log("   🔔 DOM mutation notifications will appear here automatically.\n");
  printHelp();

  const states = [];
  let aborted = false;
  let stateCounter = 1;
  let previousSnapshot = null;

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const askLine = (prompt) =>
    new Promise((resolve) => rl.question(prompt, (ans) => resolve(ans.trim())));

  // Shared capture logic — called from both REPL and browser toolbar.
  const doCapture = async (rawKey, source) => {
    const stateKey = safeStateKey(rawKey) || `state-${stateCounter}`;
    try {
      const result = await performCapture({
        page, stateKey, stateCounter, iterationDir,
        iterationKey: iteration.key, testIdAttribute, hiddenSelectors,
        customRedactionPatterns, previousSnapshot,
      });
      const relPath = path.relative(process.cwd(), result.fullPath).replace(/\\/g, "/");
      const capturedAt = JSON.parse(fs.readFileSync(result.fullPath, "utf8")).capturedAt;
      states.push({ id: stateKey, file: relPath, capturedAt, capturedVia: source });
      console.log(`\n  ✓ [${source}] Saved ${result.fileName}`);
      if (result.diff && result.diff.hasChanges) {
        console.log("  Δ DOM diff from previous state:");
        console.log(formatDiffSummary(result.diff));
      } else if (stateCounter > 1) {
        console.log("  (no structural changes since previous state)");
      }
      console.log("");
      previousSnapshot = result.snapshot;
      stateCounter += 1;
    } catch (error) {
      console.log(`  ✗ Capture failed: ${error.message}`);
    }
  };

  // Drain browser signals (toolbar + mutation) before / after each REPL prompt.
  const drainSignals = async () => {
    while (pendingSignals.length > 0) {
      const signal = pendingSignals.shift();
      if (signal.type === "mutation") {
        console.log(`\n  🔔 DOM change detected: ${signal.summary}`);
        console.log("  → Type  c <key>  to capture this state, or keep interacting.\n");
      }
      if (signal.type === "capture") {
        await doCapture(signal.key || `browser-${stateCounter}`, "browser-toolbar");
      }
    }
  };

  // eslint-disable-next-line no-constant-condition
  while (true) {
    await drainSignals();
    const input = await askLine(`[${iteration.key}] capture> `);
    await drainSignals();

    if (!input) continue;
    if (input === "?") { printHelp(); continue; }
    if (input === "q") { aborted = true; break; }
    if (input === "n") { break; }
    if (input === "u") { console.log(`  URL: ${page.url()}`); continue; }
    if (input === "r") {
      await page.goto(startUrl, { waitUntil: "domcontentloaded" });
      previousSnapshot = null;
      stateCounter = 1;
      console.log("  Reloaded start URL — state counter reset");
      continue;
    }
    if (input.startsWith("c ") || input === "c") {
      await doCapture(input === "c" ? "" : input.slice(2), "terminal");
      continue;
    }
    console.log(`  Unknown command: ${input} (type ? for help)`);
  }

  rl.close();
  await context.close();
  await browser.close();

  return { aborted, states };
}

module.exports = { captureIteration };

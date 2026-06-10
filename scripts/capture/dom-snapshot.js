/**
 * @fileoverview Structural DOM snapshot.
 *
 * Captures only test-relevant structure:
 *   - page metadata
 *   - headings and labels
 *   - form controls (without raw values)
 *   - test-id inventory
 *   - role inventory with accessible names
 *
 * Does NOT capture:
 *   - script/style content
 *   - cookies/storage/session data
 *   - input values, selected options, or contenteditable contents
 *   - elements matching user-supplied hidden selector list
 */

async function captureStructuredSnapshot(page, options) {
  const { testIdAttribute = "data-testid", hiddenSelectors = [] } = options || {};

  return page.evaluate(
    ({ attrName, hiddenSelectorsArg }) => {
      const normalizeText = (text) => (text || "").replace(/\s+/g, " ").trim();
      const truncate = (text, max = 160) => (text.length > max ? `${text.slice(0, max)}…` : text);

      const hidden = new Set();
      for (const selector of hiddenSelectorsArg) {
        try {
          document.querySelectorAll(selector).forEach((el) => hidden.add(el));
        } catch (error) {
          /* ignore invalid selector */
        }
      }
      const isHidden = (el) => {
        let cursor = el;
        while (cursor) {
          if (hidden.has(cursor)) return true;
          cursor = cursor.parentElement;
        }
        return false;
      };

      const inferRole = (el) => {
        const explicit = el.getAttribute("role");
        if (explicit) return explicit;
        const tag = el.tagName.toLowerCase();
        if (tag === "button") return "button";
        if (tag === "a") return el.hasAttribute("href") ? "link" : "generic";
        if (tag === "textarea") return "textbox";
        if (tag === "select") return "combobox";
        if (tag === "summary") return "button";
        if (tag === "input") {
          const type = (el.getAttribute("type") || "text").toLowerCase();
          if (["button", "submit", "reset"].includes(type)) return "button";
          if (type === "checkbox") return "checkbox";
          if (type === "radio") return "radio";
          if (["email", "password", "search", "tel", "text", "url", "number"].includes(type)) {
            return "textbox";
          }
          return `input:${type}`;
        }
        if (el.getAttribute("contenteditable") === "true") return "textbox";
        return tag;
      };

      const getAccessibleName = (el) => {
        const ariaLabel = el.getAttribute("aria-label");
        if (ariaLabel) return normalizeText(ariaLabel);
        const labelledBy = el.getAttribute("aria-labelledby");
        if (labelledBy) {
          const labelEl = document.getElementById(labelledBy);
          if (labelEl) return normalizeText(labelEl.textContent || "");
        }
        if (el.id) {
          const label = document.querySelector(`label[for="${el.id}"]`);
          if (label) return normalizeText(label.textContent || "");
        }
        return normalizeText(el.innerText || el.textContent || "");
      };

      const headings = Array.from(document.querySelectorAll("h1,h2,h3,h4,h5,h6"))
        .filter((el) => !isHidden(el))
        .map((h) => ({
          level: h.tagName.toLowerCase(),
          text: truncate(normalizeText(h.textContent || "")),
        }));

      const labels = Array.from(document.querySelectorAll("label"))
        .filter((el) => !isHidden(el))
        .map((label) => ({
          for: label.getAttribute("for"),
          text: truncate(normalizeText(label.textContent || "")),
        }));

      const formControls = Array.from(document.querySelectorAll("input,textarea,select,button"))
        .filter((el) => !isHidden(el))
        .map((el) => ({
          tag: el.tagName.toLowerCase(),
          type: el.getAttribute("type") || null,
          id: el.id || null,
          name: el.getAttribute("name") || null,
          placeholder: el.getAttribute("placeholder") || null,
          ariaLabel: el.getAttribute("aria-label") || null,
          disabled: Boolean(el.disabled),
          required: el.hasAttribute("required"),
          testId: el.getAttribute(attrName) || null,
        }));

      const testIdEls = Array.from(document.querySelectorAll(`[${attrName}]`))
        .filter((el) => !isHidden(el))
        .map((el) => ({
          tag: el.tagName.toLowerCase(),
          testId: el.getAttribute(attrName),
          text: truncate(normalizeText(el.textContent || ""), 120),
        }));

      const uniqueTestIds = Array.from(
        new Set(testIdEls.map((entry) => entry.testId).filter(Boolean)),
      ).sort();

      const roleSelector =
        '[role],button,a,input,select,textarea,summary,[contenteditable="true"]';
      const roleMap = new Map();
      Array.from(document.querySelectorAll(roleSelector))
        .filter((el) => !isHidden(el))
        .forEach((el) => {
          const role = inferRole(el);
          const list = roleMap.get(role) || [];
          if (list.length >= 25) return;
          list.push({
            name: truncate(getAccessibleName(el), 120),
            testId: el.getAttribute(attrName) || null,
            tag: el.tagName.toLowerCase(),
          });
          roleMap.set(role, list);
        });
      const roleInventory = Array.from(roleMap.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .reduce((acc, [role, samples]) => {
          acc[role] = { count: samples.length, samples };
          return acc;
        }, {});

      return {
        page: { url: location.href, title: document.title },
        headings,
        labels,
        formControls,
        testIds: testIdEls,
        uniqueTestIds,
        roleInventory,
      };
    },
    { attrName: testIdAttribute, hiddenSelectorsArg: hiddenSelectors },
  );
}

module.exports = { captureStructuredSnapshot };

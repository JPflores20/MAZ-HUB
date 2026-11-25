/**
 * @fileoverview Post-build static HTML sanitizer for Firebase Hosting strict CSP.
 * Externalizes inline `<script>` blocks from TanStack Start's `_shell.html` into
 * static `/assets/boot-*.js` files so `script-src 'self'` enforces zero `'unsafe-inline'`,
 * and copies `_shell.html` to `index.html`.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const CLIENT_DIST_DIR = path.resolve("dist/client");
const ASSETS_DIR = path.join(CLIENT_DIST_DIR, "assets");
const SHELL_HTML_PATH = path.join(CLIENT_DIST_DIR, "_shell.html");
const INDEX_HTML_PATH = path.join(CLIENT_DIST_DIR, "index.html");

const INLINE_SCRIPT_REGEX = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
const SRC_ATTRIBUTE_REGEX = /\bsrc\s*=/i;

/**
 * Extracts inline `<script>` blocks into external hashed JS modules under `dist/client/assets`
 * so the resulting HTML satisfies a strict `script-src 'self'` CSP without `'unsafe-inline'`.
 */
function externalize_inline_scripts(html_content) {
  fs.mkdirSync(ASSETS_DIR, { recursive: true });
  let extracted_count = 0;

  const sanitized_html = html_content.replace(
    INLINE_SCRIPT_REGEX,
    (full_match, raw_attributes, script_body) => {
      const trimmed_body = script_body.trim();
      if (SRC_ATTRIBUTE_REGEX.test(raw_attributes) || !trimmed_body) {
        return full_match;
      }

      const content_hash = crypto
        .createHash("sha256")
        .update(trimmed_body, "utf8")
        .digest("hex")
        .slice(0, 12);
      const asset_filename = `boot-${content_hash}.js`;
      const asset_output_path = path.join(ASSETS_DIR, asset_filename);

      fs.writeFileSync(asset_output_path, trimmed_body, "utf8");
      extracted_count += 1;

      const normalized_attrs = raw_attributes.trim();
      const attr_prefix = normalized_attrs ? ` ${normalized_attrs}` : "";
      return `<script${attr_prefix} src="/assets/${asset_filename}"></script>`;
    },
  );

  return { sanitized_html, extracted_count };
}

if (!fs.existsSync(SHELL_HTML_PATH)) {
  console.error("Warning: dist/client/_shell.html not found.");
  process.exit(0);
}

const raw_shell_html = fs.readFileSync(SHELL_HTML_PATH, "utf8");
const { sanitized_html, extracted_count } = externalize_inline_scripts(raw_shell_html);

fs.writeFileSync(SHELL_HTML_PATH, sanitized_html, "utf8");
fs.writeFileSync(INDEX_HTML_PATH, sanitized_html, "utf8");
console.log(
  `Externalized ${extracted_count} inline script(s) and wrote dist/client/index.html for strict CSP static hosting!`,
);

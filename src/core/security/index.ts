/**
 * Barrel público del módulo de seguridad cliente (`src/core/security`).
 */
export { sanitize_rich_text_html } from "./html_sanitizer";
export {
  sanitize_external_url,
  open_safe_external_url,
  type SafeUrlOptions,
} from "./url_validator";
export {
  sanitize_spreadsheet_cell,
  sanitize_rows_for_spreadsheet,
} from "./spreadsheet_sanitizer";

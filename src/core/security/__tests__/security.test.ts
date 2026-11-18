/**
 * Pruebas unitarias y adversariales para sanitización HTML (DOMPurify),
 * validación de URLs seguras y prevención de inyección de fórmulas Excel/CSV.
 */
import { describe, it, expect } from "vitest";
import {
  sanitize_rich_text_html,
  sanitize_external_url,
  sanitize_spreadsheet_cell,
  sanitize_rows_for_spreadsheet,
} from "../index";

describe("sanitize_rich_text_html (Zero Trust XSS)", () => {
  it("elimina etiquetas script, iframe, svg, img y manejadores inline maliciosos", () => {
    const cargas_maliciosas = [
      `<p>Texto seguro</p><script>alert('xss')</script>`,
      `<img src="x" onerror="fetch('https://evil.test')" /><b>Importante</b>`,
      `<svg onload="alert(1)"><circle /></svg><i>Detalle</i>`,
      `<iframe src="https://evil.test"></iframe>`,
      `<a href="javascript:alert(1)">Clic aquí</a>`,
      `<div onclick="alert(1)" data-secret="token">Contenido</div>`,
    ];

    for (const carga_actual of cargas_maliciosas) {
      const html_limpio = sanitize_rich_text_html(carga_actual);
      expect(html_limpio).not.toMatch(/<script/i);
      expect(html_limpio).not.toMatch(/<img/i);
      expect(html_limpio).not.toMatch(/<svg/i);
      expect(html_limpio).not.toMatch(/<iframe/i);
      expect(html_limpio).not.toMatch(/onerror/i);
      expect(html_limpio).not.toMatch(/onload/i);
      expect(html_limpio).not.toMatch(/onclick/i);
      expect(html_limpio).not.toMatch(/javascript:/i);
      expect(html_limpio).not.toMatch(/data-secret/i);
    }
  });

  it("conserva el formato enriquecido permitido (negritas, cursivas y listas)", () => {
    const html_entrada = `<p><b>Causa</b> y <i>efecto</i></p><ul><li>Punto 1</li></ul><ol><li>Paso A</li></ol>`;
    const html_limpio = sanitize_rich_text_html(html_entrada);
    expect(html_limpio).toContain("<b>Causa</b>");
    expect(html_limpio).toContain("<i>efecto</i>");
    expect(html_limpio).toContain("<ul><li>Punto 1</li></ul>");
    expect(html_limpio).toContain("<ol><li>Paso A</li></ol>");
  });
});

describe("sanitize_external_url (Anti-XSS / Protocol Allowlist)", () => {
  it("acepta URLs https/http válidas y data URI multimedia segura solo cuando se habilita", () => {
    expect(sanitize_external_url("https://firebasestorage.googleapis.com/v0/b/app/o/f.png")).toBe(
      "https://firebasestorage.googleapis.com/v0/b/app/o/f.png",
    );
    expect(sanitize_external_url("http://intranet.gmodelo.com.mx/doc.pdf")).toBe(
      "http://intranet.gmodelo.com.mx/doc.pdf",
    );

    const carga_png_base64 = "data:image/png;base64,iVBORw0KGgo=";
    expect(sanitize_external_url(carga_png_base64)).toBeNull();
    expect(sanitize_external_url(carga_png_base64, { allowDataMedia: true })).toBe(carga_png_base64);
  });

  it("rechaza javascript:, vbscript:, data:text/html, SVG y caracteres de control", () => {
    const urls_maliciosas = [
      "javascript:alert(document.cookie)",
      "  JaVaScRiPt:alert(1)",
      "java\u0000script:alert(1)",
      "vbscript:msgbox(1)",
      "data:text/html,<script>alert(1)</script>",
      "data:image/svg+xml;base64,PHN2ZyBvbmxvYWQ9ImFsZXJ0KDEpIi8+",
      "file:///etc/passwd",
      "ftp://example.com/a",
      "not a url",
      "",
    ];

    for (const url_maliciosa of urls_maliciosas) {
      expect(sanitize_external_url(url_maliciosa, { allowDataMedia: false })).toBeNull();
      expect(sanitize_external_url(url_maliciosa, { allowDataMedia: true })).toBeNull();
    }
  });
});

describe("sanitize_spreadsheet_cell & sanitize_rows_for_spreadsheet (Anti CSV/Formula Injection)", () => {
  it("neutraliza prefijos de fórmulas (=, +, -, @, tab, CR) anteponiendo comilla simple", () => {
    expect(sanitize_spreadsheet_cell("=CMD|' /C calc'!A0")).toBe("'=CMD|' /C calc'!A0");
    expect(sanitize_spreadsheet_cell("+SUM(A1:A2)")).toBe("'+SUM(A1:A2)");
    expect(sanitize_spreadsheet_cell("-1+1")).toBe("'-1+1");
    expect(sanitize_spreadsheet_cell("@SUM(1+1)*cmd")).toBe("'@SUM(1+1)*cmd");
    expect(sanitize_spreadsheet_cell("\t=1+1")).toBe("'\t=1+1");
    expect(sanitize_spreadsheet_cell("\r=1+1")).toBe("'\r=1+1");
    expect(sanitize_spreadsheet_cell('   =HYPERLINK("https://evil.test")')).toBe(
      '\'   =HYPERLINK("https://evil.test")',
    );
  });

  it("deja intactos valores seguros y sanitiza todas las propiedades de cada fila", () => {
    const filas_seguras = sanitize_rows_for_spreadsheet([
      {
        titulo: "=2+2",
        responsable: "Ana López",
        progreso: 85,
        completado: true,
        vacio: null,
      },
    ]);

    expect(filas_seguras).toEqual([
      {
        titulo: "'=2+2",
        responsable: "Ana López",
        progreso: 85,
        completado: "Sí",
        vacio: "",
      },
    ]);
  });
});

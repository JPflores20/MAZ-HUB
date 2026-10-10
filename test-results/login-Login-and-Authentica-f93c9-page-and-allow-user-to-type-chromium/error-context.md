# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: login.spec.ts >> Login and Authentication Flow >> should show login page and allow user to type
- Location: tests\e2e\login.spec.ts:4:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('input[type="email"]')
Expected: visible
Error: strict mode violation: locator('input[type="email"]') resolved to 2 elements:
    1) <input value="" required="" type="email" id="loginEmail" placeholder="ana.lopez@gmodelo.com.mx" data-tsd-source="/src/components/auth/login_form.tsx:74:13" class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opac…/> aka getByRole('textbox', { name: 'CORREO ELECTRÓNICO', exact: true })
    2) <input value="" required="" type="email" id="regEmail" placeholder="correo@gmodelo.com.mx" data-tsd-source="/src/components/auth/register_form.tsx:178:13" class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opaci…/> aka getByRole('textbox', { name: 'CORREO ELECTRÓNICO CORPORATIVO *' })

Call log:
  - Expect "toBeVisible" locator('input[type="email"]') with timeout 5000ms
  - waiting for locator('input[type="email"]')

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - generic [ref=e3]:
    - generic [ref=e5]:
      - generic [ref=e6]:
        - img "Logo MAZ" [ref=e7]
        - heading "MAZ HUB" [level=1] [ref=e8]
        - paragraph [ref=e9]: Módulo PDCA de Mejora Continua
      - generic [ref=e10]:
        - generic [ref=e11]:
          - text: CORREO ELECTRÓNICO
          - textbox "CORREO ELECTRÓNICO" [ref=e16]:
            - /placeholder: ana.lopez@gmodelo.com.mx
        - generic [ref=e17]:
          - generic [ref=e18]: CONTRASEÑA
          - generic [ref=e20]:
            - textbox "CONTRASEÑA" [ref=e24]:
              - /placeholder: ••••••••
            - button [ref=e25]
        - button "Ingresar a mi cuenta" [ref=e29] [cursor=pointer]
        - link "¿Olvidaste tu contraseña?" [ref=e31] [cursor=pointer]:
          - /url: /forgot-password
      - paragraph [ref=e33]: © 2026 Grupo Modelo. Todos los derechos reservados.
    - generic:
      - generic:
        - generic:
          - generic:
            - img "Logo"
          - heading "Registro de Colaborador" [level=1]
          - paragraph: Ingresa tus datos oficiales para solicitar acceso a MAZ HUB.
        - generic:
          - generic:
            - heading "Datos Personales" [level=3]
            - generic:
              - generic:
                - text: NOMBRE(S) *
                - textbox "NOMBRE(S) *":
                  - /placeholder: Ej. ANA MARIA
              - generic:
                - text: APELLIDO PATERNO *
                - textbox "APELLIDO PATERNO *":
                  - /placeholder: LOPEZ
              - generic:
                - text: APELLIDO MATERNO
                - textbox "APELLIDO MATERNO":
                  - /placeholder: HERNANDEZ
          - generic:
            - heading "Credenciales" [level=3]
            - generic:
              - text: CORREO ELECTRÓNICO CORPORATIVO *
              - textbox "CORREO ELECTRÓNICO CORPORATIVO *":
                - /placeholder: correo@gmodelo.com.mx
            - generic:
              - generic:
                - text: CONTRASEÑA *
                - generic:
                  - textbox "CONTRASEÑA *":
                    - /placeholder: ••••••••
                  - button
              - generic:
                - text: CONFIRMAR *
                - generic:
                  - textbox "CONFIRMAR *":
                    - /placeholder: ••••••••
                  - button
            - paragraph: Mínimo 6 caracteres, al menos una mayúscula, un número y un símbolo (!@#$%).
          - generic:
            - button "Crear Mi Cuenta"
  - generic [ref=e34]:
    - generic [ref=e35]:
      - generic [ref=e36]:
        - paragraph [ref=e37]: Programa de Excelencia
        - heading "TRANSFORMANDO EL FUTURO CON MEJORA CONTINUA." [level=2] [ref=e38]: TRANSFORMANDO ELFUTURO CONMEJORA CONTINUA.
        - paragraph [ref=e39]: Aplica la metodología Plan-Do-Check-Act para estandarizar procesos, reducir mermas y potenciar tu desarrollo dentro de Grupo Modelo.
        - generic [ref=e40]:
          - paragraph [ref=e41]: ¿Eres nuevo en la plataforma?
          - button "Regístrate aquí" [ref=e42] [cursor=pointer]
      - generic [ref=e43]:
        - generic [ref=e44]: AB InBev
        - generic [ref=e45]: •
        - generic [ref=e46]: Grupo Modelo
    - generic:
      - generic:
        - paragraph: Cultura MAZ
        - heading "ÚNETE AL EQUIPO QUE LIDERA EL CAMBIO." [level=2]: ÚNETE AL EQUIPOQUE LIDERA ELCAMBIO.
        - paragraph: Regístrate para obtener acceso al Módulo PDCA. Al crear tu cuenta, tu identidad corporativa será resguardada bajo los más altos estándares de seguridad.
        - generic:
          - paragraph: ¿Ya tienes una cuenta?
          - button "Iniciar Sesión"
      - generic:
        - generic: Cervecería Zacatecas
        - generic: •
        - generic: Mejora Continua
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | 
  3  | test.describe("Login and Authentication Flow", () => {
  4  |   test("should show login page and allow user to type", async ({ page }) => {
  5  |     await page.goto("/login");
  6  |     
  7  |     // Check if the login form is visible
  8  |     const emailInput = page.locator('input[type="email"]');
  9  |     const passwordInput = page.locator('input[type="password"]');
  10 |     
> 11 |     await expect(emailInput).toBeVisible();
     |                              ^ Error: expect(locator).toBeVisible() failed
  12 |     await expect(passwordInput).toBeVisible();
  13 |     
  14 |     // Simulate user typing
  15 |     await emailInput.fill("test@maz-hub.com");
  16 |     await passwordInput.fill("password123");
  17 |     
  18 |     // We don't click submit here to avoid hitting real Firebase in E2E without mocks
  19 |     // But we check that the button exists
  20 |     const submitButton = page.locator('button[type="submit"]');
  21 |     await expect(submitButton).toBeVisible();
  22 |   });
  23 | });
  24 | 
```
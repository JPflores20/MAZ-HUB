# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: navigation.spec.ts >> Authentication Flow >> should show error on invalid login
- Location: tests\e2e\navigation.spec.ts:15:3

# Error details

```
Error: locator.fill: Error: strict mode violation: getByPlaceholder('••••••••') resolved to 3 elements:
    1) <input value="" required="" type="password" id="loginPassword" placeholder="••••••••" data-tsd-source="/src/components/auth/login_form.tsx:92:13" class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:…/> aka getByRole('textbox', { name: 'CONTRASEÑA', exact: true })
    2) <input value="" required="" type="password" id="regPassword" placeholder="••••••••" data-tsd-source="/src/components/auth/register_form.tsx:194:17" class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 m…/> aka getByRole('textbox', { name: 'CONTRASEÑA *' })
    3) <input value="" required="" type="password" id="confirmPassword" placeholder="••••••••" data-tsd-source="/src/components/auth/register_form.tsx:223:17" class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-…/> aka getByRole('textbox', { name: 'CONFIRMAR *' })

Call log:
  - waiting for getByPlaceholder('••••••••')

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
          - textbox "CORREO ELECTRÓNICO" [active] [ref=e16]:
            - /placeholder: ana.lopez@gmodelo.com.mx
            - text: test-invalid@gmodelo.com.mx
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
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Authentication Flow', () => {
  4  |   test('should display login page elements correctly', async ({ page }) => {
  5  |     await page.goto('/login');
  6  |     
  7  |     await expect(page.getByRole('heading', { name: 'MAZ HUB' })).toBeVisible();
  8  |     await expect(page.getByPlaceholder('ana.lopez@gmodelo.com.mx')).toBeVisible();
  9  |     await expect(page.getByPlaceholder('••••••••')).toBeVisible();
  10 |     // The button might not have exactly "Iniciar Sesión" since it can be "Ingresar" or something else
  11 |     const submitButton = page.locator('button[type="submit"]');
  12 |     await expect(submitButton).toBeVisible();
  13 |   });
  14 | 
  15 |   test('should show error on invalid login', async ({ page }) => {
  16 |     await page.goto('/login');
  17 |     
  18 |     await page.getByPlaceholder('ana.lopez@gmodelo.com.mx').fill('test-invalid@gmodelo.com.mx');
> 19 |     await page.getByPlaceholder('••••••••').fill('wrongpassword');
     |                                             ^ Error: locator.fill: Error: strict mode violation: getByPlaceholder('••••••••') resolved to 3 elements:
  20 |     await page.locator('button[type="submit"]').click();
  21 |     
  22 |     // We expect an error alert to show up or the button to be active again
  23 |     await expect(page.locator('button[type="submit"]')).toBeEnabled();
  24 |     await expect(page).toHaveURL(/.*login/);
  25 |   });
  26 | });
  27 | 
```
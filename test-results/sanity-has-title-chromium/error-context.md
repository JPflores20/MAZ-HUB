# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: sanity.spec.ts >> has title
- Location: tests\e2e\sanity.spec.ts:3:1

# Error details

```
Error: expect(page).toHaveTitle(expected) failed

Expected pattern: /Modelo/i
Received string:  "Iniciar Sesión · MAZ HUB"
Timeout: 5000ms

Call log:
  - Expect "toHaveTitle" with timeout 5000ms
    14 × locator resolved to <html lang="en" class="light" data-tsd-source="/src/routes/__root.tsx:122:5">…</html>
       - unexpected value "Iniciar Sesión · MAZ HUB"

```

```yaml
- img "Logo MAZ"
- heading "MAZ HUB" [level=1]
- paragraph: Módulo PDCA de Mejora Continua
- text: CORREO ELECTRÓNICO
- textbox "CORREO ELECTRÓNICO":
  - /placeholder: ana.lopez@gmodelo.com.mx
- text: CONTRASEÑA
- textbox "CONTRASEÑA":
  - /placeholder: ••••••••
- button
- button "Ingresar a mi cuenta"
- link "¿Olvidaste tu contraseña?":
  - /url: /forgot-password
- paragraph: © 2026 Grupo Modelo. Todos los derechos reservados.
- img "Logo"
- heading "Registro de Colaborador" [level=1]
- paragraph: Ingresa tus datos oficiales para solicitar acceso a MAZ HUB.
- heading "Datos Personales" [level=3]
- text: NOMBRE(S) *
- textbox "NOMBRE(S) *":
  - /placeholder: Ej. ANA MARIA
- text: APELLIDO PATERNO *
- textbox "APELLIDO PATERNO *":
  - /placeholder: LOPEZ
- text: APELLIDO MATERNO
- textbox "APELLIDO MATERNO":
  - /placeholder: HERNANDEZ
- heading "Credenciales" [level=3]
- text: CORREO ELECTRÓNICO CORPORATIVO *
- textbox "CORREO ELECTRÓNICO CORPORATIVO *":
  - /placeholder: correo@gmodelo.com.mx
- text: CONTRASEÑA *
- textbox "CONTRASEÑA *":
  - /placeholder: ••••••••
- button
- text: CONFIRMAR *
- textbox "CONFIRMAR *":
  - /placeholder: ••••••••
- button
- paragraph: Mínimo 6 caracteres, al menos una mayúscula, un número y un símbolo (!@#$%).
- button "Crear Mi Cuenta"
- paragraph: Programa de Excelencia
- heading "TRANSFORMANDO EL FUTURO CON MEJORA CONTINUA." [level=2]
- paragraph: Aplica la metodología Plan-Do-Check-Act para estandarizar procesos, reducir mermas y potenciar tu desarrollo dentro de Grupo Modelo.
- paragraph: ¿Eres nuevo en la plataforma?
- button "Regístrate aquí"
- text: AB InBev • Grupo Modelo
- paragraph: Cultura MAZ
- heading "ÚNETE AL EQUIPO QUE LIDERA EL CAMBIO." [level=2]
- paragraph: Regístrate para obtener acceso al Módulo PDCA. Al crear tu cuenta, tu identidad corporativa será resguardada bajo los más altos estándares de seguridad.
- paragraph: ¿Ya tienes una cuenta?
- button "Iniciar Sesión"
- text: Cervecería Zacatecas • Mejora Continua
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test('has title', async ({ page }) => {
  4  |   await page.goto('/');
  5  | 
  6  |   // Debería redirigir al login si no hay sesión
  7  |   await expect(page).toHaveURL(/.*login/);
> 8  |   await expect(page).toHaveTitle(/Modelo/i);
     |                      ^ Error: expect(page).toHaveTitle(expected) failed
  9  | });
  10 | 
```
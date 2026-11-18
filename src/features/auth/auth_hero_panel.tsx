/**
 * @fileoverview Animated desktop sliding brand overlay panel toggling between login and registration calls-to-action.
 */

import { Button } from "@/shared/ui/button";

interface AuthHeroPanelProps {
  is_registering: boolean;
  on_switch_mode: (register_mode: boolean) => void;
}

/**
 * Renders the branded navy sliding overlay displayed on large viewports during authentication.
 */
export function AuthHeroPanel({ is_registering, on_switch_mode }: AuthHeroPanelProps) {
  return (
    <div
      className={`hidden lg:flex absolute top-0 left-0 h-full w-1/2 bg-gradient-to-b from-[#0a1428] via-[#0f1c38] to-[#080e1e] text-white z-20 transition-transform duration-700 ease-in-out shadow-2xl items-center justify-center overflow-hidden ${is_registering ? "translate-x-0" : "translate-x-full"}`}
    >
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-black/10 rounded-full blur-3xl pointer-events-none" />

      <div
        className={`absolute inset-0 flex flex-col p-16 transition-all duration-700 ease-in-out ${is_registering ? "opacity-0 translate-x-16 pointer-events-none" : "opacity-100 translate-x-0 delay-100"}`}
      >
        <div className="flex flex-col flex-1 justify-center items-start">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80 mb-6">
            Programa de Excelencia
          </p>
          <h2 className="text-4xl xl:text-5xl font-display font-bold leading-[1.1] mb-6">
            TRANSFORMANDO EL
            <br />
            FUTURO CON
            <br />
            MEJORA CONTINUA.
          </h2>
          <p className="text-base text-white/80 max-w-md leading-relaxed">
            Aplica la metodología Plan-Do-Check-Act para estandarizar procesos, reducir mermas y
            potenciar tu desarrollo dentro de Grupo Modelo.
          </p>

          <div className="mt-12 space-y-4">
            <p className="text-sm font-medium text-white/70">¿Eres nuevo en la plataforma?</p>
            <Button
              variant="outline"
              className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white px-8"
              onClick={() => on_switch_mode(true)}
            >
              Regístrate aquí
            </Button>
          </div>
        </div>

        <div className="flex gap-4 text-sm font-medium text-white/60 pb-4">
          <span>AB InBev</span>
          <span>•</span>
          <span>Grupo Modelo</span>
        </div>
      </div>

      <div
        className={`absolute inset-0 flex flex-col p-16 transition-all duration-700 ease-in-out ${is_registering ? "opacity-100 translate-x-0 delay-100" : "opacity-0 -translate-x-16 pointer-events-none"}`}
      >
        <div className="flex flex-col flex-1 justify-center items-start">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80 mb-6">
            Cultura MAZ
          </p>
          <h2 className="text-4xl xl:text-5xl font-display font-bold leading-[1.1] mb-6">
            ÚNETE AL EQUIPO
            <br />
            QUE LIDERA EL
            <br />
            CAMBIO.
          </h2>
          <p className="text-base text-white/80 max-w-md leading-relaxed">
            Regístrate para obtener acceso al Módulo PDCA. Al crear tu cuenta, tu identidad
            corporativa será resguardada bajo los más altos estándares de seguridad.
          </p>

          <div className="mt-12 space-y-4">
            <p className="text-sm font-medium text-white/70">¿Ya tienes una cuenta?</p>
            <Button
              variant="outline"
              className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white px-8"
              onClick={() => on_switch_mode(false)}
            >
              Iniciar Sesión
            </Button>
          </div>
        </div>

        <div className="flex gap-4 text-sm font-medium text-white/60 pb-4">
          <span>Cervecería Zacatecas</span>
          <span>•</span>
          <span>Mejora Continua</span>
        </div>
      </div>
    </div>
  );
}

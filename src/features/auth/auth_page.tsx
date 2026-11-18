/**
 * @fileoverview Main unauthenticated login and self-registration page coordinator.
 */

import { useState } from "react";
import { AuthHeroPanel } from "./auth_hero_panel";
import { AuthRegistrationSuccess } from "./auth_registration_success";
import type { RegisterSuccessOptions } from "./auth_types";
import { LoginForm } from "./login_form";
import { RegisterForm } from "./register_form";

/**
 * Renders either the split login/register experience or the post-registration verification notice.
 */
export function AuthPage() {
  const [is_registering, set_is_registering] = useState(false);
  const [registration_success, set_registration_success] = useState(false);
  const [registered_email, set_registered_email] = useState("");
  const [verification_sent_ok, set_verification_sent_ok] = useState(true);
  const [verification_notice, set_verification_notice] = useState<string | null>(null);

  const handle_registration_success = (
    email: string,
    _unused_password?: string,
    options?: RegisterSuccessOptions,
  ) => {
    const was_sent = options?.verificationSent !== false;
    set_registered_email(email);
    set_verification_sent_ok(was_sent);
    set_verification_notice(was_sent ? null : options?.verificationError || null);
    set_registration_success(true);
  };

  if (registration_success) {
    return (
      <AuthRegistrationSuccess
        registered_email={registered_email}
        verification_sent_ok={verification_sent_ok}
        verification_notice={verification_notice}
        on_back_to_login={() => {
          set_registration_success(false);
          set_is_registering(false);
        }}
      />
    );
  }

  return (
    <div className="relative flex min-h-screen w-full overflow-hidden bg-background">
      <div className="absolute inset-0 flex w-full">
        <div
          className={`flex w-full lg:w-1/2 items-center justify-center transition-all duration-700 ease-in-out ${is_registering ? "-translate-x-[100%] opacity-0 pointer-events-none absolute" : "translate-x-0 opacity-100 relative z-10"}`}
        >
          <LoginForm on_switch_to_register={() => set_is_registering(true)} />
        </div>

        <div
          className={`flex w-full lg:w-1/2 items-center justify-center transition-all duration-700 ease-in-out absolute top-0 bottom-0 right-0 ${is_registering ? "opacity-100 z-10 scale-100 pointer-events-auto" : "opacity-0 z-0 scale-95 pointer-events-none"}`}
        >
          <RegisterForm
            on_switch_to_login={() => set_is_registering(false)}
            on_success={handle_registration_success}
          />
        </div>
      </div>

      <AuthHeroPanel is_registering={is_registering} on_switch_mode={set_is_registering} />
    </div>
  );
}

/**
 * @fileoverview Reusable password input field with built-in show/hide visibility toggle.
 */

import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

interface PasswordVisibilityFieldProps {
  id: string;
  label: string;
  value: string;
  on_change: (next_value: string) => void;
  is_visible: boolean;
  on_toggle_visible: () => void;
  required?: boolean | undefined;
  placeholder?: string | undefined;
  class_name?: string | undefined;
}

/**
 * Renders a labeled password field paired with a visibility toggle button.
 */
export function PasswordVisibilityField({
  id,
  label,
  value,
  on_change,
  is_visible,
  on_toggle_visible,
  required = false,
  placeholder = "••••••••",
  class_name = "",
}: PasswordVisibilityFieldProps) {
  return (
    <div className="space-y-1">
      <Label htmlFor={id} className="text-xs">
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type={is_visible ? "text" : "password"}
          required={required}
          value={value}
          onChange={(change_event) => on_change(change_event.target.value)}
          placeholder={placeholder}
          className={`pr-10 ${class_name}`.trim()}
        />
        <button
          type="button"
          onClick={on_toggle_visible}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          {is_visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
    </div>
  );
}

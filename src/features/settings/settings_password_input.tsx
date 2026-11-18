/**
 * @fileoverview Reusable DRY password input row with custom left icon and visibility toggle.
 */

import type React from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

interface SettingsPasswordInputProps {
  id: string;
  label: string;
  value: string;
  on_change: (next_value: string) => void;
  is_visible: boolean;
  on_toggle_visible: () => void;
  placeholder: string;
  icon: React.ElementType;
  wrapper_class_name?: string | undefined;
  children?: React.ReactNode | undefined;
}

/** Renders a labeled security input field with left icon, visibility eye button, and optional footer hint. */
export function SettingsPasswordInput({
  id,
  label,
  value,
  on_change,
  is_visible,
  on_toggle_visible,
  placeholder,
  icon: LeftIcon,
  wrapper_class_name = "space-y-2",
  children,
}: SettingsPasswordInputProps) {
  return (
    <div className={wrapper_class_name}>
      <Label htmlFor={id} className="text-xs font-bold uppercase tracking-wider">
        {label}
      </Label>
      <div className="relative">
        <LeftIcon className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
        <Input
          id={id}
          type={is_visible ? "text" : "password"}
          value={value}
          onChange={(change_event) => on_change(change_event.target.value)}
          placeholder={placeholder}
          className="pl-9 pr-10"
        />
        <button
          type="button"
          onClick={on_toggle_visible}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
        >
          {is_visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
      {children}
    </div>
  );
}

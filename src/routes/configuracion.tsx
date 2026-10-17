/**
 * configuracion.tsx
 * Ruta de Configuración de Usuario. Permite editar datos personales, laborales, foto de perfil/avatar y cambiar la contraseña en Firebase Auth.
 * Los administradores pueden además seleccionar y editar los datos personales de cualquier usuario registrado.
 */
import { createFileRoute } from "@tanstack/react-router";
import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  User,
  Users,
  Mail,
  Building2,
  Briefcase,
  MapPin,
  Phone,
  Lock,
  Camera,
  Trash2,
  Save,
  Shield,
  Eye,
  EyeOff,
  CheckCircle2,
  KeyRound,
  FileText,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import { sendPasswordResetEmail } from "firebase/auth";
import { toast } from "sonner";
import { primaryAuth } from "@/lib/firebase";
import { useAuth, ROLE_LABELS, type UserProfile } from "@/context/auth-context";
import { usePdcas } from "@/context/pdca-context";
import { userService } from "@/services/user-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/configuracion")({
  component: UserSettingsPage,
});

const SUGGESTED_AREAS = ["COCIMIENTOS", "BLOQUE FRIO", "ELABORACION"] as const;
const SUGGESTED_POSITIONS = ["PLANEADOR", "SUPERVISOR", "TECNICO", "GERENTE"] as const;

const SUGGESTED_PLANTS = [
  "Cervecería Zacatecas",
  "Cervecería Centro",
  "Cervecería Modelo",
  "Corporativo MAZ",
];

/**
 * Comprime y recorta una imagen cuadrada de perfil (256x256) y la transforma a formato .webp
 * para reducir al máximo su peso y almacenarla de forma óptima.
 */
async function compressAvatarImage(file: File): Promise<{ dataUrl: string; sizeKb: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const size = 256;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("No se pudo inicializar el lienzo de imagen."));
          return;
        }

        // Recorte centrado cuadrado (object-cover)
        const minSide = Math.min(img.width, img.height);
        const sx = (img.width - minSide) / 2;
        const sy = (img.height - minSide) / 2;

        ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);
        const dataUrl = canvas.toDataURL("image/webp", 0.78);
        const base64Length = dataUrl.split(",")[1]?.length || 0;
        const sizeKb = Math.max(1, Math.round((base64Length * 0.75) / 1024));
        resolve({ dataUrl, sizeKb });
      };
      img.onerror = () => reject(new Error("Archivo de imagen inválido."));
      img.src = event.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Error al leer el archivo."));
    reader.readAsDataURL(file);
  });
}

/**
 * Separa un nombre completo en Nombre(s), Apellido Paterno y Apellido Materno
 * cuando el usuario aún no tiene esos campos guardados por separado.
 */
function splitFullName(fullName: string): {
  nombre: string;
  paterno: string;
  materno: string;
} {
  const parts = fullName.trim().toUpperCase().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { nombre: "", paterno: "", materno: "" };
  if (parts.length === 1) return { nombre: parts[0] || "", paterno: "", materno: "" };
  if (parts.length === 2) {
    return { nombre: parts[0] || "", paterno: parts[1] || "", materno: "" };
  }
  const materno = parts[parts.length - 1] || "";
  const paterno = parts[parts.length - 2] || "";
  const nombre = parts.slice(0, -2).join(" ");
  return { nombre, paterno, materno };
}

function getUserNameParts(user: UserProfile | null | undefined): {
  nombre: string;
  paterno: string;
  materno: string;
} {
  if (!user) return { nombre: "", paterno: "", materno: "" };
  if (user.firstName || user.paternalLastName || user.maternalLastName) {
    return {
      nombre: (user.firstName || "").toUpperCase(),
      paterno: (user.paternalLastName || "").toUpperCase(),
      materno: (user.maternalLastName || "").toUpperCase(),
    };
  }
  return splitFullName(user.name || "");
}

function UserSettingsPage() {
  const { currentUser, mockUsers, updateUserProfile, changePassword, sendPasswordReset } =
    useAuth();
  const { allPdcas } = usePdcas();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = currentUser?.role === "admin";
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [selectedUid, setSelectedUid] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const paramUid = new URLSearchParams(window.location.search).get("uid");
      if (paramUid) return paramUid;
    }
    return currentUser?.uid || "";
  });

  // Suscripción a todos los usuarios cuando el usuario activo es administrador
  useEffect(() => {
    if (!isAdmin) return;
    const unsub = userService.subscribeToUsers(
      (users) => {
        setUsersList(users);
      },
      (err) => {
        console.error("Error al obtener lista de usuarios en configuración:", err);
      },
    );
    return () => unsub();
  }, [isAdmin]);

  // Asegurar que selectedUid tenga un valor válido cuando cargue currentUser
  useEffect(() => {
    if (!currentUser) return;
    if (typeof window !== "undefined") {
      const paramUid = new URLSearchParams(window.location.search).get("uid");
      if (paramUid && isAdmin) {
        setSelectedUid(paramUid);
        return;
      }
    }
    if (!selectedUid || !isAdmin) {
      setSelectedUid(currentUser.uid);
    }
  }, [currentUser, isAdmin]);

  // Lista combinada de usuarios disponibles para que el admin seleccione
  const availableUsers = useMemo(() => {
    if (!currentUser) return [];
    const base = usersList.length > 0 ? usersList : mockUsers;
    const map = new Map<string, UserProfile>();
    map.set(currentUser.uid, currentUser);
    for (const u of base) {
      if (u.uid === currentUser.uid) {
        map.set(u.uid, { ...u, ...currentUser });
      } else {
        map.set(u.uid, u);
      }
    }
    return Array.from(map.values()).sort((a, b) =>
      (a.name || "").localeCompare(b.name || "", "es", { sensitivity: "base" }),
    );
  }, [currentUser, usersList, mockUsers]);

  // Usuario objetivo cuyos datos se están editando
  const targetUser = useMemo<UserProfile | null>(() => {
    if (!currentUser) return null;
    if (!isAdmin || !selectedUid || selectedUid === currentUser.uid) {
      return currentUser;
    }
    return availableUsers.find((u) => u.uid === selectedUid) || currentUser;
  }, [currentUser, isAdmin, selectedUid, availableUsers]);

  const isEditingOtherUser = Boolean(
    isAdmin && currentUser && targetUser && targetUser.uid !== currentUser.uid,
  );

  const initialNameParts = useMemo(() => getUserNameParts(targetUser), [targetUser]);

  // Estado de datos personales y laborales
  const [nombre, setNombre] = useState(initialNameParts.nombre);
  const [paterno, setPaterno] = useState(initialNameParts.paterno);
  const [materno, setMaterno] = useState(initialNameParts.materno);
  const [area, setArea] = useState(targetUser?.area || "");
  const [position, setPosition] = useState(targetUser?.position || "");
  const [plant, setPlant] = useState(targetUser?.plant || "Cervecería Zacatecas");
  const [phone, setPhone] = useState(targetUser?.phone || "");
  const [bio, setBio] = useState(targetUser?.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(targetUser?.avatarUrl || "");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Estado de cambio de contraseña
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);

  useEffect(() => {
    if (targetUser) {
      const parts = getUserNameParts(targetUser);
      setNombre(parts.nombre);
      setPaterno(parts.paterno);
      setMaterno(parts.materno);
      setArea(targetUser.area || "");
      setPosition(targetUser.position || "");
      setPlant(targetUser.plant || "Cervecería Zacatecas");
      setPhone(targetUser.phone || "");
      setBio(targetUser.bio || "");
      setAvatarUrl(targetUser.avatarUrl || "");
    }
  }, [targetUser]);

  const fullName = useMemo(
    () =>
      [nombre.trim(), paterno.trim(), materno.trim()]
        .filter(Boolean)
        .join(" ")
        .toUpperCase(),
    [nombre, paterno, materno],
  );

  const isAxelGuillen = useMemo(() => {
    const normalize = (str: string) =>
      str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toUpperCase();
    const candidateName = normalize(`${fullName} ${targetUser?.name || ""}`);
    const candidateEmail = normalize(targetUser?.email || "");
    return (
      (candidateName.includes("AXEL") && candidateName.includes("GUILLEN")) ||
      (candidateEmail.includes("AXEL") && candidateEmail.includes("GUILLEN"))
    );
  }, [fullName, targetUser?.name, targetUser?.email]);

  const userInitials = useMemo(() => {
    const baseName = fullName || targetUser?.name || "U";
    return baseName
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  }, [fullName, targetUser?.name]);

  const userPdcasCount = useMemo(() => {
    if (!targetUser) return 0;
    const emailLower = targetUser.email.toLowerCase();
    return allPdcas.filter(
      (p) =>
        p.autorEmail?.toLowerCase() === emailLower ||
        p.autor?.toLowerCase() === targetUser.name.toLowerCase() ||
        p.asignados?.some((u) => u.email.toLowerCase() === emailLower),
    ).length;
  }, [allPdcas, targetUser]);

  const hasProfileChanges = useMemo(() => {
    if (!targetUser) return false;
    return (
      fullName !== (targetUser.name || "").trim().toUpperCase() ||
      nombre.trim() !== initialNameParts.nombre ||
      paterno.trim() !== initialNameParts.paterno ||
      materno.trim() !== initialNameParts.materno ||
      area.trim() !== (targetUser.area || "") ||
      position.trim() !== (targetUser.position || "") ||
      plant.trim() !== (targetUser.plant || "Cervecería Zacatecas") ||
      phone.trim() !== (targetUser.phone || "") ||
      bio.trim() !== (targetUser.bio || "") ||
      avatarUrl !== (targetUser.avatarUrl || "")
    );
  }, [
    targetUser,
    fullName,
    nombre,
    paterno,
    materno,
    initialNameParts,
    area,
    position,
    plant,
    phone,
    bio,
    avatarUrl,
  ]);

  const handleUppercase =
    (setter: React.Dispatch<React.SetStateAction<string>>) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(e.target.value.toUpperCase());
    };

  const passwordStrength = useMemo(() => {
    if (!newPassword) return { score: 0, label: "", color: "bg-muted" };
    let score = 0;
    if (newPassword.length >= 6) score += 1;
    if (newPassword.length >= 10) score += 1;
    if (/[A-Z]/.test(newPassword) && /[0-9]/.test(newPassword)) score += 1;
    if (/[^A-Za-z0-9]/.test(newPassword)) score += 1;

    if (score <= 1) return { score: 1, label: "Débil", color: "bg-red-500" };
    if (score === 2) return { score: 2, label: "Media", color: "bg-amber-500" };
    return { score: 3, label: "Fuerte", color: "bg-emerald-500" };
  }, [newPassword]);

  if (!currentUser || !targetUser) return null;

  const saveTargetUserData = async (
    data: Partial<Omit<UserProfile, "uid" | "email" | "role">>,
  ) => {
    if (!isEditingOtherUser) {
      await updateUserProfile(data);
    } else {
      await userService.updateUserProfile(targetUser.uid, data);
      setUsersList((prev) =>
        prev.map((u) => (u.uid === targetUser.uid ? { ...u, ...data } : u)),
      );
    }
  };

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Por favor selecciona un archivo de imagen válido (JPG, PNG, WebP).");
      return;
    }

    try {
      const { dataUrl, sizeKb } = await compressAvatarImage(file);
      setAvatarUrl(dataUrl);
      await saveTargetUserData({ avatarUrl: dataUrl });
      toast.success(
        isEditingOtherUser
          ? `Foto de ${fullName || targetUser.name} transformada a .webp (${sizeKb} KB) y guardada.`
          : `Foto transformada a .webp (${sizeKb} KB) y guardada en tu perfil.`,
      );
    } catch (err: any) {
      toast.error(err?.message || "No se pudo procesar la imagen.");
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !paterno.trim()) {
      toast.error("Por favor ingresa al menos Nombre(s) y Apellido Paterno.");
      return;
    }
    if (!area.trim()) {
      toast.error("Por favor indica el Área o Departamento.");
      return;
    }

    setIsSavingProfile(true);
    try {
      await saveTargetUserData({
        name: fullName,
        firstName: nombre.trim().toUpperCase(),
        paternalLastName: paterno.trim().toUpperCase(),
        maternalLastName: materno.trim().toUpperCase(),
        area: area.trim(),
        position: position.trim(),
        plant: plant.trim(),
        phone: phone.trim(),
        bio: bio.trim(),
        avatarUrl,
      });
      toast.success(
        isEditingOtherUser
          ? `Los datos personales de ${fullName} han sido actualizados correctamente.`
          : "Tus datos personales han sido actualizados correctamente.",
      );
    } catch (err: any) {
      console.error("Error al guardar perfil:", err);
      toast.error(err?.message || "No se pudieron guardar los cambios en la nube.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error("Ingresa tu contraseña actual para confirmar tu identidad.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("La nueva contraseña y su confirmación no coinciden.");
      return;
    }

    setIsChangingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("¡Contraseña actualizada exitosamente!");
    } catch (err: any) {
      console.error("Error al cambiar contraseña:", err);
      if (
        err?.code === "auth/wrong-password" ||
        err?.code === "auth/invalid-credential"
      ) {
        toast.error("La contraseña actual que ingresaste es incorrecta.");
      } else if (err?.code === "auth/weak-password") {
        toast.error("La nueva contraseña es demasiado débil (mínimo 6 caracteres).");
      } else if (err?.code === "auth/requires-recent-login") {
        toast.error("Por seguridad, cierra sesión y vuelve a entrar antes de cambiar tu contraseña.");
      } else {
        toast.error(err?.message || "Error al actualizar la contraseña.");
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSendResetEmail = async () => {
    setIsSendingReset(true);
    try {
      if (isEditingOtherUser) {
        await sendPasswordResetEmail(primaryAuth, targetUser.email);
      } else {
        await sendPasswordReset();
      }
      toast.success(`Se envió un enlace de restablecimiento a ${targetUser.email}`);
    } catch (err: any) {
      toast.error(err?.message || "No se pudo enviar el correo de restablecimiento.");
    } finally {
      setIsSendingReset(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1400px] px-6 py-8 sm:px-10 lg:px-12 space-y-8">
      {/* Encabezado de la página */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            {isEditingOtherUser ? " Administración de Perfiles · MAZ HUB" : "Mi Cuenta · MAZ HUB"}
          </p>
          <h1 className="mt-1 text-3xl font-bold uppercase tracking-tight text-foreground">
            Configuración de Usuario
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isEditingOtherUser
              ? `Editando como administrador los datos personales y de planta de ${targetUser.name}.`
              : "Administra tu información personal, datos de planta, foto de perfil y seguridad de acceso."}
          </p>
        </div>
        {hasProfileChanges && (
          <span className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/30 px-3.5 py-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
            <Sparkles className="size-3.5" />
            Tienes cambios sin guardar en este perfil
          </span>
        )}
      </header>

      {/* Selector de Usuario exclusivo para Administradores */}
      {isAdmin && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
              <Users className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  Modo Administrador
                </span>
                {isEditingOtherUser && (
                  <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-700 dark:text-amber-300">
                    Editando a otro usuario
                  </span>
                )}
              </div>
              <p className="text-sm font-medium text-foreground mt-0.5">
                Selecciona cualquier usuario registrado para consultar o modificar sus datos personales:
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="w-full sm:w-80">
              <Select value={targetUser.uid} onValueChange={(uid) => setSelectedUid(uid)}>
                <SelectTrigger className="bg-card border-border">
                  <SelectValue placeholder="Selecciona un usuario" />
                </SelectTrigger>
                <SelectContent>
                  {availableUsers.map((u) => (
                    <SelectItem key={u.uid} value={u.uid}>
                      <span className="font-semibold uppercase">{u.name}</span>{" "}
                      <span className="text-xs text-muted-foreground">
                        ({u.uid === currentUser.uid ? "Tú" : u.area || u.email})
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isEditingOtherUser && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedUid(currentUser.uid)}
                className="gap-1.5 text-xs shrink-0"
              >
                <RotateCcw className="size-3.5" />
                Volver a mi perfil
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Columna Izquierda: Tarjeta de Resumen e Identidad */}
        <div className="lg:col-span-4 space-y-6">
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
            {/* Banner superior corporativo */}
            <div className="h-28 bg-gradient-to-r from-[#0a1428] via-[#13284c] to-[#0f1c38] relative">
              <div className="absolute right-4 top-4">
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-sm ${
                    targetUser.role === "admin"
                      ? "bg-amber-400/20 text-amber-300 border border-amber-400/40"
                      : "bg-blue-500/20 text-blue-200 border border-blue-400/30"
                  }`}
                >
                  <Shield className="size-3.5" />
                  {ROLE_LABELS[targetUser.role] || "Usuario General"}
                </span>
              </div>
            </div>

            <div className="px-6 pb-6">
              {/* Avatar con botón de cámara */}
              <div className="relative -mt-14 mb-4 flex items-end justify-between">
                <div className="relative group">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={fullName || targetUser.name}
                      className="size-28 rounded-2xl object-cover border-4 border-card shadow-xl bg-secondary"
                    />
                  ) : (
                    <div className="flex size-28 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 text-3xl font-bold text-white border-4 border-card shadow-xl">
                      {userInitials}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    title="Cambiar foto de perfil"
                    className="absolute -bottom-2 -right-2 flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer border-2 border-card"
                  >
                    <Camera className="size-4" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleAvatarFileChange}
                  />
                </div>

                {avatarUrl && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setAvatarUrl("")}
                    className="text-xs text-muted-foreground hover:text-destructive gap-1.5 h-8"
                  >
                    <Trash2 className="size-3.5" />
                    Quitar foto
                  </Button>
                )}
              </div>

              {/* Datos resumidos */}
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-foreground truncate uppercase">
                  {fullName || targetUser.name}
                </h2>
                <p className="text-sm font-medium text-primary">
                  {position || "Integrante VPO"} · {area || targetUser.area}
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5 pt-1">
                  <MapPin className="size-3.5 shrink-0 text-muted-foreground/70" />
                  {plant || "Cervecería Zacatecas"}
                </p>
              </div>

              {bio && (
                <p className="mt-4 text-xs text-muted-foreground bg-secondary/50 rounded-xl p-3 border border-border/60 leading-relaxed">
                  {bio}
                </p>
              )}

              <div className="mt-6 pt-5 border-t border-border space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Mail className="size-3.5" />
                    Correo
                  </span>
                  <span className="font-medium text-foreground truncate max-w-[200px]">
                    {targetUser.email}
                  </span>
                </div>
                {phone && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Phone className="size-3.5" />
                      Contacto
                    </span>
                    <span className="font-medium text-foreground">{phone}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <FileText className="size-3.5" />
                    Proyectos PDCA vinculados
                  </span>
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 font-bold text-primary">
                    {userPdcasCount}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Formularios de Edición */}
        <div className="lg:col-span-8 space-y-8">
          {/* Tarjeta 1: Datos Personales y Laborales */}
          <form
            onSubmit={handleSaveProfile}
            className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-[var(--shadow-card)] space-y-6"
          >
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <User className="size-5" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-bold uppercase tracking-wide">
                    Información Personal y de Planta
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {isEditingOtherUser
                      ? `Modificando como administrador los datos personales de ${targetUser.name}.`
                      : "Estos datos se mostrarán como autor o participante en tus proyectos PDCA y RDAs."}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {/* Nombre(s) */}
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="profile-nombre" className="text-xs font-bold uppercase tracking-wider">
                  NOMBRE(S) *
                </Label>
                <Input
                  id="profile-nombre"
                  value={nombre}
                  onChange={handleUppercase(setNombre)}
                  placeholder="Ej. ANA MARIA"
                  className="uppercase"
                  required
                />
              </div>

              {/* Apellido Paterno */}
              <div className="space-y-2">
                <Label htmlFor="profile-paterno" className="text-xs font-bold uppercase tracking-wider">
                  APELLIDO PATERNO *
                </Label>
                <Input
                  id="profile-paterno"
                  value={paterno}
                  onChange={handleUppercase(setPaterno)}
                  placeholder="LOPEZ"
                  className="uppercase"
                  required
                />
              </div>

              {/* Apellido Materno */}
              <div className="space-y-2">
                <Label htmlFor="profile-materno" className="text-xs font-bold uppercase tracking-wider">
                  APELLIDO MATERNO
                </Label>
                <Input
                  id="profile-materno"
                  value={materno}
                  onChange={handleUppercase(setMaterno)}
                  placeholder="HERNANDEZ"
                  className="uppercase"
                />
              </div>

              {/* Correo Electrónico (Solo lectura) */}
              <div className="space-y-2">
                <Label htmlFor="profile-email" className="text-xs font-bold uppercase tracking-wider">
                  Correo Corporativo
                </Label>
                <div className="relative">
                  <Mail className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    id="profile-email"
                    value={targetUser.email}
                    disabled
                    className="pl-9 bg-muted/50 text-muted-foreground cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Puesto / Cargo */}
              <div className="space-y-2">
                <Label htmlFor="profile-position" className="text-xs font-bold uppercase tracking-wider">
                  Puesto / Cargo
                </Label>
                <Select
                  value={
                    SUGGESTED_POSITIONS.includes(position.toUpperCase() as any)
                      ? position.toUpperCase()
                      : ""
                  }
                  onValueChange={(val) => setPosition(val)}
                >
                  <SelectTrigger id="profile-position" className="w-full">
                    <div className="flex items-center gap-2">
                      <Briefcase className="size-4 text-muted-foreground shrink-0" />
                      <SelectValue placeholder="Selecciona tu puesto" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {SUGGESTED_POSITIONS.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Área / Departamento */}
              <div className="space-y-2">
                <Label htmlFor="profile-area" className="text-xs font-bold uppercase tracking-wider">
                  Área / Departamento *
                </Label>
                <Select
                  value={SUGGESTED_AREAS.includes(area.toUpperCase() as any) ? area.toUpperCase() : ""}
                  onValueChange={(val) => setArea(val)}
                >
                  <SelectTrigger id="profile-area" className="w-full">
                    <div className="flex items-center gap-2">
                      <Building2 className="size-4 text-muted-foreground shrink-0" />
                      <SelectValue placeholder="Selecciona tu área" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {SUGGESTED_AREAS.map((item) => {
                      const isRestricted = item === "ELABORACION" && !isAxelGuillen;
                      return (
                        <SelectItem key={item} value={item} disabled={isRestricted}>
                          {item}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Planta / Sede */}
              <div className="space-y-2">
                <Label htmlFor="profile-plant" className="text-xs font-bold uppercase tracking-wider">
                  Planta / Sede
                </Label>
                <div className="relative">
                  <MapPin className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    id="profile-plant"
                    list="suggested-plants-list"
                    value={plant}
                    onChange={(e) => setPlant(e.target.value)}
                    placeholder="Ej. Cervecería Zacatecas"
                    className="pl-9"
                  />
                  <datalist id="suggested-plants-list">
                    {SUGGESTED_PLANTS.map((item) => (
                      <option key={item} value={item} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Teléfono / Extensión */}
              <div className="space-y-2">
                <Label htmlFor="profile-phone" className="text-xs font-bold uppercase tracking-wider">
                  Teléfono o Extensión
                </Label>
                <div className="relative">
                  <Phone className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    id="profile-phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ej. Ext. 4512 o +52 492 000 0000"
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Biografía / Especialidad */}
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="profile-bio" className="text-xs font-bold uppercase tracking-wider">
                  Acerca de mí / Especialidad VPO
                </Label>
                <Textarea
                  id="profile-bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Describe brevemente el rol en planta, pilares VPO o áreas de enfoque..."
                  rows={3}
                  className="resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
              <Button
                type="submit"
                disabled={isSavingProfile || !hasProfileChanges}
                className="gap-2 px-6 font-semibold shadow-sm"
              >
                <Save className="size-4" />
                {isSavingProfile
                  ? "Guardando cambios..."
                  : isEditingOtherUser
                    ? `Guardar Datos de ${nombre || "Usuario"}`
                    : "Guardar Datos Personales"}
              </Button>
            </div>
          </form>

          {/* Tarjeta 2: Seguridad y Cambio de Contraseña */}
          <form
            onSubmit={handleChangePassword}
            className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-[var(--shadow-card)] space-y-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Lock className="size-5" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-bold uppercase tracking-wide">
                    Seguridad y Contraseña
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {isEditingOtherUser
                      ? `Envía un enlace de restablecimiento de contraseña al correo corporativo de ${targetUser.name}.`
                      : "Actualiza tu contraseña de acceso o solicita un enlace de recuperación a tu correo."}
                  </p>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isSendingReset}
                onClick={handleSendResetEmail}
                className="text-xs gap-1.5"
              >
                <KeyRound className="size-3.5" />
                {isSendingReset
                  ? "Enviando correo..."
                  : isEditingOtherUser
                    ? `Enviar enlace a ${targetUser.email}`
                    : "Enviar enlace a mi correo"}
              </Button>
            </div>

            {!isEditingOtherUser && (
              <>
                <div className="grid gap-5 sm:grid-cols-2">
                  {/* Contraseña Actual */}
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="current-password" className="text-xs font-bold uppercase tracking-wider">
                      Contraseña Actual *
                    </Label>
                    <div className="relative">
                      <Lock className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                      <Input
                        id="current-password"
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Ingresa tu contraseña actual"
                        className="pl-9 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showCurrentPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Nueva Contraseña */}
                  <div className="space-y-2">
                    <Label htmlFor="new-password" className="text-xs font-bold uppercase tracking-wider">
                      Nueva Contraseña *
                    </Label>
                    <div className="relative">
                      <KeyRound className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                      <Input
                        id="new-password"
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                        className="pl-9 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showNewPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                    {newPassword && (
                      <div className="space-y-1 pt-1">
                        <div className="flex gap-1.5 h-1.5">
                          {[1, 2, 3].map((step) => (
                            <div
                              key={step}
                              className={`flex-1 rounded-full transition-colors ${
                                passwordStrength.score >= step ? passwordStrength.color : "bg-muted"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          Seguridad de contraseña: <strong className="text-foreground">{passwordStrength.label}</strong>
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Confirmar Nueva Contraseña */}
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-xs font-bold uppercase tracking-wider">
                      Confirmar Nueva Contraseña *
                    </Label>
                    <div className="relative">
                      <CheckCircle2 className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                      <Input
                        id="confirm-password"
                        type={showNewPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repite la nueva contraseña"
                        className="pl-9"
                      />
                    </div>
                    {confirmPassword && confirmPassword !== newPassword && (
                      <p className="text-[11px] text-destructive font-medium">
                        Las contraseñas aún no coinciden.
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
                  <Button
                    type="submit"
                    variant="secondary"
                    disabled={
                      isChangingPassword ||
                      !currentPassword ||
                      newPassword.length < 6 ||
                      newPassword !== confirmPassword
                    }
                    className="gap-2 px-6 font-semibold"
                  >
                    <Lock className="size-4" />
                    {isChangingPassword ? "Actualizando..." : "Actualizar Contraseña"}
                  </Button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

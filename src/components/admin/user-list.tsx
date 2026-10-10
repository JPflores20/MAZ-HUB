import { Shield, User, Trash2 } from "lucide-react";
import { userService } from "@/services/user-service";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import type { UserRole, UserProfile } from "@/context/auth-context";

interface UserListProps {
  users_list: UserProfile[];
  mock_users: UserProfile[];
  set_users_list: React.Dispatch<React.SetStateAction<UserProfile[]>>;
}

export function UserList({ users_list, mock_users, set_users_list }: UserListProps) {
  const display_users = users_list.length > 0 ? users_list : mock_users;

  const handle_role_change = async (uid: string, new_role: UserRole) => {
    // Actualización optimista en el estado local del componente
    set_users_list((prev) => prev.map((u) => (u.uid === uid ? { ...u, role: new_role } : u)));

    try {
      await userService.updateUserRole(uid, new_role);
      toast.success("Permiso de usuario actualizado exitosamente.");
    } catch (err: any) {
      console.error("Error al actualizar permiso:", err);
      if (err?.code === "permission-denied" || err?.message?.includes("permissions")) {
        toast.warning(
          "Rol actualizado localmente, pero Firebase bloqueó el guardado en la nube por Reglas de Firestore. Revisa tu consola de Firebase.",
          { duration: 6000 },
        );
      } else {
        toast.error("Error al actualizar rol de usuario en la base de datos.");
      }
    }
  };

  const handle_delete_user = async (uid: string, name: string) => {
    // Si se trata de un mock (aunque en prod se usa la DB real)
    if (mock_users.find((u) => u.uid === uid) && users_list.length === 0) {
      toast.info("No se puede eliminar un usuario simulado de prueba local.");
      return;
    }

    try {
      await userService.deleteUser(uid);
      toast.success(`El usuario ${name} ha sido eliminado exitosamente.`);
    } catch (err: any) {
      console.error("Error al eliminar usuario:", err);
      if (err?.code === "permission-denied") {
        toast.error("No tienes permisos suficientes en Firestore para eliminar usuarios.");
      } else {
        toast.error("Error al eliminar el usuario en la base de datos.");
      }
    }
  };

  return (
    <div className="lg:col-span-2 overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-3 border-b border-border px-6 py-4">
        <h2 className="font-display text-lg font-bold">
          Usuarios Registrados ({display_users.length})
        </h2>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="bg-secondary/80">
            <TableHead className="font-semibold text-foreground/80">NOMBRE</TableHead>
            <TableHead className="font-semibold text-foreground/80">CORREO</TableHead>
            <TableHead className="font-semibold text-foreground/80">ÁREA</TableHead>
            <TableHead className="w-40 font-semibold text-foreground/80">
              MODIFICAR PERMISOS
            </TableHead>
            <TableHead className="w-20 font-semibold text-foreground/80 text-center">
              ACCIONES
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {display_users.map((u) => (
            <TableRow key={u.uid} className="transition-colors hover:bg-secondary/30">
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <div className="flex size-7 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                  {u.name}
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">{u.email}</TableCell>
              <TableCell className="text-muted-foreground">{u.area}</TableCell>
              <TableCell>
                <Select
                  value={u.role}
                  onValueChange={(v) => handle_role_change(u.uid, v as UserRole)}
                >
                  <SelectTrigger className="h-8 w-32 text-xs font-semibold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">
                      <span className="flex items-center gap-1">
                        <User className="size-3 text-muted-foreground" /> Usuario
                      </span>
                    </SelectItem>
                    <SelectItem value="admin">
                      <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                        <Shield className="size-3" /> Admin
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell className="text-center">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
                      <AlertDialogDescription>
                        ¿Estás seguro que deseas eliminar a{" "}
                        <strong className="text-foreground">{u.name}</strong> del sistema? Esta
                        acción no se puede deshacer. Se le revocará el acceso inmediatamente.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handle_delete_user(u.uid, u.name)}
                        className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                      >
                        Eliminar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

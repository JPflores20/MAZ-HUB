/**
 * layout-types.ts
 * Tipos e interfaces compartidas para los componentes de navegación y layout.
 */
export interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  external?: boolean | undefined;
  placeholder?: boolean | undefined;
}

export interface UserContextData {
  id: string;
  uid?: string;
  email: string;
  name: string;
  area: string;
  role: "admin" | "user";
  position?: string;
  plant?: string;
  phone?: string;
  avatarUrl?: string;
  bio?: string;
}

export interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

export interface UserContextData {
  id: string;
  email: string;
  name: string;
  area: string;
  role: "admin" | "user";
}

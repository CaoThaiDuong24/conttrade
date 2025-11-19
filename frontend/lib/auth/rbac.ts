export type Role =
  | "guest"
  | "buyer"
  | "seller"
  | "depot_staff"
  | "inspector"
  | "admin";

export type Permission =
  // Listing permissions (NEW PM-XXX format)
  | "PM-001" | "PM-002" | "PM-010" | "PM-011" | "PM-012" | "PM-013" | "PM-014" | "PM-070"
  // Other permissions (keeping legacy for now)
  | "rfq.read"
  | "rfq.write"
  | "orders.read"
  | "orders.write"
  | "payments.escrow"
  | "delivery.read"
  | "delivery.write"
  | "depot.read"
  | "depot.write"
  | "reviews.write"
  | "disputes.write"
  | "admin.access";

const roleToPermissions: Record<Role, Permission[]> = {
  guest: ["PM-001", "PM-002"], // VIEW and SEARCH listings only
  buyer: ["PM-001", "PM-002", "rfq.read", "rfq.write", "orders.read", "orders.write", "payments.escrow", "delivery.read", "reviews.write", "disputes.write"],
  seller: ["PM-001", "PM-002", "PM-010", "PM-011", "PM-012", "PM-013", "PM-014", "rfq.read", "orders.read", "delivery.read", "delivery.write"],
  depot_staff: ["depot.read", "depot.write", "delivery.read", "delivery.write"],
  inspector: ["depot.read"],
  admin: ["PM-001", "PM-002", "PM-010", "PM-011", "PM-012", "PM-013", "PM-014", "PM-070", "rfq.read", "rfq.write", "orders.read", "orders.write", "payments.escrow", "delivery.read", "delivery.write", "depot.read", "depot.write", "admin.access"],
};

export function can(role: Role, permission: Permission): boolean {
  const permissions = roleToPermissions[role] ?? [];
  return permissions.includes(permission);
}



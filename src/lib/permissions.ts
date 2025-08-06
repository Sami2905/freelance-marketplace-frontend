// Define user roles
export const ROLES = {
  ADMIN: 'admin',
  CLIENT: 'client',
  FREELANCER: 'freelancer',
} as const;

type Role = typeof ROLES[keyof typeof ROLES];

// Define all possible permissions
export const PERMISSIONS = {
  // Gig related permissions
  VIEW_GIGS: 'view:gigs',
  CREATE_GIG: 'create:gig',
  EDIT_OWN_GIG: 'edit:own_gig',
  DELETE_OWN_GIG: 'delete:own_gig',
  MANAGE_ALL_GIGS: 'manage:all_gigs',
  
  // Order related permissions
  CREATE_ORDER: 'create:order',
  VIEW_OWN_ORDERS: 'view:own_orders',
  VIEW_ALL_ORDERS: 'view:all_orders',
  UPDATE_ORDER_STATUS: 'update:order_status',
  
  // User related permissions
  VIEW_PROFILE: 'view:profile',
  EDIT_OWN_PROFILE: 'edit:own_profile',
  MANAGE_USERS: 'manage:users',
  
  // Admin specific
  VIEW_ANALYTICS: 'view:analytics',
  MANAGE_SYSTEM: 'manage:system',
} as const;

type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// Role to permissions mapping
const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [ROLES.ADMIN]: [
    PERMISSIONS.VIEW_GIGS,
    PERMISSIONS.MANAGE_ALL_GIGS,
    PERMISSIONS.VIEW_ALL_ORDERS,
    PERMISSIONS.UPDATE_ORDER_STATUS,
    PERMISSIONS.VIEW_PROFILE,
    PERMISSIONS.EDIT_OWN_PROFILE,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.MANAGE_SYSTEM,
  ],
  [ROLES.FREELANCER]: [
    PERMISSIONS.VIEW_GIGS,
    PERMISSIONS.CREATE_GIG,
    PERMISSIONS.EDIT_OWN_GIG,
    PERMISSIONS.DELETE_OWN_GIG,
    PERMISSIONS.VIEW_OWN_ORDERS,
    PERMISSIONS.VIEW_PROFILE,
    PERMISSIONS.EDIT_OWN_PROFILE,
  ],
  [ROLES.CLIENT]: [
    PERMISSIONS.VIEW_GIGS,
    PERMISSIONS.CREATE_ORDER,
    PERMISSIONS.VIEW_OWN_ORDERS,
    PERMISSIONS.VIEW_PROFILE,
    PERMISSIONS.EDIT_OWN_PROFILE,
  ],
};

// Route to required permissions mapping
export const ROUTE_PERMISSIONS: Record<string, Permission | Permission[]> = {
  '/gigs': PERMISSIONS.VIEW_GIGS,
  '/gigs/create': PERMISSIONS.CREATE_GIG,
  '/gigs/[id]/edit': PERMISSIONS.EDIT_OWN_GIG,
  '/orders': [PERMISSIONS.VIEW_OWN_ORDERS, PERMISSIONS.VIEW_ALL_ORDERS],
  '/admin': [PERMISSIONS.MANAGE_SYSTEM, PERMISSIONS.VIEW_ANALYTICS],
  '/admin/users': PERMISSIONS.MANAGE_USERS,
  '/profile': PERMISSIONS.VIEW_PROFILE,
};

/**
 * Check if a role has the required permission
 */
export function hasPermission(role: Role, requiredPermission: Permission | Permission[]): boolean {
  const userPermissions = ROLE_PERMISSIONS[role] || [];
  
  if (Array.isArray(requiredPermission)) {
    return requiredPermission.some(perm => userPermissions.includes(perm));
  }
  
  return userPermissions.includes(requiredPermission);
}

/**
 * Check if a user can access a specific route
 */
export function canAccessRoute(role: Role, pathname: string): boolean {
  // Find the most specific match for the path
  const matchedPath = Object.keys(ROUTE_PERMISSIONS)
    .filter(path => pathname.startsWith(path))
    .sort((a, b) => b.length - a.length)[0];
  
  if (!matchedPath) {
    // If no specific permission is required, allow access
    return true;
  }
  
  const requiredPermission = ROUTE_PERMISSIONS[matchedPath];
  return hasPermission(role, requiredPermission);
}

/**
 * Get all permissions for a role
 */
export function getPermissionsForRole(role: Role): Permission[] {
  return [...(ROLE_PERMISSIONS[role] || [])];
}

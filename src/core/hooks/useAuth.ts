import { useAppSelector } from '~/stores/hooks.ts'


/**
 * Check if the current user has a specific role.
 * Usage: const isSuperAdmin = useRole('SUPER_ADMIN');
 */
export function useRole(role: string): boolean {
  const { user } = useAppSelector((s) => s.auth);
  return user?.roles?.some((r) => r.name === role) ?? false;
}

/**
 * Check if the current user has any of the specified roles.
 * Usage: const canManage = useRoles(['SUPER_ADMIN', 'ADMIN']);
 */
export function useRoles(roles: string[]): boolean {
  const { user } = useAppSelector((s) => s.auth);
  return user?.roles?.some((r) => roles.includes(r.name)) ?? false;
}

/**
 * Check if the current user has a specific permission by name.
 * Usage: const canDelete = usePermission('users:delete');
 */
export function usePermission(permissionName: string): boolean {
  const { user } = useAppSelector((s) => s.auth);
  if (!user?.roles) return false;
  return user.roles.some((role) =>
    role.permissions?.some((p) => p.name === permissionName),
  );
}

/**
 * Returns the primary role name of the current user.
 */
export function usePrimaryRole(): string | null {
  const { user } = useAppSelector((s) => s.auth);
  if (!user?.roles?.length) return null;
  if (user.roles.some((r) => r.name === 'SUPER_ADMIN')) return 'SUPER_ADMIN';
  if (user.roles.some((r) => r.name === 'ADMIN')) return 'ADMIN'
  if (user.roles.some((r) => r.name === 'USER')) return 'USER'
  return user.roles[0]?.name ?? null;
}

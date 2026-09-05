// Single source of truth for functional admin access. Server-side admin checks
// and the admin console redirect all verify BOTH the elevated role and the
// owner's email, so a granted "admin" role alone never unlocks admin power.
export const OWNER_ADMIN_EMAIL = "mandersofficial@gmail.com";

export function isOwnerAdmin(user) {
  return !!user && user.role === "admin" && user.email === OWNER_ADMIN_EMAIL;
}
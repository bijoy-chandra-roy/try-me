/**
 * Dashboard route group layout.
 * Frame is owned by DashboardShell on each page (title/description vary).
 * Shell implements: >768 nav 256 | content; <=768 MobileNav drawer.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}

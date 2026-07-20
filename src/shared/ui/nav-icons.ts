import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  BarChart3,
  Flag,
  Home,
  LayoutDashboard,
  Lock,
  MapPin,
  Package,
  Palette,
  Search,
  Shield,
  Shirt,
  ShoppingBag,
  Sparkles,
  Store,
  User,
  Users,
  Languages,
} from 'lucide-react';

/** Stable keys used by nav config → Lucide icons. */
export type NavIconKey =
  | 'overview'
  | 'products'
  | 'orders'
  | 'addresses'
  | 'history'
  | 'analytics'
  | 'store'
  | 'users'
  | 'userLookup'
  | 'merchants'
  | 'health'
  | 'flags'
  | 'roles'
  | 'catalog'
  | 'profile'
  | 'account'
  | 'appearance'
  | 'language';

export const NAV_ICONS: Record<NavIconKey, LucideIcon> = {
  overview: LayoutDashboard,
  products: Package,
  orders: ShoppingBag,
  addresses: MapPin,
  history: Shirt,
  analytics: BarChart3,
  store: Store,
  users: Users,
  userLookup: Search,
  merchants: Store,
  health: Activity,
  flags: Flag,
  roles: Shield,
  catalog: Home,
  profile: User,
  account: Lock,
  appearance: Palette,
  language: Languages,
};

export function getNavIcon(key: NavIconKey): LucideIcon {
  return NAV_ICONS[key];
}

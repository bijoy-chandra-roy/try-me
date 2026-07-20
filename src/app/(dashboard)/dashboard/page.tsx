import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getDashboardPath, isUserRole } from '@/shared/auth/roles';

export default async function DashboardRedirectPage() {
  const session = await auth();
  if (!session?.user?.role || !isUserRole(session.user.role)) {
    redirect('/login');
  }
  redirect(getDashboardPath(session.user.role));
}

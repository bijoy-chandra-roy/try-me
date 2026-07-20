import type { NextRequest } from 'next/server';
import { ensureDbConnection } from '@/server/db/connection';
import { userRepository } from '@/server/features/auth/user.repository';
import { authService } from '@/server/features/auth/auth.service';
import { requirePermission, requireAuth } from '@/server/lib/auth-guard';
import { jsonError, jsonSuccess } from '@/server/lib/api-response';
import type { UserRole } from '@/shared/auth/roles';
import { isUserRole } from '@/shared/auth/roles';

export async function GET(request: NextRequest) {
  try {
    await requirePermission('view_users');
    await ensureDbConnection();

    const search = request.nextUrl.searchParams.get('search') ?? undefined;
    const roleParam = request.nextUrl.searchParams.get('role');
    const role = roleParam && isUserRole(roleParam) ? roleParam : undefined;

    const users = await userRepository.findAll({ search, role });
    return jsonSuccess(users);
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requirePermission('manage_users');
    await ensureDbConnection();

    const body = await request.json();
    const { email, password, name, role, merchantId } = body;

    if (!email || !password || !name || !role || !isUserRole(role)) {
      return jsonError(new Error('email, password, name, and valid role are required'));
    }

    const created = await authService.createUser(user.role, {
      email,
      password,
      name,
      role: role as UserRole,
      merchantId: merchantId ?? null,
    });

    return jsonSuccess(created, 201);
  } catch (error) {
    return jsonError(error);
  }
}

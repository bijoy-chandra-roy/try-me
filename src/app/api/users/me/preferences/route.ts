import { ensureDbConnection } from '@/server/db/connection';
import { authService } from '@/server/features/auth/auth.service';
import { requirePermission } from '@/server/lib/auth-guard';
import { AppError } from '@/server/lib/errors';
import { jsonError, jsonSuccess } from '@/server/lib/api-response';
import {
  isColorSchemeId,
  isFontPairId,
  isLocaleCode,
  isThemeMode,
  type UserPreferences,
} from '@/shared/constants';

function parsePreferencesBody(body: unknown): Partial<UserPreferences> {
  if (!body || typeof body !== 'object') {
    throw new AppError('Invalid body', 400);
  }
  const raw = body as Record<string, unknown>;
  const patch: Partial<UserPreferences> = {};

  if ('theme' in raw) {
    if (!isThemeMode(raw.theme)) throw new AppError('Invalid theme', 400);
    patch.theme = raw.theme;
  }
  if ('colorSchemeId' in raw) {
    if (!isColorSchemeId(raw.colorSchemeId)) {
      throw new AppError('Invalid color scheme', 400);
    }
    patch.colorSchemeId = raw.colorSchemeId;
  }
  if ('customScheme' in raw) {
    patch.customScheme = raw.customScheme as UserPreferences['customScheme'];
  }
  if ('fontPairId' in raw) {
    if (!isFontPairId(raw.fontPairId)) throw new AppError('Invalid font pair', 400);
    patch.fontPairId = raw.fontPairId;
  }
  if ('locale' in raw) {
    if (!isLocaleCode(raw.locale)) throw new AppError('Invalid locale', 400);
    patch.locale = raw.locale;
  }
  if ('reduceMotion' in raw) {
    if (typeof raw.reduceMotion !== 'boolean') {
      throw new AppError('Invalid reduceMotion', 400);
    }
    patch.reduceMotion = raw.reduceMotion;
  }
  if ('cardTilt' in raw) {
    if (typeof raw.cardTilt !== 'boolean') {
      throw new AppError('Invalid cardTilt', 400);
    }
    patch.cardTilt = raw.cardTilt;
  }

  return patch;
}

export async function GET() {
  try {
    const currentUser = await requirePermission('manage_own_profile');
    await ensureDbConnection();
    const preferences = await authService.getPreferences(currentUser.id);
    return jsonSuccess({ preferences });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const currentUser = await requirePermission('manage_own_profile');
    await ensureDbConnection();

    const body = await request.json();
    if (body?.reset === true) {
      const preferences = await authService.resetPreferences(currentUser.id);
      return jsonSuccess({ preferences });
    }

    const patch = parsePreferencesBody(body);
    const preferences = await authService.updatePreferences(currentUser.id, patch);
    return jsonSuccess({ preferences });
  } catch (error) {
    return jsonError(error);
  }
}

import { SystemConfig, type SystemConfigDocument } from './system-config.model';

export interface SystemConfigValues {
  maintenanceMode: boolean;
  guestTryOnLimit: number;
}

const DEFAULTS: SystemConfigValues = {
  maintenanceMode: false,
  guestTryOnLimit: 3,
};

let cache: SystemConfigValues | null = null;

function toValues(doc: Pick<SystemConfigDocument, 'maintenanceMode' | 'guestTryOnLimit'>): SystemConfigValues {
  return {
    maintenanceMode: doc.maintenanceMode ?? DEFAULTS.maintenanceMode,
    guestTryOnLimit: doc.guestTryOnLimit ?? DEFAULTS.guestTryOnLimit,
  };
}

class SystemConfigService {
  async getConfig(): Promise<SystemConfigValues> {
    if (cache) return cache;

    let doc = await SystemConfig.findOne().lean<SystemConfigDocument>();
    if (!doc) {
      const created = await SystemConfig.create(DEFAULTS);
      doc = created.toObject() as SystemConfigDocument;
    }

    cache = toValues(doc);
    return cache;
  }

  async updateConfig(data: Partial<SystemConfigValues>): Promise<SystemConfigValues> {
    let doc = await SystemConfig.findOne();
    if (!doc) {
      doc = await SystemConfig.create(DEFAULTS);
    }

    if (data.maintenanceMode !== undefined) doc.maintenanceMode = data.maintenanceMode;
    if (data.guestTryOnLimit !== undefined) {
      doc.guestTryOnLimit = Math.min(20, Math.max(1, data.guestTryOnLimit));
    }

    await doc.save();
    cache = toValues(doc);
    return cache;
  }

  invalidateCache() {
    cache = null;
  }
}

export const systemConfigService = new SystemConfigService();

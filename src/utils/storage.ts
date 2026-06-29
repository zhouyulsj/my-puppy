import Taro from '@tarojs/taro';

// 统一的 localStorage 封装
export const storage = {
  get<T>(key: string, defaultValue?: T): T | undefined {
    try {
      const val = Taro.getStorageSync(key);
      if (val === '' || val === null || val === undefined) return defaultValue;
      return val as T;
    } catch (e) {
      console.error('[Storage] get failed:', key, e);
      return defaultValue;
    }
  },

  set<T>(key: string, value: T): void {
    try {
      Taro.setStorageSync(key, value);
    } catch (e) {
      console.error('[Storage] set failed:', key, e);
    }
  },

  remove(key: string): void {
    try {
      Taro.removeStorageSync(key);
    } catch (e) {
      console.error('[Storage] remove failed:', key, e);
    }
  }
};

export const STORAGE_KEYS = {
  PET: 'furball_pet',
  HEALTH: 'furball_health',
  SHOPPING: 'furball_shopping',
  CALENDAR: 'furball_calendar',
  SHOPPING_CHECKED: 'furball_shopping_checked',
  CALENDAR_DONE: 'furball_calendar_done',
  USAGE_GUIDES: 'furball_usage_guides',
  API_KEY: 'furball_api_key'
} as const;

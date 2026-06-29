import { create } from 'zustand';
import type { PetProfile } from '@/types/pet';
import type { HealthData, ShoppingData, CalendarData, UsageGuideData } from '@/types/ai';
import { storage, STORAGE_KEYS } from '@/utils/storage';
import { loadApiKey } from '@/services/ai';
import { breedDatabase } from '@/data/breedDatabase';

// 清除所有 AI 缓存数据（用于 API Key 变更后强制重新生成）
function clearAiCache() {
  storage.remove(STORAGE_KEYS.HEALTH);
  storage.remove(STORAGE_KEYS.SHOPPING);
  storage.remove(STORAGE_KEYS.CALENDAR);
  storage.remove(STORAGE_KEYS.SHOPPING_CHECKED);
  storage.remove(STORAGE_KEYS.CALENDAR_DONE);
  storage.remove(STORAGE_KEYS.USAGE_GUIDES);
}

// 旧版英文 breed key → 新版中文 breed key 迁移映射
const BREED_KEY_MIGRATION: Record<string, string> = {
  british_shorthair: '英短蓝猫', american_shorthair: '美国短毛猫', ragdoll: '布偶猫',
  persian: '波斯猫', siamese: '暹罗猫', maine_coon: '缅因猫', orange: '橘猫',
  lihua: '狸花猫', exotic_shorthair: '异国短毛猫', golden_shaded: '金渐层',
  silver_shaded: '银渐层', bombay: '孟买猫', sphynx: '斯芬克斯无毛猫',
  scottish_fold: '苏格兰折耳猫', birman: '伯曼猫',
  golden_retriever: '金毛寻回犬', labrador: '拉布拉多', corgi: '柯基',
  poodle: '泰迪', husky: '哈士奇', samoyed: '萨摩耶', border_collie: '边境牧羊犬',
  shiba_inu: '柴犬', french_bulldog: '法国斗牛犬', bichon: '比熊',
  pomeranian: '博美', schnauzer: '雪纳瑞', german_shepherd: '德国牧羊犬',
  malamute: '阿拉斯加雪橇犬', chihuahua: '吉娃娃'
};

// 迁移旧版 breed key；若新旧 key 均不在数据库中则返回 null（需重新录入）
function migrateBreedKey(species: PetProfile['species'], breed: string): string | null {
  if (breedDatabase[species]?.[breed]) return breed;
  const migrated = BREED_KEY_MIGRATION[breed];
  if (migrated && breedDatabase[species]?.[migrated]) return migrated;
  return null;
}

interface PetState {
  pet: PetProfile | null;
  healthData: HealthData | null;
  shoppingData: ShoppingData | null;
  calendarData: CalendarData | null;
  usageGuides: Record<string, UsageGuideData>;
  apiKey: string;
  // 各 tab 数据是否已生成（内存态，重新进入小程序需重置）
  healthGenerated: boolean;
  shoppingGenerated: boolean;
  calendarGenerated: boolean;
  usageGuidesGenerated: boolean;

  setPet: (pet: PetProfile) => void;
  setHealthData: (data: HealthData) => void;
  setShoppingData: (data: ShoppingData) => void;
  setCalendarData: (data: CalendarData) => void;
  setUsageGuides: (guides: Record<string, UsageGuideData>) => void;
  setUsageGuide: (itemName: string, guide: UsageGuideData) => void;
  setApiKey: (key: string) => void;
  resetGeneratedFlags: () => void;
  clearPet: () => void;
  hydrateFromStorage: () => void;
}

export const usePetStore = create<PetState>((set) => ({
  pet: null,
  healthData: null,
  shoppingData: null,
  calendarData: null,
  usageGuides: {},
  apiKey: '',
  healthGenerated: false,
  shoppingGenerated: false,
  calendarGenerated: false,
  usageGuidesGenerated: false,

  setPet: (pet) => {
    storage.set(STORAGE_KEYS.PET, pet);
    // 更换宠物时清除旧的 AI 缓存
    storage.remove(STORAGE_KEYS.HEALTH);
    storage.remove(STORAGE_KEYS.SHOPPING);
    storage.remove(STORAGE_KEYS.CALENDAR);
    storage.remove(STORAGE_KEYS.SHOPPING_CHECKED);
    storage.remove(STORAGE_KEYS.CALENDAR_DONE);
    storage.remove(STORAGE_KEYS.USAGE_GUIDES);
    set({
      pet,
      healthData: null,
      shoppingData: null,
      calendarData: null,
      usageGuides: {},
      healthGenerated: false,
      shoppingGenerated: false,
      calendarGenerated: false,
      usageGuidesGenerated: false
    });
  },

  setHealthData: (data) => set({ healthData: data, healthGenerated: true }),
  setShoppingData: (data) => set({ shoppingData: data, shoppingGenerated: true }),
  setCalendarData: (data) => set({ calendarData: data, calendarGenerated: true }),
  setUsageGuides: (guides) => set({ usageGuides: guides, usageGuidesGenerated: true }),
  setUsageGuide: (itemName, guide) => set((state) => ({
    usageGuides: { ...state.usageGuides, [itemName]: guide }
  })),

  setApiKey: (key) => {
    storage.set(STORAGE_KEYS.API_KEY, key);
    // 同步更新 AI_CONFIG.apiKey（loadApiKey 从 storage 读取并赋值给 AI_CONFIG）
    loadApiKey();
    // Key 变更后清除旧 AI 缓存，强制各页面重新生成
    clearAiCache();
    set({
      apiKey: key,
      healthData: null,
      shoppingData: null,
      calendarData: null,
      usageGuides: {},
      healthGenerated: false,
      shoppingGenerated: false,
      calendarGenerated: false,
      usageGuidesGenerated: false
    });
  },

  resetGeneratedFlags: () => set({
    healthGenerated: false,
    shoppingGenerated: false,
    calendarGenerated: false,
    usageGuidesGenerated: false
  }),

  clearPet: () => {
    storage.remove(STORAGE_KEYS.PET);
    storage.remove(STORAGE_KEYS.HEALTH);
    storage.remove(STORAGE_KEYS.SHOPPING);
    storage.remove(STORAGE_KEYS.CALENDAR);
    storage.remove(STORAGE_KEYS.USAGE_GUIDES);
    set({
      pet: null,
      healthData: null,
      shoppingData: null,
      calendarData: null,
      usageGuides: {},
      healthGenerated: false,
      shoppingGenerated: false,
      calendarGenerated: false,
      usageGuidesGenerated: false
    });
  },

  hydrateFromStorage: () => {
    const rawPet = storage.get<PetProfile>(STORAGE_KEYS.PET) || null;
    let pet = rawPet;
    if (rawPet) {
      const migratedBreed = migrateBreedKey(rawPet.species, rawPet.breed);
      if (!migratedBreed) {
        // 旧品种 key 无法迁移，清除宠物数据要求重新录入
        storage.remove(STORAGE_KEYS.PET);
        storage.remove(STORAGE_KEYS.HEALTH);
        storage.remove(STORAGE_KEYS.SHOPPING);
        storage.remove(STORAGE_KEYS.CALENDAR);
        storage.remove(STORAGE_KEYS.USAGE_GUIDES);
        pet = null;
      } else if (migratedBreed !== rawPet.breed) {
        pet = { ...rawPet, breed: migratedBreed };
        storage.set(STORAGE_KEYS.PET, pet);
      }
    }
    const healthData = storage.get<HealthData>(STORAGE_KEYS.HEALTH) || null;
    const shoppingData = storage.get<ShoppingData>(STORAGE_KEYS.SHOPPING) || null;
    const calendarData = storage.get<CalendarData>(STORAGE_KEYS.CALENDAR) || null;
    const usageGuides = storage.get<Record<string, UsageGuideData>>(STORAGE_KEYS.USAGE_GUIDES) || {};
    const apiKey = loadApiKey();
    set({
      pet,
      healthData: pet ? healthData : null,
      shoppingData: pet ? shoppingData : null,
      calendarData: pet ? calendarData : null,
      usageGuides: pet ? usageGuides : {},
      apiKey,
      healthGenerated: !!healthData && !!pet,
      shoppingGenerated: !!shoppingData && !!pet,
      calendarGenerated: !!calendarData && !!pet,
      usageGuidesGenerated: !!usageGuides && Object.keys(usageGuides).length > 0 && !!pet
    });
  }
}));

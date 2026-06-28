import { create } from 'zustand';
import type { PetProfile } from '@/types/pet';
import type { HealthData, ShoppingData, CalendarData } from '@/types/ai';
import { storage, STORAGE_KEYS } from '@/utils/storage';
import { loadApiKey } from '@/services/ai';

interface PetState {
  pet: PetProfile | null;
  healthData: HealthData | null;
  shoppingData: ShoppingData | null;
  calendarData: CalendarData | null;
  apiKey: string;
  // 各 tab 数据是否已生成（内存态，重新进入小程序需重置）
  healthGenerated: boolean;
  shoppingGenerated: boolean;
  calendarGenerated: boolean;

  setPet: (pet: PetProfile) => void;
  setHealthData: (data: HealthData) => void;
  setShoppingData: (data: ShoppingData) => void;
  setCalendarData: (data: CalendarData) => void;
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
  apiKey: '',
  healthGenerated: false,
  shoppingGenerated: false,
  calendarGenerated: false,

  setPet: (pet) => {
    storage.set(STORAGE_KEYS.PET, pet);
    // 更换宠物时清除旧的 AI 缓存
    storage.remove(STORAGE_KEYS.HEALTH);
    storage.remove(STORAGE_KEYS.SHOPPING);
    storage.remove(STORAGE_KEYS.CALENDAR);
    storage.remove(STORAGE_KEYS.SHOPPING_CHECKED);
    storage.remove(STORAGE_KEYS.CALENDAR_DONE);
    set({
      pet,
      healthData: null,
      shoppingData: null,
      calendarData: null,
      healthGenerated: false,
      shoppingGenerated: false,
      calendarGenerated: false
    });
  },

  setHealthData: (data) => set({ healthData: data, healthGenerated: true }),
  setShoppingData: (data) => set({ shoppingData: data, shoppingGenerated: true }),
  setCalendarData: (data) => set({ calendarData: data, calendarGenerated: true }),

  setApiKey: (key) => {
    storage.set(STORAGE_KEYS.API_KEY, key);
    set({ apiKey: key });
  },

  resetGeneratedFlags: () => set({
    healthGenerated: false,
    shoppingGenerated: false,
    calendarGenerated: false
  }),

  clearPet: () => {
    storage.remove(STORAGE_KEYS.PET);
    storage.remove(STORAGE_KEYS.HEALTH);
    storage.remove(STORAGE_KEYS.SHOPPING);
    storage.remove(STORAGE_KEYS.CALENDAR);
    set({
      pet: null,
      healthData: null,
      shoppingData: null,
      calendarData: null,
      healthGenerated: false,
      shoppingGenerated: false,
      calendarGenerated: false
    });
  },

  hydrateFromStorage: () => {
    const pet = storage.get<PetProfile>(STORAGE_KEYS.PET) || null;
    const healthData = storage.get<HealthData>(STORAGE_KEYS.HEALTH) || null;
    const shoppingData = storage.get<ShoppingData>(STORAGE_KEYS.SHOPPING) || null;
    const calendarData = storage.get<CalendarData>(STORAGE_KEYS.CALENDAR) || null;
    const apiKey = loadApiKey();
    set({
      pet,
      healthData,
      shoppingData,
      calendarData,
      apiKey,
      healthGenerated: !!healthData,
      shoppingGenerated: !!shoppingData,
      calendarGenerated: !!calendarData
    });
  }
}));

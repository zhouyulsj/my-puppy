// 常用物品列表（按种类区分）—— 采购清单/使用指南共享
// 用于使用指南的后台预生成，确保用户点开即可看到内容

import type { PetSpecies } from '@/types/pet';

export interface CommonItem {
  name: string;
  icon: string;
}

export const commonItems: Record<PetSpecies, CommonItem[]> = {
  cat: [
    { name: '猫粮', icon: '🍖' },
    { name: '内驱药', icon: '💊' },
    { name: '外驱药', icon: '💧' },
    { name: '化毛膏', icon: '🧴' },
    { name: '猫砂', icon: '🪨' },
    { name: '逗猫棒', icon: '🪶' },
    { name: '猫抓板', icon: '🪵' },
    { name: '指甲剪', icon: '✂️' }
  ],
  dog: [
    { name: '犬粮', icon: '🍖' },
    { name: '内驱药', icon: '💊' },
    { name: '外驱药', icon: '💧' },
    { name: '洁齿骨', icon: '🦴' },
    { name: '牵引绳', icon: '🪢' },
    { name: '拾便袋', icon: '🛍️' },
    { name: '犬窝', icon: '🛏️' },
    { name: '指甲剪', icon: '✂️' }
  ]
};

// 获取指定种类所有物品名（用于批量预生成）
export function getItemNames(species: PetSpecies): string[] {
  return commonItems[species].map((item) => item.name);
}

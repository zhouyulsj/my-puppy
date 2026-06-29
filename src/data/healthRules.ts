// 健康规则数据库 - 基于中国宠物医疗通用指南
// 饮食营养标准参考：GB/T 31216-2014(全价宠物食品 犬粮)、GB/T 31217-2014(全价宠物食品 猫粮)

export const healthRules = {
  vaccine: {
    cat: {
      core: ['猫三联疫苗(预防猫瘟、猫杯状病毒、猫疱疹病毒)'],
      schedule: [
        { age_months: 8, action: '首针猫三联疫苗' },
        { age_months: 12, action: '第二针猫三联疫苗' },
        { age_months: 16, action: '第三针猫三联疫苗 + 狂犬疫苗' }
      ],
      non_core: ['猫白血病疫苗(FeLV)', '猫免疫缺陷病毒疫苗(FIV)'],
      booster: '此后每年加强一针猫三联 + 狂犬疫苗'
    },
    dog: {
      core: ['犬联疫苗(犬瘟热、犬细小、犬副流感、犬腺病毒等)', '狂犬疫苗'],
      schedule: [
        { age_months: 6, action: '首针犬二联(犬瘟热+细小)' },
        { age_months: 10, action: '第二针犬四联' },
        { age_months: 14, action: '第三针犬四联 + 狂犬疫苗' }
      ],
      non_core: ['犬钩端螺旋体疫苗', '犬冠状病毒疫苗', '犬窝咳疫苗'],
      booster: '此后每年加强一针犬联苗 + 狂犬疫苗'
    }
  },
  deworming: {
    cat: {
      internal: { frequency: '每3个月一次', drugs: '含吡喹酮成分的内驱药', note: '幼猫2周龄开始，每2周一次至3月龄' },
      external: { frequency: '每1-2个月一次', drugs: '含塞拉菌素/非泼罗尼成分的外驱药', note: '注意猫对某些成分敏感，禁用犬用驱虫药' }
    },
    dog: {
      internal: { frequency: '每3个月一次', drugs: '含吡喹酮/芬苯达唑成分的内驱药', note: '幼犬2周龄开始，每2周一次至3月龄' },
      external: { frequency: '每1个月一次', drugs: '含塞拉菌素/非泼罗尼成分的外驱药', note: '外出频繁的犬只建议每月驱虫' }
    }
  },
  grooming: {
    short_hair_cat: { bath: '每1-2个月一次', brush: '每周1次', nail: '每2-3周修剪', ear_clean: '每周检查' },
    long_hair_cat: { bath: '每1-2个月一次', brush: '每日1次', nail: '每2-3周修剪', ear_clean: '每周检查' },
    short_hair_dog: { bath: '每1-2周一次', brush: '每周2-3次', nail: '每3-4周修剪', ear_clean: '每周清洁' },
    long_hair_dog: { bath: '每1-2周一次', brush: '每日1次', nail: '每3-4周修剪', ear_clean: '每周清洁' }
  },
  neutering: {
    cat: {
      recommended_age: '6-8月龄',
      benefits: ['减少生殖系统疾病', '减少标记行为和嚎叫', '降低流浪风险'],
      note: '建议在疫苗完成后进行，术前需禁食8小时'
    },
    dog: {
      recommended_age: '小型犬6-8月龄；中大型犬建议12-18月龄骨骼发育后',
      benefits: ['减少生殖系统疾病', '减少攻击性和标记行为', '降低前列腺问题风险'],
      note: '大型犬建议骨骼发育成熟后再绝育，术前需禁食8小时'
    }
  },
  diet: {
    kitten: { calorie_per_kg: 250, protein_min: '30%', fat_min: '9%', note: '少食多餐(每日4-6餐)，选择幼猫专用粮' },
    adult_cat: { calorie_per_kg: 80, protein_min: '26%', fat_min: '9%', note: '控制食量避免肥胖，保证饮水充足' },
    senior_cat: { calorie_per_kg: 65, protein_min: '28%', fat_min: '7%', note: '选择易消化蛋白，关注肾脏健康' },
    puppy_small: { calorie_per_kg: 145, protein_min: '28%', fat_min: '8%', note: '少食多餐(每日3-4餐)，小型犬专用幼犬粮' },
    puppy_medium: { calorie_per_kg: 130, protein_min: '28%', fat_min: '8%', note: '少食多餐(每日3餐)，中大型犬专用幼犬粮' },
    puppy_large: { calorie_per_kg: 120, protein_min: '26%', fat_min: '7%', note: '控制钙磷比促进骨骼发育(每日3餐)' },
    adult_dog_small: { calorie_per_kg: 110, protein_min: '22%', fat_min: '5%', note: '控制体重，小型犬专用成犬粮' },
    adult_dog_medium: { calorie_per_kg: 95, protein_min: '22%', fat_min: '5%', note: '保证运动量，控制食量' },
    adult_dog_large: { calorie_per_kg: 85, protein_min: '22%', fat_min: '4%', note: '关注关节健康，大型犬专用成犬粮' },
    senior_dog: { calorie_per_kg: 75, protein_min: '24%', fat_min: '4%', note: '选择易消化配方，关注关节与肾脏' }
  }
};

export type HealthRules = typeof healthRules;

// 根据宠物信息获取饮食阶段key
export function getDietStageKey(species: string, ageMonths: number, size?: string): string {
  if (species === 'cat') {
    if (ageMonths < 12) return 'kitten';
    if (ageMonths < 84) return 'adult_cat';
    return 'senior_cat';
  }
  // dog
  if (ageMonths < 12) {
    if (size === '大型犬' || size === '巨型犬') return 'puppy_large';
    if (size === '中型犬') return 'puppy_medium';
    return 'puppy_small';
  }
  if (ageMonths < 96) {
    if (size === '大型犬' || size === '巨型犬') return 'adult_dog_large';
    if (size === '中型犬') return 'adult_dog_medium';
    return 'adult_dog_small';
  }
  return 'senior_dog';
}

// 根据毛型获取洗护阶段key（长毛/双层毛归入长毛洗护，需更频繁梳毛）
export function getGroomingKey(species: string, coatType: string): string {
  const isLong = coatType === '长毛' || coatType === '双层毛';
  if (species === 'cat') {
    return isLong ? 'long_hair_cat' : 'short_hair_cat';
  }
  return isLong ? 'long_hair_dog' : 'short_hair_dog';
}

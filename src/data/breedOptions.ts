import type { BreedInfo, PetSpecies } from '@/types/pet';

// 品种选项（用于表单下拉）
export const breedOptions: Record<PetSpecies, { key: string; name: string }[]> = {
  cat: [
    { key: 'british_shorthair', name: '英国短毛猫' },
    { key: 'american_shorthair', name: '美国短毛猫' },
    { key: 'ragdoll', name: '布偶猫' },
    { key: 'persian', name: '波斯猫' },
    { key: 'siamese', name: '暹罗猫' },
    { key: 'maine_coon', name: '缅因猫' },
    { key: 'orange', name: '橘猫(中华田园猫)' },
    { key: 'lihua', name: '狸花猫' },
    { key: 'exotic_shorthair', name: '加菲猫(异国短毛猫)' },
    { key: 'golden_shaded', name: '金渐层' },
    { key: 'silver_shaded', name: '银渐层' },
    { key: 'bombay', name: '孟买猫' },
    { key: 'sphynx', name: '斯芬克斯无毛猫' },
    { key: 'scottish_fold', name: '苏格兰折耳猫' },
    { key: 'birman', name: '伯曼猫' }
  ],
  dog: [
    { key: 'golden_retriever', name: '金毛寻回犬' },
    { key: 'labrador', name: '拉布拉多' },
    { key: 'corgi', name: '柯基' },
    { key: 'poodle', name: '泰迪(贵宾犬)' },
    { key: 'husky', name: '哈士奇' },
    { key: 'samoyed', name: '萨摩耶' },
    { key: 'border_collie', name: '边牧' },
    { key: 'shiba_inu', name: '柴犬' },
    { key: 'french_bulldog', name: '法斗' },
    { key: 'bichon', name: '比熊' },
    { key: 'pomeranian', name: '博美' },
    { key: 'schnauzer', name: '雪纳瑞' },
    { key: 'german_shepherd', name: '德牧' },
    { key: 'malamute', name: '阿拉斯加' },
    { key: 'chihuahua', name: '吉娃娃' }
  ]
};

// 年龄选项（月龄 + 成年）
export const ageOptions: { value: number; label: string }[] = [
  ...Array.from({ length: 24 }, (_, i) => ({ value: i + 1, label: `${i + 1}月龄` })),
  { value: 24, label: '2岁' },
  { value: 36, label: '3岁' },
  { value: 48, label: '4岁' },
  { value: 60, label: '5岁' },
  { value: 72, label: '6岁' },
  { value: 84, label: '7岁' },
  { value: 96, label: '8岁' },
  { value: 108, label: '9岁' },
  { value: 120, label: '10岁' },
  { value: 132, label: '11岁' },
  { value: 144, label: '12岁' },
  { value: 156, label: '13岁' },
  { value: 168, label: '14岁' },
  { value: 180, label: '15岁' }
];

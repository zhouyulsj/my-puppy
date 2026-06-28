import type { BreedInfo, PetSpecies } from '@/types/pet';

// 品种数据库 - 基于真实兽医知识
export const breedDatabase: Record<PetSpecies, Record<string, BreedInfo>> = {
  cat: {
    british_shorthair: {
      display_name: '英国短毛猫', adult_weight: { min: 4, max: 8 },
      common_risks: ['肥厚型心肌病', '多囊肾病', '肥胖'],
      life_expectancy: '12-20年', coat_type: '短毛', size: '中型'
    },
    american_shorthair: {
      display_name: '美国短毛猫', adult_weight: { min: 3.5, max: 7 },
      common_risks: ['肥厚型心肌病', '髋关节发育不良'],
      life_expectancy: '15-20年', coat_type: '短毛', size: '中型'
    },
    ragdoll: {
      display_name: '布偶猫', adult_weight: { min: 4.5, max: 9 },
      common_risks: ['肥厚型心肌病', '多囊肾病', '膀胱结石'],
      life_expectancy: '12-17年', coat_type: '长毛', size: '中型'
    },
    persian: {
      display_name: '波斯猫', adult_weight: { min: 3, max: 6 },
      common_risks: ['多囊肾病', '进行性视网膜萎缩', '呼吸系统问题(短鼻道)'],
      life_expectancy: '12-17年', coat_type: '长毛', size: '中型'
    },
    siamese: {
      display_name: '暹罗猫', adult_weight: { min: 2.5, max: 5 },
      common_risks: ['进行性视网膜萎缩', '哮喘', '心理压力(过度依赖)'],
      life_expectancy: '15-20年', coat_type: '短毛', size: '中型'
    },
    maine_coon: {
      display_name: '缅因猫', adult_weight: { min: 5, max: 11 },
      common_risks: ['肥厚型心肌病', '髋关节发育不良', '脊髓性肌萎缩'],
      life_expectancy: '10-15年', coat_type: '长毛', size: '中型'
    },
    orange: {
      display_name: '橘猫(中华田园猫)', adult_weight: { min: 3.5, max: 7 },
      common_risks: ['肥胖', '口腔疾病', '泌尿系统问题'],
      life_expectancy: '13-17年', coat_type: '短毛', size: '中型'
    },
    lihua: {
      display_name: '狸花猫', adult_weight: { min: 3.5, max: 6.5 },
      common_risks: ['泌尿系统问题', '口腔疾病'],
      life_expectancy: '15-20年', coat_type: '短毛', size: '中型'
    },
    exotic_shorthair: {
      display_name: '加菲猫(异国短毛猫)', adult_weight: { min: 3, max: 6 },
      common_risks: ['多囊肾病', '呼吸系统问题(短鼻道)', '泪溢症'],
      life_expectancy: '12-15年', coat_type: '短毛', size: '中型'
    },
    golden_shaded: {
      display_name: '金渐层', adult_weight: { min: 4, max: 8 },
      common_risks: ['肥厚型心肌病', '多囊肾病', '肥胖'],
      life_expectancy: '12-17年', coat_type: '短毛', size: '中型'
    },
    silver_shaded: {
      display_name: '银渐层', adult_weight: { min: 4, max: 7.5 },
      common_risks: ['肥厚型心肌病', '多囊肾病'],
      life_expectancy: '12-17年', coat_type: '短毛', size: '中型'
    },
    bombay: {
      display_name: '孟买猫', adult_weight: { min: 3, max: 6 },
      common_risks: ['肥厚型心肌病', '呼吸道问题'],
      life_expectancy: '12-16年', coat_type: '短毛', size: '中型'
    },
    sphynx: {
      display_name: '斯芬克斯无毛猫', adult_weight: { min: 3, max: 5 },
      common_risks: ['皮肤油脂过多', '肥厚型心肌病', '体温调节问题'],
      life_expectancy: '9-15年', coat_type: '无毛', size: '中型'
    },
    scottish_fold: {
      display_name: '苏格兰折耳猫', adult_weight: { min: 3, max: 6 },
      common_risks: ['软骨发育不良(进行性关节病变)', '骨关节炎', '耳部感染'],
      life_expectancy: '12-15年', coat_type: '短毛', size: '中型'
    },
    birman: {
      display_name: '伯曼猫', adult_weight: { min: 4, max: 7 },
      common_risks: ['肥厚型心肌病', '先天性白内障'],
      life_expectancy: '12-16年', coat_type: '长毛', size: '中型'
    }
  },
  dog: {
    golden_retriever: {
      display_name: '金毛寻回犬', adult_weight: { min: 25, max: 34 },
      common_risks: ['髋关节发育不良', '肿瘤', '皮肤病', '肥胖'],
      life_expectancy: '10-12年', coat_type: '长毛', size: '大型犬'
    },
    labrador: {
      display_name: '拉布拉多', adult_weight: { min: 25, max: 34 },
      common_risks: ['髋关节发育不良', '肥胖', '耳部感染'],
      life_expectancy: '10-12年', coat_type: '短毛', size: '大型犬'
    },
    corgi: {
      display_name: '柯基', adult_weight: { min: 10, max: 14 },
      common_risks: ['椎间盘疾病(长背短腿)', '髋关节发育不良', '肥胖'],
      life_expectancy: '12-15年', coat_type: '双层毛', size: '小型犬'
    },
    poodle: {
      display_name: '泰迪(贵宾犬)', adult_weight: { min: 3, max: 8 },
      common_risks: ['膝关节脱位', '进行性视网膜萎缩', '耳部感染'],
      life_expectancy: '12-15年', coat_type: '长毛', size: '小型犬'
    },
    husky: {
      display_name: '哈士奇', adult_weight: { min: 16, max: 27 },
      common_risks: ['眼部疾病(白内障/角膜营养不良)', '甲状腺功能减退', '皮肤病'],
      life_expectancy: '12-14年', coat_type: '双层毛', size: '中型犬'
    },
    samoyed: {
      display_name: '萨摩耶', adult_weight: { min: 16, max: 30 },
      common_risks: ['髋关节发育不良', '糖尿病', '心脏病'],
      life_expectancy: '12-14年', coat_type: '双层毛', size: '中型犬'
    },
    border_collie: {
      display_name: '边牧', adult_weight: { min: 14, max: 22 },
      common_risks: ['髋关节发育不良', '进行性视网膜萎缩', '癫痫', '心理问题(需大量运动)'],
      life_expectancy: '12-15年', coat_type: '长毛', size: '中型犬'
    },
    shiba_inu: {
      display_name: '柴犬', adult_weight: { min: 8, max: 11 },
      common_risks: ['过敏(皮肤病)', '青光眼', '膝关节脱位'],
      life_expectancy: '13-16年', coat_type: '双层毛', size: '小型犬'
    },
    french_bulldog: {
      display_name: '法斗', adult_weight: { min: 8, max: 14 },
      common_risks: ['短鼻综合征(呼吸困难)', '椎间盘疾病', '皮肤病(过敏)'],
      life_expectancy: '10-14年', coat_type: '短毛', size: '小型犬'
    },
    bichon: {
      display_name: '比熊', adult_weight: { min: 4, max: 7 },
      common_risks: ['膝关节脱位', '泪溢症', '皮肤病', '糖尿病'],
      life_expectancy: '12-15年', coat_type: '长毛', size: '小型犬'
    },
    pomeranian: {
      display_name: '博美', adult_weight: { min: 1.5, max: 3.5 },
      common_risks: ['气管塌陷', '膝关节脱位', '心脏病', '脱毛症'],
      life_expectancy: '12-16年', coat_type: '双层毛', size: '小型犬'
    },
    schnauzer: {
      display_name: '雪纳瑞', adult_weight: { min: 5, max: 9 },
      common_risks: ['高脂血症', '胰腺炎', '膀胱结石', '糖尿病'],
      life_expectancy: '13-16年', coat_type: '双层毛', size: '小型犬'
    },
    german_shepherd: {
      display_name: '德牧', adult_weight: { min: 22, max: 40 },
      common_risks: ['髋关节发育不良', '退行性脊髓病', '胰腺外分泌不足'],
      life_expectancy: '9-13年', coat_type: '双层毛', size: '大型犬'
    },
    malamute: {
      display_name: '阿拉斯加', adult_weight: { min: 34, max: 45 },
      common_risks: ['髋关节发育不良', '白内障', '甲状腺功能减退', '皮肤病'],
      life_expectancy: '10-14年', coat_type: '双层毛', size: '大型犬'
    },
    chihuahua: {
      display_name: '吉娃娃', adult_weight: { min: 1.5, max: 3 },
      common_risks: ['膝关节脱位', '低血糖', '心脏病', '脑积水'],
      life_expectancy: '14-18年', coat_type: '短毛', size: '小型犬'
    }
  }
};

// 获取品种信息
export function getBreedInfo(species: PetSpecies, breedKey: string): BreedInfo | undefined {
  return breedDatabase[species]?.[breedKey];
}

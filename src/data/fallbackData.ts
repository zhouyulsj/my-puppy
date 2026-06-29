import type { HealthData, ShoppingData, UsageGuideData, CalendarData } from '@/types/ai';
import type { PetSpecies } from '@/types/pet';

// Fallback 数据 - AI 调用失败时使用（基于 health_rules 生成）

export const fallbackHealth: Record<PetSpecies, HealthData> = {
  cat: {
    risk_alerts: [
      { level: 'high', title: '定期疫苗接种', description: '未完成核心疫苗的猫咪易感染猫瘟、猫杯状病毒等致命疾病。', action: '按疫苗时间表完成猫三联+狂犬疫苗接种' },
      { level: 'high', title: '定期驱虫', description: '体内外寄生虫会影响猫咪健康，可能导致营养不良和皮肤病。', action: '内驱每3个月一次，外驱每1-2个月一次' },
      { level: 'medium', title: '泌尿系统健康', description: '猫咪易患泌尿系统疾病，需保证充足饮水。', action: '提供流动饮水机，观察排尿情况' },
      { level: 'low', title: '口腔护理', description: '牙结石和口腔疾病在猫咪中常见。', action: '定期刷牙或使用洁齿零食' }
    ],
    daily_care: {
      diet: ['选择符合中国GB标准(GB/T 31217-2014)的猫粮', '保证每日充足饮水', '避免喂食人类食物(尤其洋葱、巧克力)'],
      exercise: ['每日互动游戏15-30分钟', '提供猫爬架满足攀爬需求', '使用逗猫棒激发捕猎本能'],
      environment: ['提供安静私密的休息空间', '保持猫砂盆清洁(每日铲屎)', '提供抓板满足磨爪需求'],
      mental_health: ['每日陪伴互动', '提供玩具丰富环境', '避免长期独处造成焦虑']
    },
    age_notes: ['关注体重变化，避免肥胖', '定期体检，建议每年一次', '观察食欲和精神状态变化']
  },
  dog: {
    risk_alerts: [
      { level: 'high', title: '定期疫苗接种', description: '未完成核心疫苗的犬只易感染犬瘟热、细小病毒等致命疾病。', action: '按疫苗时间表完成犬联苗+狂犬疫苗接种' },
      { level: 'high', title: '定期驱虫', description: '体内外寄生虫会影响犬只健康，外出频繁更需注意。', action: '内驱每3个月一次，外驱每月一次' },
      { level: 'medium', title: '关节健康', description: '中大型犬易患髋关节发育不良，需控制运动强度。', action: '避免幼年期过度运动，补充关节营养' },
      { level: 'low', title: '口腔护理', description: '牙结石和牙周病在犬只中常见。', action: '定期刷牙或使用洁齿骨' }
    ],
    daily_care: {
      diet: ['选择符合中国GB标准(GB/T 31216-2014)的犬粮', '按体型选择合适配方', '避免喂食葡萄、巧克力、葱蒜'],
      exercise: ['每日遛狗30-60分钟', '提供互动游戏时间', '大型犬需更大运动量'],
      environment: ['提供固定休息区域', '保持居住环境清洁', '提供充足玩具'],
      mental_health: ['每日陪伴训练', '社会化训练很重要', '避免长期独处导致分离焦虑']
    },
    age_notes: ['关注体重变化，避免肥胖', '定期体检，建议每年一次', '注意关节和牙齿健康']
  }
};

export const fallbackShopping: Record<PetSpecies, ShoppingData> = {
  cat: {
    categories: [
      {
        name: '主粮', icon: '🍖',
        items: [
          { name: '猫粮', selection_guide: '选择配料表首位为肉类、符合中国GB标准(GB/T 31217-2014)的产品', ingredient_tips: '粗蛋白≥26%，粗脂肪≥9%，避免过多谷物', price_range: '80-300元/袋', importance: 'essential' }
        ]
      },
      {
        name: '零食与营养品', icon: '🐟',
        items: [
          { name: '猫条/冻干零食', selection_guide: '选择单一肉类成分，避免诱食剂过多', ingredient_tips: '成分简单，无防腐剂和诱食剂', price_range: '20-80元', importance: 'recommended' }
        ]
      },
      {
        name: '驱虫药', icon: '💊',
        items: [
          { name: '内驱药', selection_guide: '含吡喹酮成分的猫用内驱药', ingredient_tips: '吡喹酮、芬苯达唑为常见有效成分', price_range: '30-80元', importance: 'essential' },
          { name: '外驱药', selection_guide: '含塞拉菌素或非泼罗尼的猫用滴剂', ingredient_tips: '塞拉菌素安全性高，适合猫咪', price_range: '50-120元', importance: 'essential' }
        ]
      },
      {
        name: '常备药品', icon: '🩹',
        items: [
          { name: '化毛膏', selection_guide: '帮助排出体内毛球，预防毛球症', ingredient_tips: '含矿物油或麦芽成分', price_range: '30-60元', importance: 'recommended' }
        ]
      },
      {
        name: '日常用品', icon: '🏠',
        items: [
          { name: '猫砂盆', selection_guide: '选择大于猫咪体长1.5倍的猫砂盆', ingredient_tips: '材质耐用易清洁', price_range: '50-300元', importance: 'essential' },
          { name: '猫砂', selection_guide: '选择粉尘少、结团好的猫砂', ingredient_tips: '豆腐砂可冲厕所，膨润土砂结团好', price_range: '30-100元/袋', importance: 'essential' },
          { name: '逗猫棒', selection_guide: '选择安全材质，满足捕猎本能', ingredient_tips: '避免小零件脱落被误食', price_range: '10-50元', importance: 'recommended' }
        ]
      }
    ]
  },
  dog: {
    categories: [
      {
        name: '主粮', icon: '🍖',
        items: [
          { name: '犬粮', selection_guide: '按体型选择配方，配料表首位应为肉类，符合中国GB标准(GB/T 31216-2014)', ingredient_tips: '粗蛋白≥22%，粗脂肪≥5%，钙磷比1.2:1', price_range: '100-400元/袋', importance: 'essential' }
        ]
      },
      {
        name: '零食与营养品', icon: '🦴',
        items: [
          { name: '训练零食', selection_guide: '选择小块、易消化、低热量零食', ingredient_tips: '单一蛋白，无添加剂', price_range: '20-80元', importance: 'recommended' }
        ]
      },
      {
        name: '驱虫药', icon: '💊',
        items: [
          { name: '内驱药', selection_guide: '含吡喹酮/芬苯达唑的犬用内驱药', ingredient_tips: '按体重选择剂量规格', price_range: '30-80元', importance: 'essential' },
          { name: '外驱药', selection_guide: '含塞拉菌素或非泼罗尼的犬用滴剂', ingredient_tips: '外出频繁建议每月使用', price_range: '50-150元', importance: 'essential' }
        ]
      },
      {
        name: '常备药品', icon: '🩹',
        items: [
          { name: '洁齿骨', selection_guide: '帮助清洁牙齿，预防牙结石', ingredient_tips: '选择合适体型的尺寸', price_range: '20-60元', importance: 'recommended' }
        ]
      },
      {
        name: '日常用品', icon: '🏠',
        items: [
          { name: '牵引绳+项圈', selection_guide: '按体型选择长度和强度，外出必备', ingredient_tips: '材质牢固，扣环安全', price_range: '30-150元', importance: 'essential' },
          { name: '狗窝/垫子', selection_guide: '选择易清洗、适合体型的尺寸', ingredient_tips: '材质透气舒适', price_range: '50-300元', importance: 'essential' },
          { name: '拾便袋', selection_guide: '外出遛狗必备，文明养犬', ingredient_tips: '可降解材质更环保', price_range: '10-30元', importance: 'essential' }
        ]
      }
    ]
  }
};

export const fallbackGuide: UsageGuideData = {
  item_name: '通用物品',
  usage_method: '请仔细阅读产品说明书，按说明操作。首次使用建议咨询兽医。',
  dosage: '按产品说明书或兽医建议，根据宠物体重计算用量。',
  precautions: ['使用前检查保质期', '观察宠物使用后反应', '如有异常立即停用并就医'],
  common_mistakes: ['过量使用', '忽略产品适用年龄/体重', '与其它药物混用未咨询兽医']
};

export const fallbackCalendar: Record<PetSpecies, CalendarData> = {
  cat: {
    events: [
      { month_offset: 0, category: 'deworming', action: '体内外驱虫', importance: 'high', detail: '定期驱虫，内驱每3个月，外驱每1-2个月' },
      { month_offset: 1, category: 'grooming', action: '洗护与修剪指甲', importance: 'medium', detail: '洗澡每1-2个月，指甲每2-3周修剪' },
      { month_offset: 2, category: 'checkup', action: '日常健康观察', importance: 'medium', detail: '观察食欲、精神、排泄情况' },
      { month_offset: 3, category: 'deworming', action: '体内驱虫', importance: 'high', detail: '每3个月定期内驱' },
      { month_offset: 4, category: 'grooming', action: '洗护', importance: 'low', detail: '定期洗澡和梳毛' },
      { month_offset: 6, category: 'checkup', action: '年度体检', importance: 'high', detail: '建议每年进行一次全面体检' },
      { month_offset: 9, category: 'deworming', action: '体内外驱虫', importance: 'high', detail: '定期驱虫' },
      { month_offset: 12, category: 'vaccine', action: '疫苗加强', importance: 'high', detail: '每年加强猫三联+狂犬疫苗' }
    ]
  },
  dog: {
    events: [
      { month_offset: 0, category: 'deworming', action: '体内外驱虫', importance: 'high', detail: '内驱每3个月，外驱每月一次' },
      { month_offset: 1, category: 'grooming', action: '洗护与修剪', importance: 'medium', detail: '洗澡每1-2周，指甲每3-4周修剪' },
      { month_offset: 2, category: 'checkup', action: '日常健康观察', importance: 'medium', detail: '观察食欲、精神、排泄情况' },
      { month_offset: 3, category: 'deworming', action: '体内驱虫', importance: 'high', detail: '每3个月定期内驱' },
      { month_offset: 4, category: 'grooming', action: '洗护', importance: 'low', detail: '定期洗澡和梳毛' },
      { month_offset: 6, category: 'checkup', action: '年度体检', importance: 'high', detail: '建议每年进行一次全面体检' },
      { month_offset: 9, category: 'deworming', action: '体内外驱虫', importance: 'high', detail: '定期驱虫' },
      { month_offset: 12, category: 'vaccine', action: '疫苗加强', importance: 'high', detail: '每年加强犬联苗+狂犬疫苗' }
    ]
  }
};

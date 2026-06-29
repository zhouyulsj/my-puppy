import Taro from '@tarojs/taro';
import type {
  AiConfig, HealthData, ShoppingData, UsageGuideData, CalendarData
} from '@/types/ai';
import type { PetProfile, BreedInfo } from '@/types/pet';
import { storage, STORAGE_KEYS } from '@/utils/storage';
import { getDietStageKey, getGroomingKey, healthRules } from '@/data/healthRules';
import { fallbackHealth, fallbackShopping, fallbackGuide, fallbackCalendar } from '@/data/fallbackData';

// AI 配置（智谱 GLM）
export const AI_CONFIG: AiConfig = {
  apiUrl: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
  apiKey: '',
  model: 'glm-4-flash'
};

// H5 环境下浏览器无法直接调用智谱 API（CORS 限制），需通过代理
// 默认使用 corsproxy.io；可在此更换为自建 Cloudflare Worker 等更稳定的代理
const CORS_PROXY = 'https://corsproxy.io/?url=';

// 获取实际请求 URL（H5 走代理，小程序直连）
function getRequestUrl(): string {
  if (process.env.TARO_ENV === 'h5') {
    return CORS_PROXY + encodeURIComponent(AI_CONFIG.apiUrl);
  }
  return AI_CONFIG.apiUrl;
}

// 识别错误类型，返回更友好的提示
function diagnoseError(e: any): string {
  const msg = String(e?.message || e || '');
  if (msg.includes('Failed to fetch') || msg.includes('Network request failed')) {
    if (process.env.TARO_ENV === 'h5') {
      return '网络请求失败（可能是CORS限制或代理服务不可用）。建议在微信小程序中使用AI问答，或检查网络连接。';
    }
    return '网络连接失败，请检查网络后重试。';
  }
  if (msg.includes('timeout') || msg.toLowerCase().includes('abort')) {
    return '请求超时，请稍后重试。';
  }
  return '网络异常，请检查网络后重试。';
}

// 读取本地存储的 API Key
export function loadApiKey(): string {
  const key = storage.get<string>(STORAGE_KEYS.API_KEY) || '';
  AI_CONFIG.apiKey = key;
  return key;
}

// 清洗 AI 返回的 markdown 代码块标记
function cleanContent(content: string): string {
  let cleaned = content.trim();
  cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  return cleaned.trim();
}

// AI 调用封装
export async function callAI(userPrompt: string, systemPrompt: string): Promise<any> {
  // 安全网：每次调用前从存储加载 Key，防止 AI_CONFIG 与存储不同步
  if (!AI_CONFIG.apiKey) {
    loadApiKey();
  }
  if (!AI_CONFIG.apiKey) {
    console.error('[AI] API Key 未配置');
    return null;
  }

  try {
    const res = await Taro.request({
      url: getRequestUrl(),
      method: 'POST',
      timeout: 15000,
      header: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_CONFIG.apiKey}`
      },
      data: {
        model: AI_CONFIG.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000
      }
    });

    if (res.statusCode !== 200) {
      console.error('[AI] 请求失败:', res.statusCode, res.data);
      return null;
    }

    const content = res.data?.choices?.[0]?.message?.content || '';
    const cleaned = cleanContent(content);

    // 尝试 JSON 解析
    if (cleaned.startsWith('{') || cleaned.startsWith('[')) {
      try {
        return JSON.parse(cleaned);
      } catch (e) {
        console.error('[AI] JSON 解析失败:', e);
        return null;
      }
    }
    return cleaned;
  } catch (e) {
    console.error('[AI] 调用异常:', e);
    return null;
  }
}

// ============ Prompt 模板函数 ============

export function buildHealthAssessmentPrompt(pet: PetProfile, breedInfo: BreedInfo) {
  const dietStage = getDietStageKey(pet.species, pet.ageMonths, breedInfo.size);
  const dietRule = (healthRules.diet as any)[dietStage];
  const speciesName = pet.species === 'cat' ? '猫' : '狗';
  const gbStandard = pet.species === 'cat' ? 'GB/T 31217-2014' : 'GB/T 31216-2014';
  const systemPrompt = `你是拥有10年临床经验的宠物健康管理师，具备动物科学专业背景。你的建议基于循证兽医学和中国宠物食品国家标准(GB标准)，保守且安全。所有建议必须明确"不能替代兽医诊断"。只输出严格的JSON格式，不要输出任何其他文字。`;
  const userPrompt = `请为以下宠物生成健康评估，输出严格JSON格式。

宠物信息：
- 名字：${pet.name}
- 种类：${speciesName}
- 品种：${breedInfo.display_name}
- 月龄：${pet.ageMonths}
- 体重：${pet.weight}kg
- 绝育状态：${pet.neutered ? '已绝育' : '未绝育'}

该品种易患疾病：${breedInfo.common_risks.join('、')}
品种预期寿命：${breedInfo.life_expectancy}
当前饮食阶段：${dietStage}（每公斤建议热量${dietRule.calorie_per_kg}kcal，蛋白质≥${dietRule.protein_min}，脂肪≥${dietRule.fat_min}）
饮食标准参考：中国国标${gbStandard}（全价宠物食品 ${speciesName}粮）

输出JSON格式如下，不要输出其他内容：
{
  "risk_alerts": [
    {"level": "high或medium或low", "title": "风险名称", "description": "2-3句说明", "action": "建议措施"}
  ],
  "daily_care": {
    "diet": ["建议1", "建议2"],
    "exercise": ["建议1", "建议2"],
    "environment": ["建议1", "建议2"],
    "mental_health": ["建议1", "建议2"]
  },
  "age_notes": ["特别注意事项1", "注意事项2"]
}

风险提示需结合品种易患疾病和当前月龄，给出3-5条。daily_care每个方向2-3条。饮食建议应引用中国GB标准(GB/T 31216-2014犬粮、GB/T 31217-2014猫粮)，不要使用AAFCO等国外标准。`;
  return { systemPrompt, userPrompt };
}

export function buildShoppingListPrompt(pet: PetProfile, breedInfo: BreedInfo) {
  const dietStage = getDietStageKey(pet.species, pet.ageMonths, breedInfo.size);
  const speciesName = pet.species === 'cat' ? '猫' : '狗';
  const gbStandard = pet.species === 'cat' ? 'GB/T 31217-2014' : 'GB/T 31216-2014';
  const systemPrompt = `你是宠物用品选购顾问，精通宠物食品配料表分析和药品成分，熟悉中国宠物食品国家标准(GB标准)。你不推荐具体品牌，而是教用户"如何选择"。只输出严格的JSON格式，不要输出任何其他文字。`;
  const userPrompt = `请为以下宠物生成采购清单，输出严格JSON格式。

宠物信息：
- 种类：${speciesName}
- 品种：${breedInfo.display_name}
- 月龄：${pet.ageMonths}
- 体重：${pet.weight}kg
- 毛发类型：${breedInfo.coat_type}
- 体型：${breedInfo.size}
- 当前饮食阶段：${dietStage}
- 主粮标准参考：中国国标${gbStandard}（全价宠物食品 ${speciesName}粮）

输出JSON格式如下，分类必须包含：主粮、零食与营养品、驱虫药、常备药品、日常用品。每个分类下2-4个物品。主粮的selection_guide和ingredient_tips应引用中国GB标准(GB/T 31216-2014犬粮、GB/T 31217-2014猫粮)，不要使用AAFCO等国外标准。不要输出其他内容：
{
  "categories": [
    {
      "name": "主粮",
      "icon": "🍖",
      "items": [
        {
          "name": "物品名称",
          "selection_guide": "选购要点2-3句",
          "ingredient_tips": "配料表/成分解读要点",
          "price_range": "预估价格区间",
          "importance": "essential或recommended或optional"
        }
      ]
    }
  ]
}`;
  return { systemPrompt, userPrompt };
}

// 根据用品名返回该类型的特定生成要求（让AI产出针对性内容而非泛泛而谈）
function getItemSpecificRequirements(itemName: string, pet: PetProfile, breedInfo: BreedInfo): string {
  const sp = pet.species === 'cat' ? '猫' : '狗';
  const wt = pet.weight;
  const age = pet.ageMonths;
  const breed = breedInfo.display_name;
  const coat = breedInfo.coat_type;
  const size = breedInfo.size;

  // 主粮
  if (itemName.includes('粮')) {
    const stage = age < 12 ? (pet.species === 'cat' ? '幼猫' : '幼犬') : (age > 84 ? '老年' : '成年');
    return `用品类型：主粮(${stage}期)
特定要求：
- 根据体重${wt}kg和${stage}期计算每日喂食量(克)，给出具体数值和喂食次数
- ${age < 12 ? '幼年少食多餐(每日3-4餐)的具体安排' : '成年每日2餐的时间建议'}
- 换粮7天过渡法的具体步骤(新旧粮比例每日变化)
- 储存方法(密封、避光、保质期)和开封后保存建议
- ${breed}品种是否有特殊饮食需求(如易过敏食材需避开)`;
  }

  // 体内驱虫药
  if (itemName.includes('内驱')) {
    return `用品类型：体内驱虫药
特定要求：
- 根据体重${wt}kg给出具体用量规格(如多少毫克或多少片)
- 喂服方法：可直接喂或混入食物的操作步骤
- 使用频率：每3个月一次(${age < 6 ? '幼年期每2周一次至3月龄' : ''})
- 用药前后注意事项(是否需要空腹、用药后观察要点)
- ${breed}品种是否有用药禁忌(如柯利犬对伊维菌素敏感等)`;
  }

  // 体外驱虫药
  if (itemName.includes('外驱')) {
    return `用品类型：体外驱虫药(滴剂)
特定要求：
- 根据体重${wt}kg选择合适的剂量规格
- 滴药操作分步骤：拨开颈背部毛发→将药液直接滴在皮肤上→沿脊柱多点滴药
- 使用频率：${sp === '猫' ? '每1-2个月一次' : '每月一次'}
- 用药前后48小时不可洗澡，避免接触眼口
- ${sp === '猫' ? '猫对某些成分敏感，必须使用猫专用产品' : '用药后避免与其他宠物接触'}`;
  }

  // 化毛膏
  if (itemName.includes('化毛')) {
    return `用品类型：化毛膏
特定要求：
- 根据体重${wt}kg给出每次用量(约2-3厘米长条)
- 使用频率：换毛季每周2-3次，日常每周1次
- 喂服方法：挤在爪子上让猫自行舔食，或混入猫粮
- ${coat === '长毛' || coat === '双层毛' ? `${breed}是${coat}品种，需增加使用频率` : '短毛猫可适当减少频率'}
- 长期使用注意事项(不可替代猫草，避免过量导致腹泻)`;
  }

  // 洁齿骨
  if (itemName.includes('洁齿') || itemName.includes('齿骨')) {
    return `用品类型：洁齿骨
特定要求：
- 根据${size}体型选择合适尺寸的建议(太小易吞咽危险)
- 每周使用2-3次，每次15-20分钟
- 使用时需监督，防止咬碎后吞咽大块碎片
- 与刷牙配合的建议(洁齿骨不能完全替代刷牙)
- ${breed}品种的口腔健康特点(是否易有牙结石)`;
  }

  // 指甲剪
  if (itemName.includes('指甲')) {
    return `用品类型：指甲剪
特定要求：
- 分步骤操作：①保定宠物②轻压肉垫使指甲伸出③对光观察血线位置④以45度角快速剪断尖端
- 修剪频率：${sp === '猫' ? '每2-3周一次' : '每3-4周一次'}
- 深色指甲无法看到血线的处理方法(每次只剪1-2毫米)
- 万一剪出血的应急处理(止血粉/面粉按压止血)
- ${breed}品种的保定技巧和安抚方法`;
  }

  // 逗猫棒
  if (itemName.includes('逗猫')) {
    return `用品类型：逗猫棒(互动玩具)
特定要求：
- 每日互动时长建议(15-30分钟)和最佳时段(清晨/傍晚符合猫晨昏活动习性)
- 模拟捕猎游戏方式：拖拽躲藏→追逐→扑咬→"捕获"猎物
- 安全注意：检查羽毛/铃铛是否松动，避免误食
- 游戏结束要让猫"抓到"猎物，给予零食奖励，形成闭环
- ${breed}品种的运动需求和互动偏好`;
  }

  // 猫抓板
  if (itemName.includes('抓板')) {
    return `用品类型：猫抓板
特定要求：
- 放置位置：猫休息区附近、沙发旁边等猫常抓挠处
- 材质选择：瓦楞纸(平铺型)或剑麻柱(立式)，${coat}品种的爪部力量适配
- 引导使用方法：撒猫薄荷、用逗猫棒引导、手动示范
- 更换周期：瓦楞纸磨损露底后更换(约2-3个月)
- 多猫家庭需准备N+1个抓板`;
  }

  // 猫砂
  if (itemName.includes('猫砂')) {
    return `用品类型：猫砂
特定要求：
- 铺设厚度5-8cm，太薄结团差，太厚浪费
- 每日铲屎1-2次，保持猫砂盆清洁
- 全面更换周期：2-4周一次，换砂时用消毒液清洗猫砂盆
- 不同材质特点：豆腐砂(可冲厕所)、膨润土(结团好但粉尘大)、混合砂(综合)
- ${breed}品种是否对粉尘敏感(如呼吸道问题需选低粉尘)`;
  }

  // 牵引绳
  if (itemName.includes('牵引') || itemName.includes('绳')) {
    return `用品类型：牵引绳+项圈/胸背带
特定要求：
- 根据${size}和体重${wt}kg选择合适宽度(小型2cm/中大型2.5-3cm)
- 穿戴方法：项圈松紧度以能插入两指为宜；胸背带需调节各带扣
- ${age < 12 ? '幼犬适应训练：室内穿戴5分钟→逐步延长→室内牵行→户外短时间' : '户外使用前检查扣环是否牢固'}
- 安全注意：避免长时间拉扯、远离车辆时收紧牵引绳
- ${breed}品种注意事项(如短鼻犬种需避免剧烈拉扯)`;
  }

  // 拾便袋
  if (itemName.includes('拾便') || itemName.includes('便袋')) {
    return `用品类型：拾便袋
特定要求：
- 使用方法：套在手上→拾取粪便→翻转袋子打结→丢入垃圾桶
- 外出遛狗必带，建议携带数量为预估+2个备用
- 选择可降解材质更环保
- 文明养犬法规提醒(多数城市要求即时清理，违者罚款)
- 放在牵引绳旁固定收纳便于取用`;
  }

  // 犬窝/猫窝
  if (itemName.includes('窝') || itemName.includes('垫')) {
    return `用品类型：宠物窝/垫
特定要求：
- 根据${size}体型选择尺寸(宠物能完全舒展为宜)
- 放置位置：安静避风处、远离穿堂风和空调直吹
- 清洁频率：每周清洗外套，每月深度清洁
- 材质选择：${coat === '长毛' || coat === '双层毛' ? '长毛品种选透气散热好的材质' : '短毛品种可选保暖绒面'}
- ${breed}品种的睡眠习惯(${sp === '猫' ? '喜欢封闭式猫窝' : '喜欢有靠背的窝'})`;
  }

  // 通用
  return `用品类型：通用宠物用品
特定要求：
- 结合此${sp}体重${wt}kg和月龄${age}月给出使用建议
- 分步骤描述具体操作方法
- 针对${breed}品种特点的注意事项`;
}

export function buildUsageGuidePrompt(pet: PetProfile, breedInfo: BreedInfo, itemName: string) {
  const sp = pet.species === 'cat' ? '猫' : '狗';
  const systemPrompt = `你是宠物护理操作指导师，擅长用通俗语言解释专业操作步骤。你会根据具体用品类型和宠物特征(品种、体重、月龄)给出针对性、可操作的详细指导，而非泛泛而谈。只输出严格的JSON格式，不要输出任何其他文字。`;
  const itemReqs = getItemSpecificRequirements(itemName, pet, breedInfo);
  const userPrompt = `请为以下宠物生成"${itemName}"的详细使用指南，输出严格JSON格式。

宠物信息：
- 种类：${sp}
- 品种：${breedInfo.display_name}
- 体重：${pet.weight}kg
- 月龄：${pet.ageMonths}
- 毛型：${breedInfo.coat_type}
- 体型：${breedInfo.size}

${itemReqs}

输出JSON格式如下，不要输出其他内容：
{
  "item_name": "${itemName}",
  "usage_method": "详细使用方法，分3-5个步骤描述，每步具体可操作",
  "dosage": "用量/频率说明，按体重${pet.weight}kg和月龄${pet.ageMonths}月给出具体数值",
  "precautions": ["注意事项1", "注意事项2", "注意事项3", "注意事项4"],
  "common_mistakes": ["常见错误1", "常见错误2", "常见错误3"]
}

要求：
1. usage_method 必须是分步骤的具体操作，不能笼统说"按说明书使用"
2. dosage 必须结合此宠物体重${pet.weight}kg给出具体数值，不能只说"按体重计算"
3. precautions 和 common_mistakes 至少各3条，需针对${breedInfo.display_name}品种和${itemName}的特点
4. 内容要具体、可操作、有数字，不要泛泛而谈`;
  return { systemPrompt, userPrompt };
}

export function buildAnnualCalendarPrompt(pet: PetProfile, breedInfo: BreedInfo) {
  const vaccineRule = (healthRules.vaccine as any)[pet.species];
  const dewormingRule = (healthRules.deworming as any)[pet.species];
  const groomingKey = getGroomingKey(pet.species, breedInfo.coat_type);
  const groomingRule = (healthRules.grooming as any)[groomingKey];
  const neuterRule = (healthRules.neutering as any)[pet.species];

  const systemPrompt = '你是宠物健康管理规划师，擅长制定系统化的全年健康计划。只输出严格的JSON格式，不要输出任何其他文字。';
  const userPrompt = `请为以下宠物生成未来12个月的健康计划，输出严格JSON格式。

宠物信息：
- 种类：${pet.species === 'cat' ? '猫' : '狗'}
- 品种：${breedInfo.display_name}
- 月龄：${pet.ageMonths}
- 体重：${pet.weight}kg
- 绝育状态：${pet.neutered ? '已绝育' : '未绝育'}

参考规则：
- 疫苗：${vaccineRule.schedule.map((s: any) => s.age_months + '月-' + s.action).join('；')}；${vaccineRule.booster}
- 驱虫：内驱${dewormingRule.internal.frequency}(${dewormingRule.internal.drugs})；外驱${dewormingRule.external.frequency}(${dewormingRule.external.drugs})
- 洗护：洗澡${groomingRule.bath}，梳毛${groomingRule.brush}，剪甲${groomingRule.nail}
- 绝育建议：${neuterRule.recommended_age}

输出JSON格式如下，month_offset=0表示当月，1表示下个月，覆盖未来12个月。必须包含驱虫的每季度提醒。不要输出其他内容：
{
  "events": [
    {
      "month_offset": 0,
      "category": "vaccine或deworming或grooming或checkup或neutering或special",
      "action": "具体事项",
      "importance": "high或medium或low",
      "detail": "补充说明"
    }
  ]
}`;
  return { systemPrompt, userPrompt };
}

// ============ 带 fallback 的 AI 调用 ============

export async function fetchHealthData(pet: PetProfile, breedInfo: BreedInfo): Promise<HealthData> {
  const { systemPrompt, userPrompt } = buildHealthAssessmentPrompt(pet, breedInfo);
  const result = await callAI(userPrompt, systemPrompt);
  if (result && result.risk_alerts && result.daily_care) {
    storage.set(STORAGE_KEYS.HEALTH, result);
    return result as HealthData;
  }
  console.warn('[AI] 健康评估使用 fallback 数据');
  return fallbackHealth[pet.species];
}

export async function fetchShoppingData(pet: PetProfile, breedInfo: BreedInfo): Promise<ShoppingData> {
  const { systemPrompt, userPrompt } = buildShoppingListPrompt(pet, breedInfo);
  const result = await callAI(userPrompt, systemPrompt);
  if (result && result.categories && result.categories.length > 0) {
    storage.set(STORAGE_KEYS.SHOPPING, result);
    return result as ShoppingData;
  }
  console.warn('[AI] 采购清单使用 fallback 数据');
  return fallbackShopping[pet.species];
}

export async function fetchUsageGuide(pet: PetProfile, breedInfo: BreedInfo, itemName: string): Promise<UsageGuideData> {
  const { systemPrompt, userPrompt } = buildUsageGuidePrompt(pet, breedInfo, itemName);
  const result = await callAI(userPrompt, systemPrompt);
  if (result && result.usage_method) {
    // 缓存单条指南到存储（按物品名索引）
    const cached = storage.get<Record<string, UsageGuideData>>(STORAGE_KEYS.USAGE_GUIDES) || {};
    cached[itemName] = result as UsageGuideData;
    storage.set(STORAGE_KEYS.USAGE_GUIDES, cached);
    return result as UsageGuideData;
  }
  console.warn('[AI] 使用指南使用 fallback 数据:', itemName);
  return { ...fallbackGuide, item_name: itemName };
}

// 批量预生成使用指南（后台调用，并行生成所有物品）
// 返回成功生成的指南映射，失败的物品使用 fallback
export async function fetchUsageGuidesBatch(
  pet: PetProfile,
  breedInfo: BreedInfo,
  itemNames: string[]
): Promise<Record<string, UsageGuideData>> {
  const result: Record<string, UsageGuideData> = {};

  // 并行生成所有指南（Promise.allSettled 保证单个失败不影响其他）
  const tasks = itemNames.map(async (itemName) => {
    try {
      const guide = await fetchUsageGuide(pet, breedInfo, itemName);
      return { itemName, guide };
    } catch (e) {
      console.error('[AI] 批量生成指南失败:', itemName, e);
      return { itemName, guide: { ...fallbackGuide, item_name: itemName } as UsageGuideData };
    }
  });

  const settled = await Promise.all(tasks);
  for (const { itemName, guide } of settled) {
    result[itemName] = guide;
  }

  // 整体缓存
  storage.set(STORAGE_KEYS.USAGE_GUIDES, result);
  return result;
}

// 从缓存读取使用指南（不触发 AI 调用）
export function getCachedUsageGuide(itemName: string): UsageGuideData | null {
  const cached = storage.get<Record<string, UsageGuideData>>(STORAGE_KEYS.USAGE_GUIDES);
  if (cached && cached[itemName]) {
    return cached[itemName];
  }
  return null;
}

// 获取全部缓存的指南
export function getCachedUsageGuides(): Record<string, UsageGuideData> {
  return storage.get<Record<string, UsageGuideData>>(STORAGE_KEYS.USAGE_GUIDES) || {};
}

export async function fetchCalendarData(pet: PetProfile, breedInfo: BreedInfo): Promise<CalendarData> {
  const { systemPrompt, userPrompt } = buildAnnualCalendarPrompt(pet, breedInfo);
  const result = await callAI(userPrompt, systemPrompt);
  if (result && result.events && result.events.length > 0) {
    storage.set(STORAGE_KEYS.CALENDAR, result);
    return result as CalendarData;
  }
  console.warn('[AI] 全年日历使用 fallback 数据');
  return fallbackCalendar[pet.species];
}

// ============ AI 对话（带知识库检索） ============

import type { ChatMessage, KnowledgeSnippet } from '@/types/chat';
import { searchKnowledge } from '@/services/knowledgeBase';

export interface ChatResult {
  content: string;
  sources: KnowledgeSnippet[];
}

// 调用 AI 对话，自动检索知识库作为上下文
export async function fetchChatAnswer(
  question: string,
  history: ChatMessage[]
): Promise<ChatResult> {
  // 1. 检索相关知识（限制4条，且需达到最低分数阈值）
  const snippets = searchKnowledge(question, { limit: 4 });

  // 2. 构建知识上下文
  const knowledgeContext = snippets.length > 0
    ? snippets.map((s, i) =>
        `【资料${i + 1}】来源：${s.source_label} | ${s.title}\n${s.content}`
      ).join('\n\n')
    : '（未检索到直接相关知识，请基于通用兽医知识回答）';

  // 3. 构建 system prompt
  const systemPrompt = `你是"毛球健康管家"的AI助手，拥有丰富宠物健康知识。回答时遵循：
1. 优先基于下方"知识库资料"作答，资料来源需在回答末尾标注
2. 回答简洁明了，用中文，适当使用要点式
3. 涉及用药/医疗建议时，必须提醒"具体用药请遵兽医医嘱，本回答不能替代专业诊断"
4. 如果知识库资料不足以完整回答，可补充通用知识，但需说明
5. 回答控制在300字以内

知识库资料：
${knowledgeContext}`;

  // 4. 构建对话历史（最近6轮）
  const recentHistory = history.slice(-6);
  const messages: { role: string; content: string }[] = [
    { role: 'system', content: systemPrompt }
  ];
  for (const msg of recentHistory) {
    messages.push({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content
    });
  }
  messages.push({ role: 'user', content: question });

  // 5. 调用 AI
  if (!AI_CONFIG.apiKey) {
    loadApiKey();
  }
  if (!AI_CONFIG.apiKey) {
    return {
      content: '尚未配置AI Key，请在设置中填写智谱GLM的API Key后使用对话功能。',
      sources: snippets
    };
  }

  try {
    const res = await Taro.request({
      url: getRequestUrl(),
      method: 'POST',
      timeout: 20000,
      header: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_CONFIG.apiKey}`
      },
      data: {
        model: AI_CONFIG.model,
        messages,
        temperature: 0.6,
        max_tokens: 1500
      }
    });

    if (res.statusCode !== 200) {
      console.error('[AI Chat] 请求失败:', res.statusCode, res.data);
      const errMsg = res.statusCode === 401
        ? 'API Key 无效或已过期，请检查设置中的智谱GLM Key。'
        : `AI服务返回错误(${res.statusCode})，请稍后重试。`;
      // 错误时不返回来源，避免与错误信息不匹配
      return { content: errMsg, sources: [] };
    }

    const content = res.data?.choices?.[0]?.message?.content || '';
    return { content: content.trim() || '未能获取回答，请重试。', sources: snippets };
  } catch (e) {
    console.error('[AI Chat] 调用异常:', e);
    return { content: diagnoseError(e), sources: [] };
  }
}

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
  if (!AI_CONFIG.apiKey) {
    console.error('[AI] API Key 未配置');
    return null;
  }

  try {
    const res = await Taro.request({
      url: AI_CONFIG.apiUrl,
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
  const systemPrompt = '你是拥有10年临床经验的宠物健康管理师，具备动物科学专业背景。你的建议基于循证兽医学，保守且安全。所有建议必须明确"不能替代兽医诊断"。只输出严格的JSON格式，不要输出任何其他文字。';
  const userPrompt = `请为以下宠物生成健康评估，输出严格JSON格式。

宠物信息：
- 名字：${pet.name}
- 种类：${pet.species === 'cat' ? '猫' : '狗'}
- 品种：${breedInfo.display_name}
- 月龄：${pet.ageMonths}
- 体重：${pet.weight}kg
- 绝育状态：${pet.neutered ? '已绝育' : '未绝育'}

该品种易患疾病：${breedInfo.common_risks.join('、')}
品种预期寿命：${breedInfo.life_expectancy}
当前饮食阶段：${dietStage}（每公斤建议热量${dietRule.calorie_per_kg}kcal，蛋白质≥${dietRule.protein_min}，脂肪≥${dietRule.fat_min}）

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

风险提示需结合品种易患疾病和当前月龄，给出3-5条。daily_care每个方向2-3条。`;
  return { systemPrompt, userPrompt };
}

export function buildShoppingListPrompt(pet: PetProfile, breedInfo: BreedInfo) {
  const dietStage = getDietStageKey(pet.species, pet.ageMonths, breedInfo.size);
  const systemPrompt = '你是宠物用品选购顾问，精通宠物食品配料表分析和药品成分。你不推荐具体品牌，而是教用户"如何选择"。只输出严格的JSON格式，不要输出任何其他文字。';
  const userPrompt = `请为以下宠物生成采购清单，输出严格JSON格式。

宠物信息：
- 种类：${pet.species === 'cat' ? '猫' : '狗'}
- 品种：${breedInfo.display_name}
- 月龄：${pet.ageMonths}
- 体重：${pet.weight}kg
- 毛发类型：${breedInfo.coat_type}
- 体型：${breedInfo.size}
- 当前饮食阶段：${dietStage}

输出JSON格式如下，分类必须包含：主粮、零食与营养品、驱虫药、常备药品、日常用品。每个分类下2-4个物品。不要输出其他内容：
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

export function buildUsageGuidePrompt(pet: PetProfile, breedInfo: BreedInfo, itemName: string) {
  const systemPrompt = '你是宠物护理操作指导师，擅长用通俗语言解释专业操作步骤。只输出严格的JSON格式，不要输出任何其他文字。';
  const userPrompt = `请为以下宠物生成"${itemName}"的使用指南，输出严格JSON格式。

宠物信息：
- 种类：${pet.species === 'cat' ? '猫' : '狗'}
- 品种：${breedInfo.display_name}
- 体重：${pet.weight}kg
- 月龄：${pet.ageMonths}

输出JSON格式如下，不要输出其他内容：
{
  "item_name": "${itemName}",
  "usage_method": "使用方法，分步骤描述",
  "dosage": "用量说明（如按体重计算则给出公式）",
  "precautions": ["注意1", "注意2", "注意3"],
  "common_mistakes": ["常见错误1", "常见错误2"]
}`;
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
    return result as UsageGuideData;
  }
  console.warn('[AI] 使用指南使用 fallback 数据');
  return { ...fallbackGuide, item_name: itemName };
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
  // 1. 检索相关知识
  const snippets = searchKnowledge(question, { limit: 6 });

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
    return {
      content: '尚未配置AI Key，请在设置中填写智谱GLM的API Key后使用对话功能。',
      sources: snippets
    };
  }

  try {
    const res = await Taro.request({
      url: AI_CONFIG.apiUrl,
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
      console.error('[AI Chat] 请求失败:', res.statusCode);
      return { content: 'AI服务暂时不可用，请稍后重试。', sources: snippets };
    }

    const content = res.data?.choices?.[0]?.message?.content || '';
    return { content: content.trim() || '未能获取回答，请重试。', sources: snippets };
  } catch (e) {
    console.error('[AI Chat] 调用异常:', e);
    return { content: '网络异常，请检查网络后重试。', sources: snippets };
  }
}

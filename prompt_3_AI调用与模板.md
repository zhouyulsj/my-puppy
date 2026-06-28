在已有的 index.html 的 <script> 标签中追加以下内容。不要修改已有代码。

【1. AI API调用封装函数】

创建 async function callAI(prompt, systemPrompt) 函数：
- 使用 fetch 调用大模型API
- API地址和Key从页面顶部的一个配置对象读取：

const AI_CONFIG = {
  apiUrl: "https://open.bigmodel.cn/api/paas/v4/chat/completions",  // 智谱API，可替换
  apiKey: "",  // 留空，使用时填入
  model: "glm-4-flash"
}

- 请求体格式：{ model: AI_CONFIG.model, messages: [{ role: "system", content: systemPrompt }, { role: "user", content: prompt }], temperature: 0.7, max_tokens: 2000 }
- 返回值：解析后的content文本
- 错误处理：超时10秒，失败时返回null并console.error
- 如果API返回的content是JSON字符串（以{或[开头），自动JSON.parse后返回对象
- 【关键】JSON解析前必须先清洗AI返回的markdown代码块标记，因为AI经常在JSON外面包裹```json和```，直接parse会报错。清洗逻辑如下：
  let content = response.choices[0].message.content.trim();
  content = content.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  然后再判断是否以{或[开头，如果是则JSON.parse

【2. 四个Prompt模板函数】

每个函数接收 currentPet 对象和对应的 breed_database 条目，返回 { systemPrompt, userPrompt } 对象。

函数1：buildHealthAssessmentPrompt(pet, breedInfo)
- systemPrompt：你是拥有10年临床经验的宠物健康管理师，具备动物科学专业背景。你的建议基于循证兽医学，保守且安全。所有建议必须明确"不能替代兽医诊断"。
- userPrompt中包含：宠物完整信息、该品种common_risks、当前月龄对应的饮食阶段（从health_rules.diet取）
- 要求AI输出严格JSON格式：
{
  "risk_alerts": [
    { "level": "high"|"medium"|"low", "title": "风险名称", "description": "2-3句说明", "action": "建议措施" }
  ],
  "daily_care": {
    "diet": ["建议1", "建议2"],
    "exercise": ["建议1", "建议2"],
    "environment": ["建议1", "建议2"],
    "mental_health": ["建议1", "建议2"]
  },
  "age_notes": ["特别注意事项1", "注意事项2"]
}

函数2：buildShoppingListPrompt(pet, breedInfo)
- systemPrompt：你是宠物用品选购顾问，精通宠物食品配料表分析和药品成分。你不推荐具体品牌，而是教用户"如何选择"。
- userPrompt中包含：宠物完整信息、coat_type（影响洗护用品）、size（影响用品尺寸）、当前饮食阶段
- 要求AI输出严格JSON格式：
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
          "importance": "essential"|"recommended"|"optional"
        }
      ]
    }
  ]
}
分类必须包含：主粮、零食与营养品、驱虫药、常备药品、日常用品

函数3：buildUsageGuidePrompt(pet, breedInfo, itemName)
- systemPrompt：你是宠物护理操作指导师，擅长用通俗语言解释专业操作步骤。
- userPrompt中包含：宠物完整信息、要查询的物品名称
- 要求AI输出严格JSON格式：
{
  "item_name": "物品名",
  "usage_method": "使用方法，分步骤描述",
  "dosage": "用量说明（如按体重计算则给出公式）",
  "precautions": ["注意1", "注意2", "注意3"],
  "common_mistakes": ["常见错误1", "常见错误2"]
}

函数4：buildAnnualCalendarPrompt(pet, breedInfo)
- systemPrompt：你是宠物健康管理规划师，擅长制定系统化的全年健康计划。
- userPrompt中包含：宠物完整信息、从health_rules中提取的疫苗时间表/驱虫频率/洗护频率/绝育建议
- 要求AI输出严格JSON格式：
{
  "events": [
    {
      "month_offset": 0,
      "category": "vaccine"|"deworming"|"grooming"|"checkup"|"neutering"|"special",
      "action": "具体事项",
      "importance": "high"|"medium"|"low",
      "detail": "补充说明"
    }
  ]
}
month_offset=0表示当月，1表示下个月，覆盖未来12个月。必须包含驱虫的每月/每季度提醒。

【3. Fallback数据】

为每个模块准备一个硬编码的通用fallback对象（猫一份、狗一份），当AI调用失败时使用。内容基于health_rules生成，不需要很详细，但要保证页面不空白。

请输出需要追加的完整JS代码。
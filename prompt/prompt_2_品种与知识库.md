在已有的 index.html 基础上，在 <script> 标签内添加两个数据对象。不要修改已有代码，只追加内容。

【数据对象1：breed_database】
结构如下，猫和狗各覆盖15个常见品种：

const breed_database = {
  cat: {
    品种key: {
      display_name: "中文名",
      adult_weight: { min: 数字, max: 数字 },  // 单位kg
      common_risks: ["风险1", "风险2", "风险3"],  // 该品种易患疾病，2-4个
      life_expectancy: "X-Y年",
      coat_type: "短毛" | "长毛" | "无毛",
      size: "小型" | "中型"  // 猫一般不分大中型
    }
  },
  dog: {
    品种key: {
      display_name: "中文名",
      adult_weight: { min: 数字, max: 数字 },
      common_risks: ["风险1", "风险2"],
      life_expectancy: "X-Y年",
      coat_type: "短毛" | "长毛" | "双层毛",
      size: "小型犬" | "中型犬" | "大型犬"
    }
  }
}

猫的15个品种：英国短毛猫、美国短毛猫、布偶猫、波斯猫、暹罗猫、缅因猫、橘猫(中华田园猫)、狸花猫、加菲猫(异国短毛猫)、金渐层、银渐层、孟买猫、斯芬克斯无毛猫、苏格兰折耳猫、伯曼猫

狗的15个品种：金毛寻回犬、拉布拉多、柯基、泰迪(贵宾犬)、哈士奇、萨摩耶、边牧、柴犬、法斗、比熊、博美、雪纳瑞、德牧、阿拉斯加、吉娃娃

每个品种的 common_risks 必须基于真实兽医知识填写，这是产品专业性的核心。

【数据对象2：health_rules】
结构如下：

const health_rules = {
  vaccine: {
    cat: {
      core: ["疫苗名称"],
      schedule: [
        { age_months: 数字, action: "具体操作描述" }
      ],
      non_core: ["非核心疫苗"],
      booster: "加强针说明"
    },
    dog: { /* 同结构 */ }
  },
  deworming: {
    cat: {
      internal: { frequency: "频率", drugs: "常见药物类型", note: "注意事项" },
      external: { frequency: "频率", drugs: "常见药物类型", note: "注意事项" }
    },
    dog: { /* 同结构 */ }
  },
  grooming: {
    short_hair_cat: { bath: "频率", brush: "频率", nail: "频率", ear_clean: "频率" },
    long_hair_cat: { bath: "频率", brush: "频率", nail: "频率", ear_clean: "频率" },
    short_hair_dog: { /* 同结构 */ },
    long_hair_dog: { /* 同结构 */ }
  },
  neutering: {
    cat: { recommended_age: "建议月龄", benefits: ["好处1","好处2"], note: "注意事项" },
    dog: { recommended_age: "建议月龄（区分体型）", benefits: ["好处1","好处2"], note: "注意事项" }
  },
  diet: {
    kitten: { calorie_per_kg: 数字, protein_min: "百分比", fat_min: "百分比", note: "喂养要点" },
    adult_cat: { /* 同结构 */ },
    senior_cat: { /* 同结构 */ },
    puppy_small: { /* 同结构 */ },
    puppy_medium: { /* 同结构 */ },
    puppy_large: { /* 同结构 */ },
    adult_dog_small: { /* 同结构 */ },
    adult_dog_medium: { /* 同结构 */ },
    adult_dog_large: { /* 同结构 */ },
    senior_dog: { /* 同结构 */ }
  }
}

所有医学数据必须基于中国宠物医疗通用指南，驱虫药写类型（如"含吡喹酮成分的内驱药"）而非品牌名。疫苗时间表按中国宠物医院通行方案。

请输出需要追加到 <script> 标签中的完整JS代码。
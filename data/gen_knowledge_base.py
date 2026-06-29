# -*- coding: utf-8 -*-
"""
将 data/ 目录下的 6 个 CSV 文件转换为 KnowledgeEntry 数组，
注入到 src/data/knowledgeBase.ts 中。

CSV 文件：
  - pet_food_ingredients.csv  猫粮犬粮配料
  - pet_snacks.csv            宠物零食
  - pet_medicines.csv         宠物药品
  - breed_defects.csv         品种遗传缺陷
  - infectious_diseases.csv   传染病
  - parasitic_diseases.csv    寄生虫病

脚本对字段名自适应：通过字段名匹配关键字段（name/category/ingredient 等），
其余字段以"中文标签：值"的形式拼接到 content。
"""
import csv
import os
import re
import json

DATA_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(DATA_DIR)
TARGET_FILE = os.path.join(PROJECT_ROOT, 'src', 'data', 'knowledgeBase.ts')

# 各 CSV 的来源标识
CSV_SOURCES = [
    {
        'file': 'pet_food_ingredients.csv',
        'source': 'food_ingredients',
        'source_label': '猫粮犬粮配料',
        'default_category': '饲料配料',
        'name_fields': ['ingredient_name', 'name', 'ingredient', 'ingredient_cn', 'raw_material', '成分名称', '配料名称', '原料名称'],
        'category_fields': ['category', 'ingredient_category', '分类', '类别', '配料类别'],
    },
    {
        'file': 'pet_snacks.csv',
        'source': 'snacks',
        'source_label': '宠物零食',
        'default_category': '零食',
        'name_fields': ['snack_name', 'name', '零食名称', '名称'],
        'category_fields': ['category', 'snack_category', '分类', '类别'],
    },
    {
        'file': 'pet_medicines.csv',
        'source': 'medicines',
        'source_label': '宠物药品',
        'default_category': '药品',
        'name_fields': ['medicine_name', 'name', 'drug_name', '药品名称', '药物名称', '名称'],
        'category_fields': ['category', 'medicine_category', '分类', '类别', '药品类别'],
    },
    {
        'file': 'breed_defects.csv',
        'source': 'breed_defects',
        'source_label': '品种遗传缺陷',
        'default_category': '遗传缺陷',
        'name_fields': ['defect_name', 'disease_name', 'name', '缺陷名称', '疾病名称', '名称'],
        'category_fields': ['breed', 'category', 'affected_breed', '品种', '分类'],
    },
    {
        'file': 'infectious_diseases.csv',
        'source': 'infectious_diseases',
        'source_label': '传染病',
        'default_category': '传染病',
        'name_fields': ['disease_name', 'name', '疾病名称', '名称'],
        'category_fields': ['category', 'disease_category', '分类', '类别'],
    },
    {
        'file': 'parasitic_diseases.csv',
        'source': 'parasitic_diseases',
        'source_label': '寄生虫病',
        'default_category': '寄生虫病',
        'name_fields': ['disease_name', 'parasite_name', 'name', '疾病名称', '寄生虫名称', '名称'],
        'category_fields': ['category', 'parasite_type', '分类', '类别'],
    },
]

# 字段中文标签映射（用于 content 拼接）
FIELD_LABELS = {
    'snack_name': '名称', 'english_name': '英文名', 'name': '名称',
    'ingredient_name': '配料名称', 'ingredient': '配料', 'raw_material': '原料',
    'medicine_name': '药品名称', 'drug_name': '药物名称', 'active_ingredient': '有效成分',
    'defect_name': '缺陷名称', 'disease_name': '疾病名称', 'parasite_name': '寄生虫名称',
    'category': '分类', 'snack_category': '分类', 'ingredient_category': '配料类别',
    'medicine_category': '药品类别', 'disease_category': '疾病类别', 'parasite_type': '寄生虫类型',
    'breed': '品种', 'affected_breed': '易感品种', 'affected_species': '易感动物',
    'main_ingredients': '主要成分', 'ingredient_list': '成分列表', 'composition': '成分构成',
    'nutritional_value': '营养价值', 'nutrient_content': '营养成分', 'nutrition_facts': '营养数据',
    'efficacy': '功效', 'function': '功能', 'indication': '适应症', 'uses': '用途',
    'suitable_for': '适用对象', 'suitable_stage': '适用阶段', 'applicable_species': '适用物种',
    'feeding_frequency': '喂食频率', 'daily_intake': '每日摄入量', 'dosage': '用量',
    'dose': '剂量', 'dosage_guide': '用量说明', 'usage': '用法', 'usage_method': '使用方法',
    'caution': '注意事项', 'precautions': '注意事项', 'contraindication': '禁忌',
    'side_effect': '副作用', 'adverse_reaction': '不良反应',
    'symptom': '症状', 'symptoms': '症状', 'clinical_signs': '临床症状',
    'cause': '病因', 'etiology': '病因', 'pathogen': '病原体', 'pathogenesis': '致病机理',
    'transmission': '传播途径', 'transmission_route': '传播途径', 'infectivity': '传染性',
    'prevention': '预防', 'prevention_method': '预防措施', 'prophylaxis': '预防',
    'treatment': '治疗', 'treatment_method': '治疗方法', 'therapy': '治疗方案',
    'severity': '严重程度', 'mortality': '死亡率', 'prognosis': '预后',
    'origin': '产地', 'source': '来源', 'appearance': '外观', 'texture': '质地',
    'flavor': '口味', 'shelf_life': '保质期', 'storage': '储存方式',
    'notes': '备注', 'remark': '备注', 'description': '描述', 'detail': '详情',
    'breed_defect': '品种缺陷', 'genetic_cause': '遗传原因', 'inheritance': '遗传方式',
    'diagnosis': '诊断', 'diagnostic_method': '诊断方法', 'differential_diagnosis': '鉴别诊断',
    'incubation_period': '潜伏期', 'onset_age': '发病年龄', 'onset_season': '发病季节',
    'zoonotic': '人畜共患', 'vaccine': '疫苗', 'vaccine_available': '可用疫苗',
    'price_range': '价格区间', 'alternative': '替代品',
    'sub_category': '子分类', 'main_nutrient': '主要营养素',
    'reference_range': '参考标准', 'is_controversial': '是否争议成分',
    'controversy': '争议说明', 'standard': '标准', 'specification': '规格',
    'manufacturer': '生产商', 'brand': '品牌', 'form': '剂型',
    'administration': '给药方式', 'withdrawal_period': '休药期',
    'target_pest': '目标寄生虫', 'target_pathogen': '目标病原',
    'prevalence': '流行率', 'high_risk_group': '高危群体',
    'complication': '并发症', 'sequelae': '后遗症',
    'carrier': '携带者', 'reservoir': '储存宿主', 'vector': '传播媒介',
    'is_zoonotic': '人畜共患', 'mortality_rate': '死亡率',
    'recovery_rate': '治愈率', 'immune_duration': '免疫持续期',
    'affected_breeds': '易感品种', 'screening_advice': '筛查建议',
    'risk_factors': '危险因素', 'management': '管理',
    'mechanism': '作用机理', 'is_rx': '是否处方药',
    'susceptible_species': '易感物种', 'mortality': '死亡率',
    'latin_name': '拉丁学名', 'parasite_location': '寄生部位',
    'treatment_drugs': '治疗药物', 'parasite_type': '寄生虫类型',
}


def find_field(row_keys, candidates):
    """在 row_keys 中查找第一个匹配候选名的字段（不区分大小写）"""
    lower_keys = {k.lower(): k for k in row_keys}
    for cand in candidates:
        if cand.lower() in lower_keys:
            return lower_keys[cand.lower()]
    return None


def get_label(field_name):
    """获取字段的中文标签，找不到则用字段名本身"""
    if field_name in FIELD_LABELS:
        return FIELD_LABELS[field_name]
    # 尝试模糊匹配
    fl = field_name.lower()
    for k, v in FIELD_LABELS.items():
        if k.lower() == fl:
            return v
    # 将下划线命名转为可读形式
    return field_name.replace('_', ' ')


def extract_keywords(name, english_name, category, row):
    """从行数据中提取检索关键词"""
    kws = []
    if name:
        kws.append(name)
    if english_name:
        kws.append(english_name)
    if category:
        kws.append(category)
    # 加入品种字段（如果有）
    for k in ('breed', 'affected_breed', 'affected_breeds', 'affected_species',
              'applicable_species', 'susceptible_species'):
        if k in row and row[k]:
            kws.append(row[k])
    # 加入主要成分/症状/病原体等关键字段
    for k in ('main_ingredients', 'ingredient', 'active_ingredient', 'symptom',
              'symptoms', 'pathogen', 'cause', 'indication', 'efficacy',
              'treatment', 'prevention', 'category', 'sub_category',
              'mechanism', 'active_ingredient'):
        if k in row and row[k]:
            kws.append(row[k])
    # 切分：按常见分隔符
    flat = []
    for kw in kws:
        if not kw:
            continue
        for part in re.split(r'[、，,；;/／\|]+', str(kw)):
            p = part.strip()
            if p and len(p) >= 1:
                flat.append(p)
    return flat


def build_content(name, row, skip_fields):
    """将行数据拼接成内容字符串"""
    lines = []
    if name:
        lines.append(f'名称：{name}')
    for k, v in row.items():
        if not v:
            continue
        if k in skip_fields:
            continue
        label = get_label(k)
        lines.append(f'{label}：{v}')
    return '\n'.join(lines)


def process_csv(csv_config):
    """处理单个 CSV 文件，返回 KnowledgeEntry 字典列表"""
    csv_path = os.path.join(DATA_DIR, csv_config['file'])
    if not os.path.exists(csv_path):
        print(f'[WARN] 文件不存在，跳过：{csv_config["file"]}')
        return []

    entries = []
    with open(csv_path, 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        rows = list(reader)

    if not rows:
        print(f'[WARN] 文件为空：{csv_config["file"]}')
        return []

    row_keys = list(rows[0].keys())
    name_field = find_field(row_keys, csv_config['name_fields'])
    category_field = find_field(row_keys, csv_config['category_fields'])
    english_field = find_field(row_keys, ['english_name', 'en_name', '英文名'])

    if not name_field:
        # 退化为第一个字段
        name_field = row_keys[0]
        print(f'[WARN] {csv_config["file"]} 未识别到名称字段，使用首字段：{name_field}')

    for row in rows:
        name = (row.get(name_field) or '').strip()
        if not name:
            continue
        category = (row.get(category_field) or csv_config['default_category']).strip() if category_field else csv_config['default_category']
        english = (row.get(english_field) or '').strip() if english_field else ''

        skip_fields = {name_field, category_field, english_field}
        content = build_content(name, row, skip_fields)
        keywords = extract_keywords(name, english, category, row)

        entries.append({
            'source': csv_config['source'],
            'source_label': csv_config['source_label'],
            'category': category,
            'title': name,
            'content': content,
            'keywords': keywords,
        })

    print(f'[OK] {csv_config["file"]}: {len(entries)} 条')
    return entries


def to_ts_string(s):
    """转义为 TS 字符串字面量"""
    return json.dumps(s, ensure_ascii=False)


def to_ts_array(arr):
    """转义为 TS 数组字面量"""
    return '[' + ', '.join(to_ts_string(x) for x in arr) + ']'


def generate_ts_entries(entries):
    """生成 TS 代码片段"""
    lines = []
    for e in entries:
        lines.append('  {')
        lines.append(f"    source: {to_ts_string(e['source'])},")
        lines.append(f"    source_label: {to_ts_string(e['source_label'])},")
        lines.append(f"    category: {to_ts_string(e['category'])},")
        lines.append(f"    title: {to_ts_string(e['title'])},")
        lines.append(f"    content: {to_ts_string(e['content'])},")
        lines.append(f"    keywords: {to_ts_array(e['keywords'])}")
        lines.append('  },')
    return '\n'.join(lines)


def main():
    all_entries = []
    for cfg in CSV_SOURCES:
        all_entries.extend(process_csv(cfg))

    print(f'\n[SUM] 共 {len(all_entries)} 条知识条目')

    # 生成 TS 代码（保留占位符注释以便重复执行）
    ts_body = generate_ts_entries(all_entries)
    ts_block = f'// 静态知识条目（由 CSV 转换，由 gen_knowledge_base.py 注入）\n'
    ts_block += f'// __CSV_ENTRIES_PLACEHOLDER__\n'
    ts_block += f'// 共 {len(all_entries)} 条，来源：' + '、'.join(sorted({e["source_label"] for e in all_entries})) + '\n'
    ts_block += f'const csvEntries: KnowledgeEntry[] = [\n{ts_body}];'

    # 读取目标文件
    with open(TARGET_FILE, 'r', encoding='utf-8') as f:
        content = f.read()

    # 替换占位区（匹配从 "// 静态知识条目" 到 "const csvEntries: KnowledgeEntry[] = [...];" 的整块）
    # 注意：保留 __CSV_ENTRIES_PLACEHOLDER__ 标记，使脚本可重复执行
    pattern = re.compile(
        r'// 静态知识条目.*?const csvEntries: KnowledgeEntry\[\] = \[[\s\S]*?\];',
        re.DOTALL
    )
    if not pattern.search(content):
        print('[ERROR] 未找到占位区，请检查 knowledgeBase.ts')
        return

    new_content = pattern.sub(lambda m: ts_block, content)

    with open(TARGET_FILE, 'w', encoding='utf-8') as f:
        f.write(new_content)

    print(f'[DONE] 已写入 {TARGET_FILE}')


if __name__ == '__main__':
    main()

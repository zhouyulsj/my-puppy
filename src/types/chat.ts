// AI 对话相关类型定义

export type MessageRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  sources?: KnowledgeSnippet[]; // AI 回答引用的知识库片段
  timestamp: number;
}

// 知识库条目（统一结构，由各 CSV 转换而来）
export interface KnowledgeEntry {
  source: string;      // 来源表: food_ingredients / snacks / medicines / breed_defects / infectious_diseases / parasitic_diseases / breeds
  source_label: string; // 来源中文名
  category: string;    // 分类
  title: string;       // 标题（成分名/药品名/疾病名等）
  content: string;     // 全文内容
  keywords: string[];  // 检索关键词
}

// 检索命中的知识片段
export interface KnowledgeSnippet {
  source: string;
  source_label: string;
  title: string;
  content: string;
  score: number;
}

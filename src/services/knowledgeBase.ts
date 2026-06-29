import type { KnowledgeSnippet } from '@/types/chat';
import { knowledgeBase } from '@/data/knowledgeBase';

// 停用词表（检索时忽略）
const STOP_WORDS = new Set([
  '的', '了', '是', '在', '我', '有', '和', '就', '不', '人', '都', '一', '个',
  '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好',
  '吗', '什么', '怎么', '为什么', '请问', '请', '问', '想', '需要', '可以', '能',
  '关于', '对于', '这个', '那个', '哪些', '哪种', '一些', '比较', '应该', '如果'
]);

// 分词：按非汉字/字母字符切分，并过滤停用词和过短词
function tokenize(query: string): string[] {
  const tokens: string[] = [];
  // 按非汉字非字母数字字符切分
  const parts = query.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, ' ').split(/\s+/);
  for (const part of parts) {
    if (!part || part.length < 1) continue;
    if (STOP_WORDS.has(part)) continue;
    tokens.push(part.toLowerCase());
  }
  // 额外：对长中文串尝试滑动切分（2-4字组合）以提升召回
  const extraTokens: string[] = [];
  for (const part of parts) {
    if (/^[\u4e00-\u9fa5]+$/.test(part) && part.length >= 3) {
      for (let len = 2; len <= Math.min(4, part.length - 1); len++) {
        for (let i = 0; i <= part.length - len; i++) {
          const sub = part.slice(i, i + len);
          if (!STOP_WORDS.has(sub)) extraTokens.push(sub.toLowerCase());
        }
      }
    }
  }
  return [...tokens, ...extraTokens];
}

// 检索知识库，返回按相关性排序的结果
export function searchKnowledge(
  query: string,
  options?: { limit?: number; sourceFilter?: string }
): KnowledgeSnippet[] {
  const limit = options?.limit ?? 8;
  const tokens = tokenize(query);
  if (tokens.length === 0) return [];

  const results: KnowledgeSnippet[] = [];

  for (const entry of knowledgeBase) {
    if (options?.sourceFilter && entry.source !== options.sourceFilter) continue;

    let score = 0;
    const titleLower = entry.title.toLowerCase();
    const contentLower = entry.content.toLowerCase();

    for (const token of tokens) {
      // 标题命中权重高
      if (titleLower.includes(token)) {
        score += titleLower === token ? 10 : 5;
      }
      // 关键词命中
      if (entry.keywords.some((k) => k.toLowerCase().includes(token) || token.includes(k.toLowerCase()))) {
        score += 3;
      }
      // 内容命中
      if (contentLower.includes(token)) {
        score += 1;
      }
    }

    if (score > 0) {
      results.push({
        source: entry.source,
        source_label: entry.source_label,
        title: entry.title,
        content: entry.content,
        score
      });
    }
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, limit);
}

// 获取所有知识库来源列表（用于分类筛选）
export function getKnowledgeSources(): { source: string; label: string; count: number }[] {
  const map = new Map<string, { label: string; count: number }>();
  for (const entry of knowledgeBase) {
    const existing = map.get(entry.source);
    if (existing) {
      existing.count++;
    } else {
      map.set(entry.source, { label: entry.source_label, count: 1 });
    }
  }
  return Array.from(map.entries()).map(([source, { label, count }]) => ({
    source,
    label,
    count
  }));
}

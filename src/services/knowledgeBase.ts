import type { KnowledgeSnippet } from '@/types/chat';
import { knowledgeBase } from '@/data/knowledgeBase';

// 停用词表（检索时忽略）
const STOP_WORDS = new Set([
  '的', '了', '是', '在', '我', '有', '和', '就', '不', '人', '都', '一', '个',
  '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好',
  '吗', '什么', '怎么', '为什么', '请问', '请', '问', '想', '需要', '可以', '能',
  '关于', '对于', '这个', '那个', '哪些', '哪种', '一些', '比较', '应该', '如果'
]);

// 泛化词（单字"猫"/"狗"等不应作为反向匹配依据，否则"猫粮"会匹配到关键词"猫"）
const GENERIC_KEYWORDS = new Set(['猫', '狗', '犬', '宠物', '动物']);

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

// 关键词匹配：k 包含 token 或 token 包含 k
// 但对泛化词(猫/狗等)不做反向匹配(token.includes(k))，避免"猫粮"误匹配"猫"
function keywordMatch(keywords: string[], token: string): boolean {
  return keywords.some((k) => {
    const kl = k.toLowerCase();
    // 正向：关键词包含 token（如关键词"布偶猫"包含 token"布偶"）
    if (kl.includes(token)) return true;
    // 反向：token 包含关键词（如 token"猫粮配料"包含关键词"猫粮"）
    // 但泛化词(猫/狗)不做反向匹配，否则任何含"猫"的 token 都会命中
    if (GENERIC_KEYWORDS.has(kl)) return false;
    // 反向匹配要求关键词至少2字，避免单字误匹配
    if (kl.length < 2) return false;
    return token.includes(kl);
  });
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
    let titleHit = false;
    let keywordHit = false;
    const titleLower = entry.title.toLowerCase();
    const contentLower = entry.content.toLowerCase();

    for (const token of tokens) {
      // 标题命中权重高
      if (titleLower.includes(token)) {
        score += titleLower === token ? 10 : 5;
        titleHit = true;
      }
      // 关键词命中
      if (keywordMatch(entry.keywords, token)) {
        score += 3;
        keywordHit = true;
      }
      // 内容命中
      if (contentLower.includes(token)) {
        score += 1;
      }
    }

    // 最低分数阈值：需标题或关键词命中，且总分 >= 5
    // 仅内容匹配(纯堆量)不足以纳入结果
    if (score >= 5 && (titleHit || keywordHit)) {
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

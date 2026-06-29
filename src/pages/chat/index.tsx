import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, Textarea } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { fetchChatAnswer } from '@/services/ai';
import { getKnowledgeSources } from '@/services/knowledgeBase';
import { usePetStore } from '@/store/petStore';
import SettingsModal from '@/components/SettingsModal';
import type { ChatMessage } from '@/types/chat';

const QUICK_QUESTIONS = [
  '猫粮配料表怎么看？',
  '布偶猫容易得什么病？',
  '狗狗驱虫药怎么选？',
  '猫瘟有什么症状？',
  '哪些食物对猫有毒？',
  '法斗为什么容易打呼噜？'
];

let msgIdCounter = 0;
function genId(): string {
  msgIdCounter += 1;
  return `msg_${Date.now()}_${msgIdCounter}`;
}

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [inputKey, setInputKey] = useState(0); // 用于强制重置 Textarea
  const scrollViewRef = useRef<string>('');

  const apiKey = usePetStore((s) => s.apiKey);
  const sources = getKnowledgeSources();

  // 滚动到底部
  const scrollToBottom = () => {
    const id = `msg-bottom-${Date.now()}`;
    scrollViewRef.current = id;
    // Taro ScrollView 用 scrollIntoView
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: ChatMessage = {
      id: genId(),
      role: 'user',
      content: trimmed,
      timestamp: Date.now()
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setInputKey((k) => k + 1); // 强制 Textarea 重新挂载，确保清空
    setLoading(true);

    try {
      const result = await fetchChatAnswer(trimmed, messages);
      const assistantMsg: ChatMessage = {
        id: genId(),
        role: 'assistant',
        content: result.content,
        sources: result.sources,
        timestamp: Date.now()
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (e) {
      console.error('[Chat] 发送失败:', e);
      Taro.showToast({ title: '发送失败，请重试', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  const onSend = () => {
    sendMessage(input);
  };

  const onQuickQuestion = (q: string) => {
    sendMessage(q);
  };

  const onSourceClick = (source: string) => {
    Taro.showToast({ title: source, icon: 'none', duration: 1200 });
  };

  return (
    <View className={styles.container}>
      {/* 顶部知识库概览 */}
      <View className={styles.header}>
        <View className={styles.headerTitle}>
          <Text className={styles.headerIcon}>💬</Text>
          <Text className={styles.headerText}>毛球AI问答</Text>
          <View
            className={styles.settingsBtn}
            onClick={() => setSettingsOpen(true)}
          >
            <Text className={styles.settingsIcon}>{apiKey ? '⚙️' : '⚠️'}</Text>
          </View>
        </View>
        <ScrollView scrollX className={styles.sourceBar} enhanced showScrollbar={false}>
          {sources.map((s) => (
            <View key={s.source} className={styles.sourceChip}>
              <Text className={styles.sourceChipText}>{s.label}({s.count})</Text>
            </View>
          ))}
        </ScrollView>
        {!apiKey && (
          <View className={styles.keyWarning} onClick={() => setSettingsOpen(true)}>
            <Text className={styles.keyWarningText}>⚠️ 未配置API Key，点击此处设置智谱GLM Key后即可对话</Text>
          </View>
        )}
      </View>
      <SettingsModal visible={settingsOpen} onClose={() => setSettingsOpen(false)} />

      {/* 消息列表 */}
      <ScrollView
        className={styles.messageList}
        scrollY
        scrollIntoView={scrollViewRef.current}
        scrollTop={99999}
        enhanced
      >
        {messages.length === 0 && (
          <View className={styles.empty}>
            <Text className={styles.emptyIcon}>🐾</Text>
            <Text className={styles.emptyTitle}>向毛球AI提问吧</Text>
            <Text className={styles.emptyDesc}>
              我可以帮你查询品种知识、猫粮犬粮成分、{'\n'}药品、疾病等信息
            </Text>
            <View className={styles.quickList}>
              {QUICK_QUESTIONS.map((q) => (
                <View
                  key={q}
                  className={styles.quickChip}
                  onClick={() => onQuickQuestion(q)}
                >
                  <Text className={styles.quickChipText}>{q}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {messages.map((msg) => (
          <View
            key={msg.id}
            className={classnames(styles.message, msg.role === 'user' ? styles.userMsg : styles.aiMsg)}
          >
            {msg.role === 'assistant' && (
              <View className={styles.avatar}>
                <Text className={styles.avatarIcon}>🐾</Text>
              </View>
            )}
            <View className={styles.bubbleWrap}>
              <View
                className={classnames(
                  styles.bubble,
                  msg.role === 'user' ? styles.userBubble : styles.aiBubble
                )}
              >
                <Text className={styles.bubbleText}>{msg.content}</Text>
              </View>
              {msg.role === 'assistant' && msg.sources && msg.sources.length > 0 && (
                <View className={styles.sources}>
                  <Text className={styles.sourcesLabel}>📎 参考来源：</Text>
                  <View className={styles.sourceTags}>
                    {msg.sources.slice(0, 4).map((s, i) => (
                      <View
                        key={i}
                        className={styles.sourceTag}
                        onClick={() => onSourceClick(`${s.source_label}：${s.title}`)}
                      >
                        <Text className={styles.sourceTagText}>{s.title}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
            {msg.role === 'user' && (
              <View className={classnames(styles.avatar, styles.userAvatar)}>
                <Text className={styles.avatarIcon}>🐱</Text>
              </View>
            )}
          </View>
        ))}

        {loading && (
          <View className={classnames(styles.message, styles.aiMsg)}>
            <View className={styles.avatar}>
              <Text className={styles.avatarIcon}>🐾</Text>
            </View>
            <View className={classnames(styles.bubble, styles.aiBubble, styles.loadingBubble)}>
              <Text className={styles.loadingDots}>AI 思考中</Text>
              <Text className={styles.loadingDot1}>·</Text>
              <Text className={styles.loadingDot2}>·</Text>
              <Text className={styles.loadingDot3}>·</Text>
            </View>
          </View>
        )}
        <View id='msg-bottom' />
      </ScrollView>

      {/* 输入区 */}
      <View className={styles.inputBar}>
        <Textarea
          key={`input-${inputKey}`}
          className={styles.input}
          value={input}
          onInput={(e) => setInput(e.detail.value)}
          onConfirm={onSend}
          placeholder='输入你的问题...'
          placeholderClass={styles.placeholder}
          confirmType='send'
          autoHeight
          maxlength={200}
          disabled={loading}
        />
        <View
          className={classnames(styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled)}
          onClick={onSend}
        >
          <Text className={styles.sendBtnText}>发送</Text>
        </View>
      </View>
    </View>
  );
};

export default ChatPage;

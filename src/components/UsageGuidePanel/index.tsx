import React, { useState, useEffect } from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';
import type { UsageGuideData } from '@/types/ai';
import type { PetProfile, BreedInfo } from '@/types/pet';
import { fetchUsageGuide } from '@/services/ai';
import { usePetStore } from '@/store/petStore';
import LoadingPaw from '@/components/LoadingPaw';
import ErrorRetry from '@/components/ErrorRetry';

interface UsageGuidePanelProps {
  pet: PetProfile;
  breedInfo: BreedInfo;
  itemName: string;
  open: boolean;
}

const UsageGuidePanel: React.FC<UsageGuidePanelProps> = ({ pet, breedInfo, itemName, open }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  // 优先从 store 缓存读取（后台预生成的内容会存于此）
  const cachedGuide = usePetStore((s) => s.usageGuides[itemName]);
  const setUsageGuide = usePetStore((s) => s.setUsageGuide);

  // 本地存储的 fallback 数据（缓存中没有时，但本地 storage 可能有）
  const [localData, setLocalData] = useState<UsageGuideData | null>(null);

  const loadGuide = async () => {
    setLoading(true);
    setError(false);
    try {
      const result = await fetchUsageGuide(pet, breedInfo, itemName);
      setLocalData(result);
      // 同步到 store 缓存
      setUsageGuide(itemName, result);
    } catch (e) {
      console.error('[UsageGuide] 加载失败:', e);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  // 打开时检查是否需要加载
  useEffect(() => {
    if (!open) return;
    // 如果 store 缓存已有，无需加载
    if (cachedGuide) return;
    // 如果本地已有数据，无需加载
    if (localData) return;
    // 如果正在加载或出错，不重复加载
    if (loading || error) return;
    // 触发 AI 加载
    loadGuide();
  }, [open, cachedGuide, localData, loading, error]);

  if (!open) return null;

  // 优先使用 store 缓存，其次本地数据
  const displayData = cachedGuide || localData;

  return (
    <View className={styles.panel}>
      {loading && !displayData && <LoadingPaw text="AI正在生成使用指南..." />}
      {error && !displayData && <ErrorRetry message="指南加载失败" onRetry={loadGuide} />}
      {displayData && (
        <View className={styles.content}>
          <View className={styles.section}>
            <Text className={styles.sectionTitle}>📝 使用方法</Text>
            <Text className={styles.sectionText}>{displayData.usage_method}</Text>
          </View>
          <View className={styles.section}>
            <Text className={styles.sectionTitle}>💉 用量说明</Text>
            <Text className={styles.sectionText}>{displayData.dosage}</Text>
          </View>
          <View className={styles.section}>
            <Text className={styles.sectionTitle}>⚠️ 注意事项</Text>
            {displayData.precautions.map((p, i) => (
              <Text key={i} className={styles.listItem}>• {p}</Text>
            ))}
          </View>
          <View className={styles.section}>
            <Text className={styles.sectionTitle}>🚫 常见错误</Text>
            {displayData.common_mistakes.map((m, i) => (
              <Text key={i} className={styles.listItem}>• {m}</Text>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

export default UsageGuidePanel;

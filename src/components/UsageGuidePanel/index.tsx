import React, { useState } from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';
import type { UsageGuideData } from '@/types/ai';
import type { PetProfile, BreedInfo } from '@/types/pet';
import { fetchUsageGuide } from '@/services/ai';
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
  const [data, setData] = useState<UsageGuideData | null>(null);

  const loadGuide = async () => {
    setLoading(true);
    setError(false);
    try {
      const result = await fetchUsageGuide(pet, breedInfo, itemName);
      setData(result);
    } catch (e) {
      console.error('[UsageGuide] 加载失败:', e);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  // 首次打开时加载数据
  if (!data && !loading && !error) {
    loadGuide();
  }

  return (
    <View className={styles.panel}>
      {loading && <LoadingPaw text="AI正在生成使用指南..." />}
      {error && <ErrorRetry message="指南加载失败" onRetry={loadGuide} />}
      {data && !loading && !error && (
        <View className={styles.content}>
          <View className={styles.section}>
            <Text className={styles.sectionTitle}>📝 使用方法</Text>
            <Text className={styles.sectionText}>{data.usage_method}</Text>
          </View>
          <View className={styles.section}>
            <Text className={styles.sectionTitle}>💉 用量说明</Text>
            <Text className={styles.sectionText}>{data.dosage}</Text>
          </View>
          <View className={styles.section}>
            <Text className={styles.sectionTitle}>⚠️ 注意事项</Text>
            {data.precautions.map((p, i) => (
              <Text key={i} className={styles.listItem}>• {p}</Text>
            ))}
          </View>
          <View className={styles.section}>
            <Text className={styles.sectionTitle}>🚫 常见错误</Text>
            {data.common_mistakes.map((m, i) => (
              <Text key={i} className={styles.listItem}>• {m}</Text>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

export default UsageGuidePanel;

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { usePetStore } from '@/store/petStore';
import { getBreedInfo } from '@/data/breedDatabase';
import { fetchHealthData } from '@/services/ai';
import type { HealthData } from '@/types/ai';
import type { RiskLevel } from '@/types/ai';
import PetHeader from '@/components/PetHeader';
import LoadingPaw from '@/components/LoadingPaw';
import ErrorRetry from '@/components/ErrorRetry';
import Disclaimer from '@/components/Disclaimer';

const levelOrder: Record<RiskLevel, number> = { high: 0, medium: 1, low: 2 };
const levelText: Record<RiskLevel, string> = { high: '高风险', medium: '中风险', low: '低风险' };

const careConfig = [
  { key: 'diet', icon: '🍽️', title: '饮食' },
  { key: 'exercise', icon: '🏃', title: '运动' },
  { key: 'environment', icon: '🏠', title: '环境' },
  { key: 'mental_health', icon: '❤️', title: '心理' }
] as const;

const HealthPage: React.FC = () => {
  const pet = usePetStore((s) => s.pet);
  const healthData = usePetStore((s) => s.healthData);
  const healthGenerated = usePetStore((s) => s.healthGenerated);
  const setHealthData = usePetStore((s) => s.setHealthData);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const generate = async () => {
    if (!pet) {
      Taro.redirectTo({ url: '/pages/profile/index' });
      return;
    }
    const breedInfo = getBreedInfo(pet.species, pet.breed);
    if (!breedInfo) return;
    setLoading(true);
    setError(false);
    try {
      const data = await fetchHealthData(pet, breedInfo);
      setHealthData(data);
    } catch (e) {
      console.error('[Health] 生成失败:', e);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  // 首次进入若无数据则生成
  useEffect(() => {
    if (pet && !healthData && !loading && !error) {
      generate();
    }
    if (!pet) {
      Taro.redirectTo({ url: '/pages/profile/index' });
    }
  }, [pet]);

  // 每次显示时若更换了宠物重新生成
  useDidShow(() => {
    if (pet && !healthGenerated && !loading) {
      generate();
    }
  });

  if (!pet) return null;

  const sortedRisks = healthData
    ? [...healthData.risk_alerts].sort((a, b) => levelOrder[a.level] - levelOrder[b.level])
    : [];

  return (
    <View className={styles.container}>
      <PetHeader />
      <ScrollView scrollY className={styles.scroll} style={{ flex: 1 }}>
        <View className={styles.notice}>
          <Text className={styles.noticeText}>本Tab内容由AI生成，仅供参考</Text>
        </View>
        {loading && <LoadingPaw text="AI正在分析毛球的健康状况..." />}
        {error && !loading && <ErrorRetry message="生成失败，请重试" onRetry={generate} />}
        {healthData && !loading && !error && (
          <View className={styles.scrollContent}>
            {/* 风险提示 */}
            <View className={styles.section}>
              <Text className={styles.sectionTitle}>⚠️ 健康风险提示</Text>
              {sortedRisks.map((risk, i) => (
                <View
                  key={i}
                  className={classnames(styles.riskCard, styles[risk.level])}
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  <View className={styles.riskHeader}>
                    <Text className={styles.riskTitle}>{risk.title}</Text>
                    <Text className={classnames(styles.riskBadge, styles[risk.level])}>
                      {levelText[risk.level]}
                    </Text>
                  </View>
                  <Text className={styles.riskDesc}>{risk.description}</Text>
                  <Text className={styles.riskAction}>建议：{risk.action}</Text>
                </View>
              ))}
            </View>

            {/* 日常养护 */}
            <View className={styles.section}>
              <Text className={styles.sectionTitle}>🌿 日常养护建议</Text>
              <View className={styles.careGrid}>
                {careConfig.map((cfg, i) => (
                  <View
                    key={cfg.key}
                    className={styles.careCard}
                    style={{ animationDelay: `${(i + 3) * 0.08}s` }}
                  >
                    <View className={styles.careHeader}>
                      <Text className={styles.careIcon}>{cfg.icon}</Text>
                      <Text className={styles.careTitle}>{cfg.title}</Text>
                    </View>
                    {(healthData.daily_care as any)[cfg.key].map((item: string, idx: number) => (
                      <Text key={idx} className={styles.careItem}>• {item}</Text>
                    ))}
                  </View>
                ))}
              </View>
            </View>

            {/* 年龄注意 */}
            {healthData.age_notes && healthData.age_notes.length > 0 && (
              <View className={styles.ageBanner}>
                <Text className={styles.ageTitle}>📌 特别注意事项</Text>
                {healthData.age_notes.map((note, i) => (
                  <Text key={i} className={styles.ageNote}>• {note}</Text>
                ))}
              </View>
            )}

            <Disclaimer />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default HealthPage;

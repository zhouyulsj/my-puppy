import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { usePetStore } from '@/store/petStore';
import { getBreedInfo } from '@/data/breedDatabase';
import { fetchShoppingData } from '@/services/ai';
import { useUsageGuidesGenerator } from '@/hooks/useUsageGuidesGenerator';
import { storage, STORAGE_KEYS } from '@/utils/storage';
import type { ShoppingData } from '@/types/ai';
import type { Importance } from '@/types/ai';
import PetHeader from '@/components/PetHeader';
import LoadingPaw from '@/components/LoadingPaw';
import ErrorRetry from '@/components/ErrorRetry';
import UsageGuidePanel from '@/components/UsageGuidePanel';
import Disclaimer from '@/components/Disclaimer';

const importanceText: Record<Importance, string> = {
  essential: '必买',
  recommended: '推荐',
  optional: '可选'
};

const ShoppingPage: React.FC = () => {
  const pet = usePetStore((s) => s.pet);
  const shoppingData = usePetStore((s) => s.shoppingData);
  const shoppingGenerated = usePetStore((s) => s.shoppingGenerated);
  const setShoppingData = usePetStore((s) => s.setShoppingData);

  // 后台预生成所有使用指南（不阻塞 UI）
  useUsageGuidesGenerator();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [checked, setChecked] = useState<string[]>([]);
  const [openGuide, setOpenGuide] = useState<string | null>(null);

  // 加载勾选状态
  useEffect(() => {
    const saved = storage.get<string[]>(STORAGE_KEYS.SHOPPING_CHECKED) || [];
    setChecked(saved);
  }, []);

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
      const data = await fetchShoppingData(pet, breedInfo);
      setShoppingData(data);
    } catch (e) {
      console.error('[Shopping] 生成失败:', e);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (pet && !shoppingData && !loading && !error) {
      generate();
    }
    if (!pet) {
      Taro.redirectTo({ url: '/pages/profile/index' });
    }
  }, [pet, shoppingData]);

  useDidShow(() => {
    if (pet && !shoppingGenerated && !loading) {
      generate();
    }
  });

  if (!pet) return null;
  const breedInfo = getBreedInfo(pet.species, pet.breed);

  const toggleCheck = (itemName: string) => {
    setChecked((prev) => {
      const next = prev.includes(itemName)
        ? prev.filter((n) => n !== itemName)
        : [...prev, itemName];
      storage.set(STORAGE_KEYS.SHOPPING_CHECKED, next);
      return next;
    });
  };

  const toggleGuide = (itemName: string) => {
    setOpenGuide((prev) => (prev === itemName ? null : itemName));
  };

  return (
    <View className={styles.container}>
      <PetHeader />
      <ScrollView scrollY style={{ flex: 1 }}>
        <View className={styles.notice}>
          <Text className={styles.noticeText}>本Tab内容由AI生成，仅供参考</Text>
        </View>
        {loading && <LoadingPaw text="AI正在为毛球挑选必需品..." />}
        {error && !loading && <ErrorRetry message="生成失败，请重试" onRetry={generate} />}
        {shoppingData && !loading && !error && breedInfo && (
          <View className={styles.scrollContent}>
            {shoppingData.categories.map((cat, ci) => (
              <View
                key={ci}
                className={styles.category}
                style={{ animationDelay: `${ci * 0.1}s` }}
              >
                <View className={styles.categoryHeader}>
                  <Text className={styles.categoryIcon}>{cat.icon}</Text>
                  <Text className={styles.categoryName}>{cat.name}</Text>
                  <Text className={styles.categoryCount}>{cat.items.length}件</Text>
                </View>
                {cat.items.map((item, ii) => {
                  const isChecked = checked.includes(item.name);
                  const guideOpen = openGuide === item.name;
                  return (
                    <View key={ii} className={classnames(styles.item, isChecked && styles.checked)}>
                      <View className={styles.itemHeader}>
                        <View
                          className={classnames(styles.checkbox, isChecked && styles.checked)}
                          onClick={() => toggleCheck(item.name)}
                        >
                          {isChecked && <Text className={styles.checkIcon}>✓</Text>}
                        </View>
                        <Text className={classnames(styles.itemName, isChecked && styles.checked)}>
                          {item.name}
                        </Text>
                        <Text className={classnames(styles.importanceBadge, styles[item.importance])}>
                          {importanceText[item.importance]}
                        </Text>
                      </View>
                      <Text className={styles.itemGuide}>{item.selection_guide}</Text>
                      <View className={styles.ingredientBox}>
                        <Text className={styles.ingredientLabel}>📋 配料表解读</Text>
                        <Text className={styles.ingredientText}>{item.ingredient_tips}</Text>
                      </View>
                      <View className={styles.itemFooter}>
                        <Text className={styles.price}>{item.price_range}</Text>
                        <View className={styles.guideBtn} onClick={() => toggleGuide(item.name)}>
                          <Text className={styles.guideBtnText}>
                            {guideOpen ? '收起指南' : '📖 使用指南'}
                          </Text>
                        </View>
                      </View>
                      <UsageGuidePanel
                        pet={pet}
                        breedInfo={breedInfo}
                        itemName={item.name}
                        open={guideOpen}
                      />
                    </View>
                  );
                })}
              </View>
            ))}
            <Disclaimer />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default ShoppingPage;

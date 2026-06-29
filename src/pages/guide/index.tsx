import React, { useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { usePetStore } from '@/store/petStore';
import { getBreedInfo } from '@/data/breedDatabase';
import { commonItems } from '@/data/commonItems';
import { useUsageGuidesGenerator } from '@/hooks/useUsageGuidesGenerator';
import PetHeader from '@/components/PetHeader';
import UsageGuidePanel from '@/components/UsageGuidePanel';
import Disclaimer from '@/components/Disclaimer';

const GuidePage: React.FC = () => {
  const pet = usePetStore((s) => s.pet);
  const [openItem, setOpenItem] = useState<string | null>(null);

  // 后台预生成所有使用指南（不阻塞 UI）
  useUsageGuidesGenerator();

  if (!pet) {
    Taro.redirectTo({ url: '/pages/profile/index' });
    return null;
  }

  const breedInfo = getBreedInfo(pet.species, pet.breed);
  if (!breedInfo) return null;

  const items = commonItems[pet.species];

  const toggleItem = (name: string) => {
    setOpenItem((prev) => (prev === name ? null : name));
  };

  return (
    <View className={styles.container}>
      <PetHeader />
      <ScrollView scrollY style={{ flex: 1 }}>
        <View className={styles.notice}>
          <Text className={styles.noticeText}>本Tab内容由AI生成，仅供参考</Text>
        </View>
        <View className={styles.scrollContent}>
          <View className={styles.intro}>
            <Text className={styles.introText}>
              点击下方物品查看 AI 生成的详细使用指南，包括使用方法、用量、注意事项和常见错误。
            </Text>
          </View>
          {items.map((item, i) => {
            const open = openItem === item.name;
            return (
              <View
                key={item.name}
                className={styles.itemCard}
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                <View className={styles.itemHeader} onClick={() => toggleItem(item.name)}>
                  <Text className={styles.itemIcon}>{item.icon}</Text>
                  <Text className={styles.itemName}>{item.name}</Text>
                  <Text className={classnames(styles.arrow, open && styles.open)}>▾</Text>
                </View>
                {open && (
                  <View className={styles.guideWrap}>
                    <UsageGuidePanel
                      pet={pet}
                      breedInfo={breedInfo}
                      itemName={item.name}
                      open={true}
                    />
                  </View>
                )}
              </View>
            );
          })}
          <Disclaimer />
        </View>
      </ScrollView>
    </View>
  );
};

export default GuidePage;

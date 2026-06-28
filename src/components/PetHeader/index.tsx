import React, { useState } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { usePetStore } from '@/store/petStore';
import { getBreedInfo } from '@/data/breedDatabase';
import SettingsModal from '@/components/SettingsModal';

const PetHeader: React.FC = () => {
  const pet = usePetStore((s) => s.pet);
  const apiKey = usePetStore((s) => s.apiKey);
  const [settingsOpen, setSettingsOpen] = useState(false);

  if (!pet) return null;

  const breedInfo = getBreedInfo(pet.species, pet.breed);
  const ageLabel = pet.ageMonths < 12
    ? `${pet.ageMonths}月龄`
    : `${Math.floor(pet.ageMonths / 12)}岁${pet.ageMonths % 12 ? pet.ageMonths % 12 + '月' : ''}`;

  const handleChangePet = () => {
    Taro.navigateTo({ url: '/pages/profile/index?mode=change' });
  };

  return (
    <View className={styles.wrapper}>
      {!apiKey && (
        <View className={styles.apiBanner} onClick={() => setSettingsOpen(true)}>
          <Text className={styles.bannerText}>⚠️ 请先配置 AI API Key</Text>
          <Text className={styles.bannerBtn}>设置</Text>
        </View>
      )}
      <View className={styles.header}>
        <View className={styles.info}>
          <Text className={styles.name}>🐾 {pet.name}</Text>
          <View className={styles.tags}>
            <Text className={styles.tag}>{breedInfo?.display_name || '未知品种'}</Text>
            <Text className={styles.tag}>{ageLabel}</Text>
            <Text className={styles.tag}>{pet.weight}kg</Text>
            <Text className={styles.tag}>{pet.neutered ? '已绝育' : '未绝育'}</Text>
          </View>
        </View>
        <View className={styles.actions}>
          <View className={styles.settingBtn} onClick={() => setSettingsOpen(true)}>
            <Text className={styles.settingIcon}>⚙️</Text>
          </View>
          <View className={styles.changeBtn} onClick={handleChangePet}>
            <Text className={styles.changeText}>更换宠物</Text>
          </View>
        </View>
      </View>
      <SettingsModal visible={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </View>
  );
};

export default PetHeader;

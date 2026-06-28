import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

interface LoadingPawProps {
  text?: string;
}

const LoadingPaw: React.FC<LoadingPawProps> = ({ text = 'AI正在分析...' }) => {
  return (
    <View className={styles.container}>
      <View className={styles.pawWrap}>
        <Text className={styles.paw}>🐾</Text>
      </View>
      <Text className={styles.text}>{text}</Text>
    </View>
  );
};

export default LoadingPaw;

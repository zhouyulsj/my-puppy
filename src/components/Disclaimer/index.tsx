import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

const Disclaimer: React.FC = () => {
  return (
    <View className={styles.container}>
      <Text className={styles.text}>
        本方案由AI生成，仅供参考，不能替代兽医诊断。如宠物出现健康问题请及时就医。
      </Text>
    </View>
  );
};

export default Disclaimer;

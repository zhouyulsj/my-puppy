import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

interface ErrorRetryProps {
  message?: string;
  onRetry?: () => void;
}

const ErrorRetry: React.FC<ErrorRetryProps> = ({ message = '生成失败，请重试', onRetry }) => {
  return (
    <View className={styles.container}>
      <Text className={styles.icon}>😿</Text>
      <Text className={styles.message}>{message}</Text>
      {onRetry && (
        <View className={styles.button} onClick={onRetry}>
          <Text className={styles.buttonText}>重新生成</Text>
        </View>
      )}
    </View>
  );
};

export default ErrorRetry;

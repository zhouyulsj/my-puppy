import React, { useState, useEffect } from 'react';
import { View, Text, Input, Button } from '@tarojs/components';
import styles from './index.module.scss';
import { usePetStore } from '@/store/petStore';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ visible, onClose }) => {
  const apiKey = usePetStore((s) => s.apiKey);
  const setApiKey = usePetStore((s) => s.setApiKey);
  const [inputKey, setInputKey] = useState('');

  useEffect(() => {
    if (visible) setInputKey(apiKey);
  }, [visible, apiKey]);

  if (!visible) return null;

  const handleSave = () => {
    setApiKey(inputKey.trim());
    onClose();
  };

  return (
    <View className={styles.mask} onClick={onClose}>
      <View className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <Text className={styles.title}>配置 AI API Key</Text>
        <Text className={styles.desc}>
          请输入智谱GLM API Key，用于生成个性化健康方案。Key 仅保存在本地。
        </Text>
        <Input
          className={styles.input}
          type="text"
          password
          placeholder="请输入 API Key"
          value={inputKey}
          onInput={(e) => setInputKey(e.detail.value)}
        />
        <View className={styles.hint}>
          <Text className={styles.hintText}>
            获取方式：注册 open.bigmodel.cn 后在控制台获取
          </Text>
        </View>
        <View className={styles.btnGroup}>
          <Button className={styles.btnCancel} onClick={onClose}>取消</Button>
          <Button className={styles.btnConfirm} onClick={handleSave}>保存</Button>
        </View>
      </View>
    </View>
  );
};

export default SettingsModal;

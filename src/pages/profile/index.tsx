import React, { useState, useEffect } from 'react';
import { View, Text, Input, Picker, Button } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { usePetStore } from '@/store/petStore';
import { breedOptions, ageOptions } from '@/data/breedOptions';
import type { PetSpecies, PetProfile } from '@/types/pet';

interface FormState {
  name: string;
  species: PetSpecies;
  breed: string;
  ageMonths: number;
  weight: string;
  neutered: boolean;
}

const ProfilePage: React.FC = () => {
  const router = useRouter();
  const setPet = usePetStore((s) => s.setPet);
  const existingPet = usePetStore((s) => s.pet);

  const [form, setForm] = useState<FormState>({
    name: '',
    species: 'cat',
    breed: '',
    ageMonths: 0,
    weight: '',
    neutered: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 如果是更换宠物模式，预填已有数据
  useEffect(() => {
    if (router.params.mode === 'change' && existingPet) {
      setForm({
        name: existingPet.name,
        species: existingPet.species,
        breed: existingPet.breed,
        ageMonths: existingPet.ageMonths,
        weight: String(existingPet.weight),
        neutered: existingPet.neutered
      });
    }
  }, [router.params.mode, existingPet]);

  const currentBreeds = breedOptions[form.species];
  const currentBreedIdx = currentBreeds.findIndex((b) => b.key === form.breed);
  const ageIdx = ageOptions.findIndex((a) => a.value === form.ageMonths);

  const switchSpecies = (sp: PetSpecies) => {
    setForm((f) => ({ ...f, species: sp, breed: '' }));
    setErrors((e) => ({ ...e, breed: '' }));
  };

  const onBreedChange = (e) => {
    const idx = Number(e.detail.value);
    setForm((f) => ({ ...f, breed: currentBreeds[idx].key }));
    setErrors((er) => ({ ...er, breed: '' }));
  };

  const onAgeChange = (e) => {
    const idx = Number(e.detail.value);
    setForm((f) => ({ ...f, ageMonths: ageOptions[idx].value }));
    setErrors((er) => ({ ...er, ageMonths: '' }));
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = '请输入宠物名字';
    if (!form.breed) errs.breed = '请选择品种';
    if (!form.ageMonths) errs.ageMonths = '请选择年龄';
    const w = parseFloat(form.weight);
    if (!form.weight || isNaN(w) || w <= 0) errs.weight = '请输入有效体重';
    if (form.species === 'cat' && w > 20) errs.weight = '猫的体重似乎过大，请确认';
    if (form.species === 'dog' && w > 100) errs.weight = '狗的体重似乎过大，请确认';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) {
      Taro.showToast({ title: '请完善表单信息', icon: 'none' });
      return;
    }
    const pet: PetProfile = {
      name: form.name.trim(),
      species: form.species,
      breed: form.breed,
      ageMonths: form.ageMonths,
      weight: parseFloat(form.weight),
      neutered: form.neutered,
      createdAt: existingPet?.createdAt || Date.now()
    };
    setPet(pet);
    Taro.switchTab({ url: '/pages/health/index' });
  };

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <Text className={styles.title}>🐾 毛球健康管家</Text>
        <Text className={styles.subtitle}>AI驱动的个性化宠物全周期健康管理</Text>
      </View>

      <View className={styles.card}>
        {/* 宠物名字 */}
        <View className={styles.field}>
          <Text className={styles.label}>宠物名字<span className={styles.required}>*</span></Text>
          <Input
            className={classnames(styles.input, errors.name && styles.error)}
            type="text"
            placeholder="给毛球起个名字"
            value={form.name}
            onInput={(e) => setForm((f) => ({ ...f, name: e.detail.value }))}
            maxlength={20}
          />
          {errors.name && <Text className={styles.errorMsg}>{errors.name}</Text>}
        </View>

        {/* 宠物种类 */}
        <View className={styles.field}>
          <Text className={styles.label}>宠物种类<span className={styles.required}>*</span></Text>
          <View className={styles.radioGroup}>
            <View
              className={classnames(styles.radioItem, form.species === 'cat' && styles.active)}
              onClick={() => switchSpecies('cat')}
            >
              <Text className={classnames(styles.radioText, form.species === 'cat' && styles.active)}>🐱 猫</Text>
            </View>
            <View
              className={classnames(styles.radioItem, form.species === 'dog' && styles.active)}
              onClick={() => switchSpecies('dog')}
            >
              <Text className={classnames(styles.radioText, form.species === 'dog' && styles.active)}>🐶 狗</Text>
            </View>
          </View>
        </View>

        {/* 品种 */}
        <View className={styles.field}>
          <Text className={styles.label}>品种<span className={styles.required}>*</span></Text>
          <Picker
            mode="selector"
            range={currentBreeds}
            rangeKey="name"
            value={currentBreedIdx >= 0 ? currentBreedIdx : 0}
            onChange={onBreedChange}
          >
            <View className={classnames(styles.picker, errors.breed && styles.error)}>
              <Text className={classnames(styles.pickerText, !form.breed && styles.placeholder)}>
                {currentBreedIdx >= 0 ? currentBreeds[currentBreedIdx].name : '请选择品种'}
              </Text>
              <Text className={styles.pickerArrow}>▾</Text>
            </View>
          </Picker>
          {errors.breed && <Text className={styles.errorMsg}>{errors.breed}</Text>}
        </View>

        {/* 年龄 */}
        <View className={styles.field}>
          <Text className={styles.label}>年龄<span className={styles.required}>*</span></Text>
          <Picker
            mode="selector"
            range={ageOptions}
            rangeKey="label"
            value={ageIdx >= 0 ? ageIdx : 0}
            onChange={onAgeChange}
          >
            <View className={classnames(styles.picker, errors.ageMonths && styles.error)}>
              <Text className={classnames(styles.pickerText, !form.ageMonths && styles.placeholder)}>
                {ageIdx >= 0 ? ageOptions[ageIdx].label : '请选择年龄'}
              </Text>
              <Text className={styles.pickerArrow}>▾</Text>
            </View>
          </Picker>
          {errors.ageMonths && <Text className={styles.errorMsg}>{errors.ageMonths}</Text>}
        </View>

        {/* 体重 */}
        <View className={styles.field}>
          <Text className={styles.label}>体重<span className={styles.required}>*</span></Text>
          <View className={styles.weightWrap}>
            <Input
              className={classnames(styles.input, styles.weightInput, errors.weight && styles.error)}
              type="digit"
              placeholder="0.0"
              value={form.weight}
              onInput={(e) => setForm((f) => ({ ...f, weight: e.detail.value }))}
            />
            <Text className={styles.unit}>kg</Text>
          </View>
          {errors.weight && <Text className={styles.errorMsg}>{errors.weight}</Text>}
        </View>

        {/* 绝育状态 */}
        <View className={styles.field}>
          <Text className={styles.label}>是否绝育<span className={styles.required}>*</span></Text>
          <View className={styles.radioGroup}>
            <View
              className={classnames(styles.radioItem, form.neutered && styles.active)}
              onClick={() => setForm((f) => ({ ...f, neutered: true }))}
            >
              <Text className={classnames(styles.radioText, form.neutered && styles.active)}>已绝育</Text>
            </View>
            <View
              className={classnames(styles.radioItem, !form.neutered && styles.active)}
              onClick={() => setForm((f) => ({ ...f, neutered: false }))}
            >
              <Text className={classnames(styles.radioText, !form.neutered && styles.active)}>未绝育</Text>
            </View>
          </View>
        </View>

        <Button className={styles.submitBtn} onClick={handleSubmit}>
          <Text className={styles.submitText}>生成健康管家方案</Text>
        </Button>
        <Text className={styles.tip}>由TRAE辅助生成</Text>
      </View>
    </View>
  );
};

export default ProfilePage;

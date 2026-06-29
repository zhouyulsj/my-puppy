import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { usePetStore } from '@/store/petStore';
import { getBreedInfo } from '@/data/breedDatabase';
import { fetchCalendarData } from '@/services/ai';
import { storage, STORAGE_KEYS } from '@/utils/storage';
import type { CalendarData, CalendarCategory, CalendarImportance } from '@/types/ai';
import PetHeader from '@/components/PetHeader';
import LoadingPaw from '@/components/LoadingPaw';
import ErrorRetry from '@/components/ErrorRetry';
import Disclaimer from '@/components/Disclaimer';

const categoryText: Record<CalendarCategory, string> = {
  vaccine: '疫苗',
  deworming: '驱虫',
  grooming: '洗护',
  checkup: '体检',
  neutering: '绝育',
  special: '特别'
};

const importanceMark: Record<CalendarImportance, string> = {
  high: '❗',
  medium: '⚠️',
  low: '✓'
};

const legendList: { key: CalendarCategory; label: string }[] = [
  { key: 'vaccine', label: '疫苗' },
  { key: 'deworming', label: '驱虫' },
  { key: 'grooming', label: '洗护' },
  { key: 'checkup', label: '体检' },
  { key: 'neutering', label: '绝育' },
  { key: 'special', label: '特别' }
];

const CalendarPage: React.FC = () => {
  const pet = usePetStore((s) => s.pet);
  const calendarData = usePetStore((s) => s.calendarData);
  const calendarGenerated = usePetStore((s) => s.calendarGenerated);
  const setCalendarData = usePetStore((s) => s.setCalendarData);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [doneIds, setDoneIds] = useState<string[]>([]);

  useEffect(() => {
    const saved = storage.get<string[]>(STORAGE_KEYS.CALENDAR_DONE) || [];
    setDoneIds(saved);
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
      const data = await fetchCalendarData(pet, breedInfo);
      setCalendarData(data);
    } catch (e) {
      console.error('[Calendar] 生成失败:', e);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (pet && !calendarData && !loading && !error) {
      generate();
    }
    if (!pet) {
      Taro.redirectTo({ url: '/pages/profile/index' });
    }
  }, [pet, calendarData]);

  useDidShow(() => {
    if (pet && !calendarGenerated && !loading) {
      generate();
    }
  });

  if (!pet) return null;

  // 按月份分组
  const monthGroups = useMemo(() => {
    if (!calendarData) return [];
    const groups: Record<number, typeof calendarData.events> = {};
    calendarData.events.forEach((ev) => {
      if (!groups[ev.month_offset]) groups[ev.month_offset] = [];
      groups[ev.month_offset].push(ev);
    });
    return Object.keys(groups).map((k) => Number(k)).sort((a, b) => a - b).map((offset) => ({
      offset,
      events: groups[offset]
    }));
  }, [calendarData]);

  // 统计
  const stats = useMemo(() => {
    if (!calendarData) return { total: 0, done: 0, highUndone: 0 };
    const total = calendarData.events.length;
    const done = calendarData.events.filter((e) =>
      doneIds.includes(`${e.month_offset}-${e.action}`)
    ).length;
    const highUndone = calendarData.events.filter((e) =>
      e.importance === 'high' && !doneIds.includes(`${e.month_offset}-${e.action}`)
    ).length;
    return { total, done, highUndone };
  }, [calendarData, doneIds]);

  const progress = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

  // 当前月份名
  const getMonthLabel = (offset: number) => {
    const now = new Date();
    const target = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    const y = target.getFullYear();
    const m = target.getMonth() + 1;
    const petAgeLabel = pet.ageMonths + offset < 12
      ? `${pet.ageMonths + offset}月龄`
      : `${Math.floor((pet.ageMonths + offset) / 12)}岁${(pet.ageMonths + offset) % 12 ? (pet.ageMonths + offset) % 12 + '月' : ''}`;
    return `${petAgeLabel}（${y}年${m}月）`;
  };

  const toggleDone = (id: string) => {
    setDoneIds((prev) => {
      const next = prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id];
      storage.set(STORAGE_KEYS.CALENDAR_DONE, next);
      return next;
    });
  };

  return (
    <View className={styles.container}>
      <PetHeader />
      <ScrollView scrollY style={{ flex: 1 }}>
        <View className={styles.notice}>
          <Text className={styles.noticeText}>本Tab内容由AI生成，仅供参考</Text>
        </View>
        {loading && <LoadingPaw text="AI正在规划毛球的全年健康计划..." />}
        {error && !loading && <ErrorRetry message="生成失败，请重试" onRetry={generate} />}
        {calendarData && !loading && !error && (
          <View className={styles.scrollContent}>
            {/* 统计栏 */}
            <View className={styles.stats}>
              <View className={styles.statsRow}>
                <View className={styles.statItem}>
                  <Text className={styles.statNum}>{stats.total}</Text>
                  <Text className={styles.statLabel}>总事项</Text>
                </View>
                <View className={styles.statItem}>
                  <Text className={classnames(styles.statNum, styles.statNumDone)}>{stats.done}</Text>
                  <Text className={styles.statLabel}>已完成</Text>
                </View>
                <View className={styles.statItem}>
                  <Text className={classnames(styles.statNum, styles.statNumHigh)}>{stats.highUndone}</Text>
                  <Text className={styles.statLabel}>高优先未完成</Text>
                </View>
              </View>
              <View className={styles.progressBar}>
                <View className={styles.progressFill} style={{ width: `${progress}%` }} />
              </View>
            </View>

            {/* 时间轴 */}
            <View className={styles.timeline}>
              <View className={styles.timelineLine} />
              {monthGroups.map((group, gi) => (
                <View
                  key={group.offset}
                  className={styles.monthGroup}
                  style={{ animationDelay: `${gi * 0.1}s` }}
                >
                  <View className={styles.monthHeader}>
                    <View className={styles.monthDot} />
                    <Text className={styles.monthTitle}>{getMonthLabel(group.offset)}</Text>
                  </View>
                  {group.events.map((ev, ei) => {
                    const id = `${ev.month_offset}-${ev.action}`;
                    const isDone = doneIds.includes(id);
                    return (
                      <View
                        key={ei}
                        className={classnames(styles.eventCard, styles[ev.category], isDone && styles.done)}
                        style={{ animationDelay: `${(gi + ei * 0.05) * 0.08}s` }}
                      >
                        <View className={styles.eventHeader}>
                          <View className={styles.eventTitleWrap}>
                            <Text className={classnames(styles.eventTitle, isDone && styles.done)}>
                              {ev.action}
                            </Text>
                            <Text className={styles.importanceMark}>{importanceMark[ev.importance]}</Text>
                          </View>
                          <View
                            className={classnames(styles.eventCheck, isDone && styles.done)}
                            onClick={() => toggleDone(id)}
                          >
                            {isDone && <Text className={styles.checkIcon}>✓</Text>}
                          </View>
                        </View>
                        {ev.detail && <Text className={styles.eventDetail}>{ev.detail}</Text>}
                      </View>
                    );
                  })}
                </View>
              ))}
            </View>

            {/* 图例 */}
            <View className={styles.legend}>
              {legendList.map((l) => (
                <View key={l.key} className={styles.legendItem}>
                  <View className={classnames(styles.legendColor, styles[l.key])} />
                  <Text className={styles.legendText}>{l.label}</Text>
                </View>
              ))}
            </View>

            <Disclaimer />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default CalendarPage;

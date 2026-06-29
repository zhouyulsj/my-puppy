import { useEffect, useRef } from 'react';
import { usePetStore } from '@/store/petStore';
import { getBreedInfo } from '@/data/breedDatabase';
import { getItemNames } from '@/data/commonItems';
import { fetchUsageGuidesBatch } from '@/services/ai';

// 后台预生成使用指南的 Hook
// 在采购清单/使用指南页面挂载时，若指南未生成，则后台批量生成
// 不阻塞 UI，生成完成后自动写入 store
export function useUsageGuidesGenerator() {
  const pet = usePetStore((s) => s.pet);
  const usageGuidesGenerated = usePetStore((s) => s.usageGuidesGenerated);
  const setUsageGuides = usePetStore((s) => s.setUsageGuides);
  const generatingRef = useRef(false);

  useEffect(() => {
    if (!pet) return;
    if (usageGuidesGenerated) return;
    if (generatingRef.current) return;

    const breedInfo = getBreedInfo(pet.species, pet.breed);
    if (!breedInfo) return;

    generatingRef.current = true;
    const itemNames = getItemNames(pet.species);

    // 后台批量生成（不 await，不阻塞页面）
    fetchUsageGuidesBatch(pet, breedInfo, itemNames)
      .then((guides) => {
        setUsageGuides(guides);
        console.log('[UsageGuides] 后台预生成完成:', Object.keys(guides).length, '条');
      })
      .catch((e) => {
        console.error('[UsageGuides] 后台预生成失败:', e);
      })
      .finally(() => {
        generatingRef.current = false;
      });
  }, [pet, usageGuidesGenerated, setUsageGuides]);
}

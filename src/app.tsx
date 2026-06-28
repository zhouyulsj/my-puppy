import React, { useEffect } from 'react';
import { useDidShow, useDidHide } from '@tarojs/taro';
import { usePetStore } from '@/store/petStore';
import './app.scss';

function App(props) {
  const hydrateFromStorage = usePetStore((s) => s.hydrateFromStorage);

  useEffect(() => {
    hydrateFromStorage();
  }, []);

  useDidShow(() => {});

  useDidHide(() => {});

  return props.children;
}

export default App;

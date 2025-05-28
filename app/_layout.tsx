import { Slot } from 'expo-router';

export default function RootLayout() {
  return <Slot />; // 根据子目录自动渲染 (tabs) 和 (modals)
}

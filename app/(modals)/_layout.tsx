// app/_modal.tsx
import { Stack } from 'expo-router';

export default function ModalLayout() {
  return (
    <Stack
      screenOptions={{
        presentation: 'modal', // 👈 关键！以模态形式打开
        headerShown: true, 
      }}
    />
  );
}

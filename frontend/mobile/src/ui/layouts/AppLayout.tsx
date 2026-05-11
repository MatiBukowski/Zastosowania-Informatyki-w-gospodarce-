import type { ReactNode } from 'react';
import { View } from 'react-native';

type AppLayoutProps = {
  children: ReactNode;
};

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <View style={{ flex: 1 }}>
      {children}
    </View>
  );
}
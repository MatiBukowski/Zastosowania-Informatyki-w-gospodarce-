import type { ReactNode } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme/theme';

type ScreenLayoutProps = {
  children: ReactNode;
};

export function ScreenLayout({ children }: ScreenLayoutProps) {
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        paddingHorizontal: 16,
      }}
      edges={['top', 'left', 'right']}
    >
      {children}
    </SafeAreaView>
  );
}
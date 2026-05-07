import { memo } from 'react';
import type { FC } from 'react';

interface SplashWrapperProps {
  progress: number;
  fadeIn: number;
  color: string;
  children: React.ReactNode;
}

const SplashWrapper: FC<SplashWrapperProps> = ({ children }) => {
  return <>{children}</>;
};

export default memo(SplashWrapper);

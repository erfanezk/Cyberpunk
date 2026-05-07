interface SplashWrapperProps {
  progress: number;
  fadeIn: number;
  color: string;
  children: React.ReactNode;
}

export function SplashWrapper({ children }: SplashWrapperProps) {
  return <>{children}</>;
}

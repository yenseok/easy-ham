import { ReactNode } from 'react';
import { Header } from './Header';

interface PageLayoutProps {
  children: ReactNode;
  showBackButton?: boolean;
  onBack?: () => void;
}

export const PageLayout = ({
  children,
  showBackButton,
  onBack,
}: PageLayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header showBackButton={showBackButton} onBack={onBack} />
      <main className="flex-1">{children}</main>
    </div>
  );
};

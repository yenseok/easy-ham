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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header showBackButton={showBackButton} onBack={onBack} />
      <main className="flex-1 min-h-0">{children}</main>
    </div>
  );
};

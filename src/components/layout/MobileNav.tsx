import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Home, MessageCircle, ShoppingBag, Bell, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const MobileNav = () => {
  const location = useLocation();
  const { t } = useLanguage();
  const { profile } = useAuth();

  const isExpert = profile?.role === 'expert';

  const navItems = [
    { path: '/dashboard', icon: Home, label: t('nav.home') },
    { path: '/chat', icon: MessageCircle, label: t('nav.chat') },
    { path: '/shop', icon: ShoppingBag, label: t('nav.shop') },
    { path: '/alerts', icon: Bell, label: t('nav.alerts') },
    { path: isExpert ? '/expert' : '/profile', icon: User, label: t('nav.profile') },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 safe-area-pb">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center p-2 min-w-[64px] min-h-[48px] transition-colors rounded-lg',
                isActive
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              <Icon className={cn('w-6 h-6', isActive && 'scale-110')} />
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNav;

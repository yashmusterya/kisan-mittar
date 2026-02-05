import { Badge } from '@/components/ui/badge';
import { Shield, Tractor, Store } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface RoleBadgeProps {
  role: 'admin' | 'farmer' | 'seller';
  size?: 'sm' | 'default';
}

export function RoleBadge({ role, size = 'default' }: RoleBadgeProps) {
  const { t } = useLanguage();

  const config = {
    admin: {
      icon: Shield,
      label: t('forum.role.admin'),
      variant: 'destructive' as const,
    },
    farmer: {
      icon: Tractor,
      label: t('forum.role.farmer'),
      variant: 'secondary' as const,
    },
    seller: {
      icon: Store,
      label: t('forum.role.seller'),
      variant: 'outline' as const,
    },
  };

  const { icon: Icon, label, variant } = config[role];
  const isSmall = size === 'sm';

  return (
    <Badge 
      variant={variant} 
      className={cn(
        'gap-1',
        isSmall ? 'text-[10px] px-1.5 py-0 h-5' : 'text-xs'
      )}
    >
      <Icon className={cn(isSmall ? 'h-2.5 w-2.5' : 'h-3 w-3')} />
      {label}
    </Badge>
  );
}

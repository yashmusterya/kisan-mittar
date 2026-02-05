import { Badge } from '@/components/ui/badge';
import { Shield, Tractor, Store } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface RoleBadgeProps {
  role: 'admin' | 'farmer' | 'seller';
}

export function RoleBadge({ role }: RoleBadgeProps) {
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

  return (
    <Badge variant={variant} className="gap-1 text-xs">
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
}

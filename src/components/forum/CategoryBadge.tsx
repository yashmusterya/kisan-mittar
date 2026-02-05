import { Badge } from '@/components/ui/badge';
import { Leaf, Bug, TrendingUp, Cloud, MessageCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

type ForumCategory = 'crops' | 'pests' | 'market' | 'weather' | 'general';

interface CategoryBadgeProps {
  category: ForumCategory;
  onClick?: () => void;
  selected?: boolean;
  size?: 'sm' | 'default';
}

export function CategoryBadge({ category, onClick, selected, size = 'default' }: CategoryBadgeProps) {
  const { t } = useLanguage();

  const config: Record<ForumCategory, { icon: typeof Leaf; color: string }> = {
    crops: { icon: Leaf, color: 'bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20' },
    pests: { icon: Bug, color: 'bg-red-500/10 text-red-600 hover:bg-red-500/20 border-red-500/20' },
    market: { icon: TrendingUp, color: 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-blue-500/20' },
    weather: { icon: Cloud, color: 'bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20 border-yellow-500/20' },
    general: { icon: MessageCircle, color: 'bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 border-purple-500/20' },
  };

  const { icon: Icon, color } = config[category];
  const label = t(`forum.category.${category}`);

  const isSmall = size === 'sm';

  return (
    <Badge
      variant="outline"
      className={cn(
        'gap-1 cursor-pointer transition-colors border',
        color,
        selected && 'ring-2 ring-primary',
        isSmall && 'text-[10px] px-1.5 py-0 h-5'
      )}
      onClick={onClick}
    >
      <Icon className={cn('h-3 w-3', isSmall && 'h-2.5 w-2.5')} />
      {label}
    </Badge>
  );
}

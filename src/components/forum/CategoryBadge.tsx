import { Badge } from '@/components/ui/badge';
import { Leaf, Bug, TrendingUp, Cloud, MessageCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

type ForumCategory = 'crops' | 'pests' | 'market' | 'weather' | 'general';

interface CategoryBadgeProps {
  category: ForumCategory;
  onClick?: () => void;
  selected?: boolean;
}

export function CategoryBadge({ category, onClick, selected }: CategoryBadgeProps) {
  const { t } = useLanguage();

  const config: Record<ForumCategory, { icon: typeof Leaf; color: string }> = {
    crops: { icon: Leaf, color: 'bg-green-500/10 text-green-600 hover:bg-green-500/20' },
    pests: { icon: Bug, color: 'bg-red-500/10 text-red-600 hover:bg-red-500/20' },
    market: { icon: TrendingUp, color: 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20' },
    weather: { icon: Cloud, color: 'bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20' },
    general: { icon: MessageCircle, color: 'bg-purple-500/10 text-purple-600 hover:bg-purple-500/20' },
  };

  const { icon: Icon, color } = config[category];
  const label = t(`forum.category.${category}`);

  return (
    <Badge
      variant="outline"
      className={`gap-1 cursor-pointer transition-colors ${color} ${selected ? 'ring-2 ring-primary' : ''}`}
      onClick={onClick}
    >
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
}

import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useLanguage } from '@/contexts/LanguageContext';
import { Sprout, FlaskConical, Bug, Wrench, Droplets, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';

type Category = 'all' | 'seeds' | 'fertilizers' | 'pesticides' | 'tools' | 'irrigation';

interface CategoryFilterProps {
  selected: Category;
  onSelect: (category: Category) => void;
}

const categories: { id: Category; icon: React.ElementType }[] = [
  { id: 'all', icon: LayoutGrid },
  { id: 'seeds', icon: Sprout },
  { id: 'fertilizers', icon: FlaskConical },
  { id: 'pesticides', icon: Bug },
  { id: 'tools', icon: Wrench },
  { id: 'irrigation', icon: Droplets },
];

const CategoryFilter = ({ selected, onSelect }: CategoryFilterProps) => {
  const { t } = useLanguage();

  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex gap-2 pb-2">
        {categories.map(({ id, icon: Icon }) => (
          <Button
            key={id}
            variant={selected === id ? 'default' : 'outline'}
            size="sm"
            onClick={() => onSelect(id)}
            className={cn(
              'flex-shrink-0 gap-1.5',
              selected === id && 'shadow-md'
            )}
          >
            <Icon className="w-4 h-4" />
            <span>{t(`shop.category.${id}`)}</span>
          </Button>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};

export default CategoryFilter;

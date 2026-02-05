import { Award } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GovtBadgeProps {
  schemeName: string;
  schemeCode: string;
  className?: string;
}

const GovtBadge = ({ schemeName, schemeCode, className }: GovtBadgeProps) => {
  return (
    <div
      className={cn(
        'flex items-center gap-1.5 px-2 py-1 rounded-md',
        'bg-primary/10 text-primary',
        'text-xs font-medium',
        className
      )}
    >
      <Award className="w-3.5 h-3.5 flex-shrink-0" />
      <span className="truncate">{schemeCode}</span>
    </div>
  );
};

export default GovtBadge;

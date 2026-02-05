import { useState } from 'react';
import { ArrowBigUp, ArrowBigDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface VoteButtonsProps {
  postId?: string;
  commentId?: string;
  initialVotes: number;
  userVote?: number | null;
  compact?: boolean;
}

export function VoteButtons({ postId, commentId, initialVotes, userVote, compact }: VoteButtonsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [votes, setVotes] = useState(initialVotes);
  const [currentVote, setCurrentVote] = useState<number | null>(userVote ?? null);
  const [loading, setLoading] = useState(false);

  const handleVote = async (voteType: 1 | -1) => {
    if (!user) {
      toast({
        title: 'Login required',
        description: 'Please login to vote',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      if (currentVote === voteType) {
        // Remove vote
        const { error } = await supabase
          .from('forum_votes')
          .delete()
          .eq('user_id', user.id)
          .eq(postId ? 'post_id' : 'comment_id', postId || commentId);

        if (error) throw error;

        setVotes((prev) => prev - voteType);
        setCurrentVote(null);
      } else {
        if (currentVote !== null) {
          // Update existing vote
          const { error } = await supabase
            .from('forum_votes')
            .update({ vote_type: voteType })
            .eq('user_id', user.id)
            .eq(postId ? 'post_id' : 'comment_id', postId || commentId);

          if (error) throw error;

          setVotes((prev) => prev - currentVote + voteType);
        } else {
          // New vote
          const { error } = await supabase.from('forum_votes').insert({
            user_id: user.id,
            post_id: postId || null,
            comment_id: commentId || null,
            vote_type: voteType,
          });

          if (error) throw error;

          setVotes((prev) => prev + voteType);
        }
        setCurrentVote(voteType);
      }
    } catch (error) {
      console.error('Vote error:', error);
      toast({
        title: 'Error',
        description: 'Failed to vote',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const buttonSize = compact ? 'h-6 w-6' : 'h-8 w-8';
  const iconSize = compact ? 'h-4 w-4' : 'h-5 w-5';
  const textSize = compact ? 'text-xs' : 'text-sm';

  return (
    <div className="flex flex-col items-center gap-0">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleVote(1)}
        disabled={loading}
        className={cn(
          buttonSize,
          'p-0 rounded-sm',
          currentVote === 1 && 'text-primary bg-primary/10'
        )}
      >
        <ArrowBigUp className={iconSize} />
      </Button>
      <span className={cn(
        textSize,
        'font-bold',
        votes > 0 && 'text-primary',
        votes < 0 && 'text-destructive',
        votes === 0 && 'text-muted-foreground'
      )}>
        {votes}
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleVote(-1)}
        disabled={loading}
        className={cn(
          buttonSize,
          'p-0 rounded-sm',
          currentVote === -1 && 'text-destructive bg-destructive/10'
        )}
      >
        <ArrowBigDown className={iconSize} />
      </Button>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { MessageCircle, Share2, Bookmark, MoreHorizontal } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { VoteButtons } from './VoteButtons';
import { CategoryBadge } from './CategoryBadge';
import { RoleBadge } from './RoleBadge';
import { formatDistanceToNow } from 'date-fns';

interface PostCardProps {
  post: {
    id: string;
    title: string;
    content: string;
    category: 'crops' | 'pests' | 'market' | 'weather' | 'general';
    votes_count: number;
    comments_count: number;
    created_at: string;
    image_url?: string | null;
    user_id: string;
    author_name?: string;
    author_role?: 'admin' | 'farmer' | 'seller';
  };
  userVote?: number | null;
}

export function PostCard({ post, userVote }: PostCardProps) {
  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: false });

  return (
    <Card className="overflow-hidden hover:border-primary/30 transition-colors bg-card">
      <CardContent className="p-0">
        <div className="flex">
          {/* Vote Column - Reddit style */}
          <div className="bg-muted/30 px-2 py-3 flex flex-col items-center">
            <VoteButtons 
              postId={post.id} 
              initialVotes={post.votes_count} 
              userVote={userVote}
              compact
            />
          </div>
          
          {/* Content Column */}
          <div className="flex-1 p-3 min-w-0">
            {/* Meta info row */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap mb-1">
              <CategoryBadge category={post.category} size="sm" />
              <span>•</span>
              <span className="font-medium text-foreground">
                {post.author_name || 'Anonymous'}
              </span>
              {post.author_role && (
                <RoleBadge role={post.author_role} size="sm" />
              )}
              <span>•</span>
              <span>{timeAgo}</span>
            </div>
            
            {/* Title */}
            <Link to={`/forum/${post.id}`} className="block group">
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 text-base leading-snug">
                {post.title}
              </h3>
            </Link>
            
            {/* Preview text */}
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
              {post.content}
            </p>
            
            {/* Image thumbnail if exists */}
            {post.image_url && (
              <Link to={`/forum/${post.id}`}>
                <img
                  src={post.image_url}
                  alt="Post"
                  className="mt-2 rounded-md max-h-48 w-full object-cover hover:opacity-90 transition-opacity"
                />
              </Link>
            )}
            
            {/* Action buttons row - Reddit style */}
            <div className="flex items-center gap-1 mt-3 -ml-2">
              <Link to={`/forum/${post.id}`}>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground h-8 px-2 text-xs gap-1.5">
                  <MessageCircle className="h-4 w-4" />
                  {post.comments_count} Comments
                </Button>
              </Link>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground h-8 px-2 text-xs gap-1.5">
                <Share2 className="h-4 w-4" />
                Share
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground h-8 px-2 text-xs gap-1.5">
                <Bookmark className="h-4 w-4" />
                Save
              </Button>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

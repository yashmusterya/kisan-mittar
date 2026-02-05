import { Link } from 'react-router-dom';
import { MessageCircle, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex gap-3">
          <VoteButtons postId={post.id} initialVotes={post.votes_count} userVote={userVote} />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <CategoryBadge category={post.category} />
              {post.author_role && <RoleBadge role={post.author_role} />}
            </div>
            
            <Link to={`/forum/${post.id}`} className="block group">
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                {post.title}
              </h3>
            </Link>
            
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {post.content}
            </p>
            
            {post.image_url && (
              <img
                src={post.image_url}
                alt="Post"
                className="mt-2 rounded-lg max-h-40 object-cover"
              />
            )}
            
            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              </span>
              <Link to={`/forum/${post.id}`} className="flex items-center gap-1 hover:text-primary">
                <MessageCircle className="h-3 w-3" />
                {post.comments_count} comments
              </Link>
              {post.author_name && (
                <span className="text-muted-foreground">
                  by {post.author_name}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

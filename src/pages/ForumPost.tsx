import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { VoteButtons } from '@/components/forum/VoteButtons';
import { CategoryBadge } from '@/components/forum/CategoryBadge';
import { RoleBadge } from '@/components/forum/RoleBadge';
import { CommentSection } from '@/components/forum/CommentSection';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUserRole } from '@/hooks/useUserRole';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';

interface Post {
  id: string;
  title: string;
  content: string;
  category: 'crops' | 'pests' | 'market' | 'weather' | 'general';
  votes_count: number;
  comments_count: number;
  created_at: string;
  image_url: string | null;
  user_id: string;
  author_name?: string;
  author_role?: 'admin' | 'farmer' | 'seller';
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  author_name?: string;
  author_role?: 'admin' | 'farmer' | 'seller';
}

const ForumPost = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { isAdmin } = useUserRole();
  const { toast } = useToast();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [userVote, setUserVote] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchPost();
      fetchComments();
      if (user) fetchUserVote();
    }
  }, [id, user]);

  const fetchPost = async () => {
    const { data, error } = await supabase
      .from('forum_posts')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) {
      navigate('/forum');
      return;
    }

    // Fetch author info
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('user_id', data.user_id)
      .maybeSingle();

    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', data.user_id)
      .maybeSingle();

    setPost({
      ...data,
      author_name: profile?.full_name,
      author_role: roleData?.role as 'admin' | 'farmer' | 'seller' | undefined,
    });
    setLoading(false);
  };

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from('forum_comments')
      .select('*')
      .eq('post_id', id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching comments:', error);
      return;
    }

    // Fetch author info for each comment
    const commentsWithAuthors = await Promise.all(
      (data || []).map(async (comment) => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('user_id', comment.user_id)
          .maybeSingle();

        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', comment.user_id)
          .maybeSingle();

        return {
          ...comment,
          author_name: profile?.full_name,
          author_role: roleData?.role as 'admin' | 'farmer' | 'seller' | undefined,
        };
      })
    );

    setComments(commentsWithAuthors);
  };

  const fetchUserVote = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('forum_votes')
      .select('vote_type')
      .eq('user_id', user.id)
      .eq('post_id', id)
      .maybeSingle();

    setUserVote(data?.vote_type ?? null);
  };

  const handleDelete = async () => {
    if (!confirm(t('forum.confirmDelete'))) return;

    const { error } = await supabase.from('forum_posts').delete().eq('id', id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete post',
        variant: 'destructive',
      });
    } else {
      toast({ title: t('forum.postDeleted') });
      navigate('/forum');
    }
  };

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
        <Skeleton className="h-32" />
      </div>
    );
  }

  if (!post) return null;

  const canModify = user?.id === post.user_id || isAdmin;

  return (
    <div className="p-4 pb-24 space-y-4">
      <Button variant="ghost" onClick={() => navigate('/forum')} className="gap-1">
        <ArrowLeft className="h-4 w-4" />
        {t('forum.backToForum')}
      </Button>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-start gap-3">
            <VoteButtons postId={post.id} initialVotes={post.votes_count} userVote={userVote} />
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <CategoryBadge category={post.category} />
                {post.author_role && <RoleBadge role={post.author_role} />}
              </div>
              
              <h1 className="text-xl font-bold">{post.title}</h1>
              
              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                <span>by {post.author_name || 'Anonymous'}</span>
                <span>•</span>
                <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
              </div>
            </div>

            {canModify && (
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <p className="whitespace-pre-wrap">{post.content}</p>
          
          {post.image_url && (
            <img
              src={post.image_url}
              alt="Post"
              className="mt-4 rounded-lg max-h-96 object-contain"
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <CommentSection
            postId={post.id}
            comments={comments}
            onCommentAdded={fetchComments}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ForumPost;

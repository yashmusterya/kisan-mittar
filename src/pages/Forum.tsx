import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Flame, Clock, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PostCard } from '@/components/forum/PostCard';
import { CategoryBadge } from '@/components/forum/CategoryBadge';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

type SortType = 'hot' | 'new' | 'top';
type ForumCategory = 'crops' | 'pests' | 'market' | 'weather' | 'general' | null;

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

const Forum = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortType>('hot');
  const [selectedCategory, setSelectedCategory] = useState<ForumCategory>(null);
  const [userVotes, setUserVotes] = useState<Record<string, number>>({});

  const categories: ForumCategory[] = ['crops', 'pests', 'market', 'weather', 'general'];

  useEffect(() => {
    fetchPosts();
  }, [sortBy, selectedCategory]);

  useEffect(() => {
    if (user) {
      fetchUserVotes();
    }
  }, [user, posts]);

  const fetchPosts = async () => {
    setLoading(true);
    let query = supabase.from('forum_posts').select('*');

    if (selectedCategory) {
      query = query.eq('category', selectedCategory);
    }

    switch (sortBy) {
      case 'hot':
        query = query.order('votes_count', { ascending: false }).order('created_at', { ascending: false });
        break;
      case 'new':
        query = query.order('created_at', { ascending: false });
        break;
      case 'top':
        query = query.order('votes_count', { ascending: false });
        break;
    }

    const { data, error } = await query.limit(50);

    if (error) {
      console.error('Error fetching posts:', error);
    } else {
      // Fetch author info from profiles
      const postsWithAuthors = await Promise.all(
        (data || []).map(async (post) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, role')
            .eq('user_id', post.user_id)
            .maybeSingle();

          // Fetch user role from user_roles table
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', post.user_id)
            .maybeSingle();

          return {
            ...post,
            author_name: profile?.full_name,
            author_role: roleData?.role as 'admin' | 'farmer' | 'seller' | undefined,
          };
        })
      );
      setPosts(postsWithAuthors);
    }
    setLoading(false);
  };

  const fetchUserVotes = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('forum_votes')
      .select('post_id, vote_type')
      .eq('user_id', user.id)
      .not('post_id', 'is', null);

    if (data) {
      const votes: Record<string, number> = {};
      data.forEach((vote) => {
        if (vote.post_id) {
          votes[vote.post_id] = vote.vote_type;
        }
      });
      setUserVotes(votes);
    }
  };

  return (
    <div className="p-4 pb-24 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('forum.title')}</h1>
        {user && (
          <Button asChild size="sm">
            <Link to="/forum/create">
              <Plus className="h-4 w-4 mr-1" />
              {t('forum.createPost')}
            </Link>
          </Button>
        )}
      </div>

      {/* Sort Tabs */}
      <Tabs value={sortBy} onValueChange={(v) => setSortBy(v as SortType)}>
        <TabsList>
          <TabsTrigger value="hot" className="gap-1">
            <Flame className="h-4 w-4" />
            {t('forum.hot')}
          </TabsTrigger>
          <TabsTrigger value="new" className="gap-1">
            <Clock className="h-4 w-4" />
            {t('forum.new')}
          </TabsTrigger>
          <TabsTrigger value="top" className="gap-1">
            <TrendingUp className="h-4 w-4" />
            {t('forum.top')}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Category Filters */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={selectedCategory === null ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategory(null)}
        >
          {t('forum.allCategories')}
        </Button>
        {categories.map((cat) => (
          <CategoryBadge
            key={cat}
            category={cat}
            selected={selectedCategory === cat}
            onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
          />
        ))}
      </div>

      {/* Posts List */}
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))
        ) : posts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>{t('forum.noPosts')}</p>
            {user && (
              <Button asChild className="mt-4">
                <Link to="/forum/create">{t('forum.createFirst')}</Link>
              </Button>
            )}
          </div>
        ) : (
          posts.map((post) => (
            <PostCard key={post.id} post={post} userVote={userVotes[post.id]} />
          ))
        )}
      </div>
    </div>
  );
};

export default Forum;

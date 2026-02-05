import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CategoryBadge } from '@/components/forum/CategoryBadge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';

type ForumCategory = 'crops' | 'pests' | 'market' | 'weather' | 'general';

const CreatePost = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<ForumCategory>('general');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Login required',
        description: 'Please login to create a post',
        variant: 'destructive',
      });
      return;
    }

    if (!title.trim() || !content.trim()) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('forum_posts')
        .insert({
          user_id: user.id,
          title: title.trim(),
          content: content.trim(),
          category,
        })
        .select()
        .single();

      if (error) throw error;

      toast({ title: t('forum.postCreated') });
      navigate(`/forum/${data.id}`);
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: 'Error',
        description: 'Failed to create post',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const categories: ForumCategory[] = ['crops', 'pests', 'market', 'weather', 'general'];

  return (
    <div className="p-4 pb-24 space-y-4">
      <Button variant="ghost" onClick={() => navigate('/forum')} className="gap-1">
        <ArrowLeft className="h-4 w-4" />
        {t('forum.backToForum')}
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>{t('forum.createPost')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category">{t('forum.selectCategory')}</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as ForumCategory)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      <div className="flex items-center gap-2">
                        <CategoryBadge category={cat} />
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">{t('forum.postTitle')}</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('forum.titlePlaceholder')}
                maxLength={200}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">{t('forum.postContent')}</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={t('forum.contentPlaceholder')}
                rows={6}
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full gap-2">
              <Send className="h-4 w-4" />
              {loading ? t('forum.posting') : t('forum.submitPost')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreatePost;

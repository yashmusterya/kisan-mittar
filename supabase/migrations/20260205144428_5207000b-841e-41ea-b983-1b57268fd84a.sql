-- Create app_role enum for role system
CREATE TYPE public.app_role AS ENUM ('admin', 'farmer', 'seller');

-- Create forum_category enum
CREATE TYPE public.forum_category AS ENUM ('crops', 'pests', 'market', 'weather', 'general');

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'farmer',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles"
ON public.user_roles FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update roles"
ON public.user_roles FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
ON public.user_roles FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Create forum_posts table
CREATE TABLE public.forum_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category forum_category NOT NULL DEFAULT 'general',
    image_url TEXT,
    votes_count INTEGER NOT NULL DEFAULT 0,
    comments_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on forum_posts
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;

-- Create forum_comments table
CREATE TABLE public.forum_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES public.forum_posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    parent_id UUID REFERENCES public.forum_comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on forum_comments
ALTER TABLE public.forum_comments ENABLE ROW LEVEL SECURITY;

-- Create forum_votes table
CREATE TABLE public.forum_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    post_id UUID REFERENCES public.forum_posts(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES public.forum_comments(id) ON DELETE CASCADE,
    vote_type INTEGER NOT NULL CHECK (vote_type IN (-1, 1)),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, post_id),
    UNIQUE (user_id, comment_id),
    CHECK (
        (post_id IS NOT NULL AND comment_id IS NULL) OR
        (post_id IS NULL AND comment_id IS NOT NULL)
    )
);

-- Enable RLS on forum_votes
ALTER TABLE public.forum_votes ENABLE ROW LEVEL SECURITY;

-- RLS policies for forum_posts
CREATE POLICY "Anyone can view forum posts"
ON public.forum_posts FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create posts"
ON public.forum_posts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts"
ON public.forum_posts FOR UPDATE
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can delete their own posts"
ON public.forum_posts FOR DELETE
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- RLS policies for forum_comments
CREATE POLICY "Anyone can view comments"
ON public.forum_comments FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create comments"
ON public.forum_comments FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
ON public.forum_comments FOR UPDATE
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can delete their own comments"
ON public.forum_comments FOR DELETE
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- RLS policies for forum_votes
CREATE POLICY "Anyone can view votes"
ON public.forum_votes FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can vote"
ON public.forum_votes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can change their vote"
ON public.forum_votes FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can remove their vote"
ON public.forum_votes FOR DELETE
USING (auth.uid() = user_id);

-- Function to update votes_count on forum_posts
CREATE OR REPLACE FUNCTION public.update_post_votes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE forum_posts 
        SET votes_count = votes_count + NEW.vote_type 
        WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE forum_posts 
        SET votes_count = votes_count - OLD.vote_type 
        WHERE id = OLD.post_id;
    ELSIF TG_OP = 'UPDATE' THEN
        UPDATE forum_posts 
        SET votes_count = votes_count - OLD.vote_type + NEW.vote_type 
        WHERE id = NEW.post_id;
    END IF;
    RETURN NULL;
END;
$$;

-- Separate triggers for INSERT, UPDATE, DELETE on votes
CREATE TRIGGER update_post_votes_insert
AFTER INSERT ON public.forum_votes
FOR EACH ROW
WHEN (NEW.post_id IS NOT NULL)
EXECUTE FUNCTION public.update_post_votes_count();

CREATE TRIGGER update_post_votes_update
AFTER UPDATE ON public.forum_votes
FOR EACH ROW
WHEN (NEW.post_id IS NOT NULL)
EXECUTE FUNCTION public.update_post_votes_count();

CREATE TRIGGER update_post_votes_delete
AFTER DELETE ON public.forum_votes
FOR EACH ROW
WHEN (OLD.post_id IS NOT NULL)
EXECUTE FUNCTION public.update_post_votes_count();

-- Function to update comments_count on forum_posts
CREATE OR REPLACE FUNCTION public.update_post_comments_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE forum_posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE forum_posts SET comments_count = comments_count - 1 WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$;

CREATE TRIGGER update_post_comments
AFTER INSERT OR DELETE ON public.forum_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_post_comments_count();

-- Trigger to update updated_at on forum_posts
CREATE TRIGGER update_forum_posts_updated_at
BEFORE UPDATE ON public.forum_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for forum tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.forum_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.forum_comments;

-- Support requests table
CREATE TABLE public.support_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  reply TEXT,
  replied_by UUID,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.support_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create own requests" ON public.support_requests
  FOR INSERT TO public WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own requests" ON public.support_requests
  FOR SELECT TO public USING (
    auth.uid() = user_id OR
    has_role(auth.uid(), 'admin') OR
    has_role(auth.uid(), 'teacher') OR
    has_role(auth.uid(), 'moderator')
  );

CREATE POLICY "Admins teachers can update requests" ON public.support_requests
  FOR UPDATE TO authenticated USING (
    has_role(auth.uid(), 'admin') OR
    has_role(auth.uid(), 'teacher') OR
    has_role(auth.uid(), 'moderator')
  );

-- Notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL DEFAULT 'info',
  related_id UUID,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT TO public USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Authenticated can insert notifications" ON public.notifications
  FOR INSERT TO public WITH CHECK (true);

-- Add is_trending column to posts
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS is_trending BOOLEAN NOT NULL DEFAULT false;

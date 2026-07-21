
-- Add status column to posts
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending';

-- Create group join requests table
CREATE TABLE IF NOT EXISTS public.group_join_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  group_id uuid NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, group_id)
);

ALTER TABLE public.group_join_requests ENABLE ROW LEVEL SECURITY;

-- Everyone can view requests
CREATE POLICY "Requests viewable by everyone" ON public.group_join_requests FOR SELECT TO public USING (true);

-- Users can create their own requests
CREATE POLICY "Users can create requests" ON public.group_join_requests FOR INSERT TO public WITH CHECK (auth.uid() = user_id);

-- Group owner or admin can update requests
CREATE POLICY "Group owner can update requests" ON public.group_join_requests FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.groups WHERE groups.id = group_join_requests.group_id AND groups.teacher_id = auth.uid())
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Group owner or admin can delete requests
CREATE POLICY "Group owner can delete requests" ON public.group_join_requests FOR DELETE TO authenticated USING (
  auth.uid() = user_id
  OR EXISTS (SELECT 1 FROM public.groups WHERE groups.id = group_join_requests.group_id AND groups.teacher_id = auth.uid())
  OR has_role(auth.uid(), 'admin'::app_role)
);


-- Group blocks table for teachers to block users from their groups
CREATE TABLE public.group_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  blocked_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);

ALTER TABLE public.group_blocks ENABLE ROW LEVEL SECURITY;

-- Everyone can see blocks (needed for checking)
CREATE POLICY "Blocks viewable by everyone" ON public.group_blocks FOR SELECT TO public USING (true);

-- Group owner can block/unblock
CREATE POLICY "Group owner can insert blocks" ON public.group_blocks FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM public.groups WHERE id = group_id AND teacher_id = auth.uid())
  OR has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Group owner can delete blocks" ON public.group_blocks FOR DELETE TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.groups WHERE id = group_id AND teacher_id = auth.uid())
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Allow moderators to create groups too
DROP POLICY IF EXISTS "Teachers can create groups" ON public.groups;
CREATE POLICY "Teachers and moderators can create groups" ON public.groups FOR INSERT TO public
WITH CHECK (
  auth.uid() = teacher_id AND (
    has_role(auth.uid(), 'teacher'::app_role) OR 
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'moderator'::app_role)
  )
);

-- Allow moderators to update groups
DROP POLICY IF EXISTS "Teachers can update own groups" ON public.groups;
CREATE POLICY "Group owners can update groups" ON public.groups FOR UPDATE TO public
USING (
  auth.uid() = teacher_id OR has_role(auth.uid(), 'admin'::app_role)
);

-- Allow group deletion by owner or admin
CREATE POLICY "Group owners can delete groups" ON public.groups FOR DELETE TO authenticated
USING (
  auth.uid() = teacher_id OR has_role(auth.uid(), 'admin'::app_role)
);

-- Allow teachers/moderators to update profiles (for group management)
CREATE POLICY "Teachers can update group members" ON public.profiles FOR UPDATE TO authenticated
USING (
  has_role(auth.uid(), 'teacher'::app_role) OR has_role(auth.uid(), 'moderator'::app_role)
);

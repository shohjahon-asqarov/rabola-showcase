
-- 1. notifications: restrict insert to self
DROP POLICY IF EXISTS "Authenticated can insert notifications" ON public.notifications;
CREATE POLICY "Users can insert own notifications"
  ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 2. user_roles: no public read; users see own role; admins/mods see all
DROP POLICY IF EXISTS "Roles viewable by everyone" ON public.user_roles;
CREATE POLICY "Users can view own role"
  ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));
REVOKE SELECT ON public.user_roles FROM anon;

-- 3. profiles: restrict SELECT to authenticated
DROP POLICY IF EXISTS "Profiles viewable by everyone" ON public.profiles;
CREATE POLICY "Authenticated users can view profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (true);
REVOKE SELECT ON public.profiles FROM anon;

-- 4. profiles: teachers/moderators can only update profiles of members in their own group
DROP POLICY IF EXISTS "Teachers can update group members" ON public.profiles;
CREATE POLICY "Teachers can update own group members"
  ON public.profiles FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'moderator')
    OR (
      public.has_role(auth.uid(), 'teacher')
      AND group_id IS NOT NULL
      AND EXISTS (SELECT 1 FROM public.groups g WHERE g.id = profiles.group_id AND g.teacher_id = auth.uid())
    )
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'moderator')
    OR (
      public.has_role(auth.uid(), 'teacher')
      AND group_id IS NOT NULL
      AND EXISTS (SELECT 1 FROM public.groups g WHERE g.id = profiles.group_id AND g.teacher_id = auth.uid())
    )
  );

-- 5. group_blocks: restrict read to admin/owning teacher/affected user
DROP POLICY IF EXISTS "Blocks viewable by everyone" ON public.group_blocks;
CREATE POLICY "Blocks viewable by involved parties"
  ON public.group_blocks FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id
    OR public.has_role(auth.uid(), 'admin')
    OR EXISTS (SELECT 1 FROM public.groups g WHERE g.id = group_blocks.group_id AND g.teacher_id = auth.uid())
  );
REVOKE SELECT ON public.group_blocks FROM anon;

-- 6. group_join_requests: same as above + requester can see own
DROP POLICY IF EXISTS "Requests viewable by everyone" ON public.group_join_requests;
CREATE POLICY "Requests viewable by involved parties"
  ON public.group_join_requests FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'teacher')
    OR EXISTS (SELECT 1 FROM public.groups g WHERE g.id = group_join_requests.group_id AND g.teacher_id = auth.uid())
  );
REVOKE SELECT ON public.group_join_requests FROM anon;

-- 7. storage post-images: restrict INSERT to own folder; remove public SELECT listing
DROP POLICY IF EXISTS "Authenticated users can upload post images" ON storage.objects;
CREATE POLICY "Users can upload post images to own folder"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'post-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Anyone can view post images" ON storage.objects;
-- Bucket is public, so image URLs still resolve via the public CDN endpoint; removing this
-- policy just disables directory listing through the Data API.

-- 8. Lock down SECURITY DEFINER functions from anon
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.get_user_role(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_user_role(uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_post_likes_count() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_post_comments_count() FROM PUBLIC, anon, authenticated;

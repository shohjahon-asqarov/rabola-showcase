CREATE POLICY "Admins can update any posts"
ON public.posts
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Teachers can update any posts"
ON public.posts
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'teacher'::app_role));
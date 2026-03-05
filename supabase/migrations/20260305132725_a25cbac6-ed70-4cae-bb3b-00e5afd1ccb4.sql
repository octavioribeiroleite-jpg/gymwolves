CREATE POLICY "Users can update own posts"
ON public.challenge_posts
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
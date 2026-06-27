
CREATE POLICY "Users insert own interview history" ON public.interview_history
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own interview history" ON public.interview_history
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users update own interview history" ON public.interview_history
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users insert own jd history" ON public.jd_history
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own jd history" ON public.jd_history
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users update own jd history" ON public.jd_history
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users insert own talent history" ON public.talent_history
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own talent history" ON public.talent_history
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users update own talent history" ON public.talent_history
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users delete own profile" ON public.profiles
  FOR DELETE TO authenticated USING (auth.uid() = id);

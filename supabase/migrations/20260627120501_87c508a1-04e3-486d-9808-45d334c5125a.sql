
ALTER TABLE public.jd_history REPLICA IDENTITY FULL;
ALTER TABLE public.talent_history REPLICA IDENTITY FULL;
ALTER TABLE public.interview_history REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.jd_history;
ALTER PUBLICATION supabase_realtime ADD TABLE public.talent_history;
ALTER PUBLICATION supabase_realtime ADD TABLE public.interview_history;

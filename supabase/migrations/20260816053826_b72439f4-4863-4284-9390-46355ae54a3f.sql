-- 1. Corrections trail
ALTER TABLE public.stories
  ADD COLUMN IF NOT EXISTS corrected_at timestamptz,
  ADD COLUMN IF NOT EXISTS correction_note text;

-- 2. Media library
CREATE TABLE public.media_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_path text NOT NULL UNIQUE,
  url text NOT NULL,
  file_name text NOT NULL,
  mime_type text NOT NULL,
  size_bytes integer NOT NULL DEFAULT 0,
  alt_text text,
  caption text,
  credit text,
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.media_assets TO authenticated;
GRANT ALL ON public.media_assets TO service_role;

ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "media staff read" ON public.media_assets
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "media staff insert" ON public.media_assets
  FOR INSERT TO authenticated WITH CHECK (uploaded_by = auth.uid());
CREATE POLICY "media owner or editorial update" ON public.media_assets
  FOR UPDATE TO authenticated
  USING (uploaded_by = auth.uid() OR public.is_editorial(auth.uid()))
  WITH CHECK (uploaded_by = auth.uid() OR public.is_editorial(auth.uid()));
CREATE POLICY "media owner or editorial delete" ON public.media_assets
  FOR DELETE TO authenticated
  USING (uploaded_by = auth.uid() OR public.is_editorial(auth.uid()));

CREATE TRIGGER media_assets_updated_at BEFORE UPDATE ON public.media_assets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX media_assets_created_at_idx ON public.media_assets (created_at DESC);

-- 3. Storage policies for the story-images bucket
CREATE POLICY "story images staff read" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'story-images');
CREATE POLICY "story images staff insert" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'story-images' AND owner = auth.uid());
CREATE POLICY "story images staff update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'story-images' AND (owner = auth.uid() OR public.is_editorial(auth.uid())))
  WITH CHECK (bucket_id = 'story-images');
CREATE POLICY "story images staff delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'story-images' AND (owner = auth.uid() OR public.is_editorial(auth.uid())));

-- 4. Scheduled publishing
CREATE OR REPLACE FUNCTION public.publish_due_stories()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  n integer;
BEGIN
  WITH due AS (
    UPDATE public.stories
       SET status = 'published'
     WHERE status = 'scheduled'
       AND scheduled_for IS NOT NULL
       AND scheduled_for <= now()
    RETURNING id
  )
  SELECT count(*) INTO n FROM due;
  RETURN n;
END;
$$;

REVOKE ALL ON FUNCTION public.publish_due_stories() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.publish_due_stories() TO service_role;

CREATE EXTENSION IF NOT EXISTS pg_cron;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'vibefreq-publish-due-stories') THEN
    PERFORM cron.unschedule('vibefreq-publish-due-stories');
  END IF;
  PERFORM cron.schedule('vibefreq-publish-due-stories', '* * * * *', 'SELECT public.publish_due_stories();');
END $$;

-- 5. Admin-only staff management
CREATE OR REPLACE FUNCTION public.admin_list_staff()
RETURNS TABLE (
  user_id uuid,
  email text,
  joined_at timestamptz,
  roles text[],
  author_id uuid,
  author_name text,
  author_slug text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can list staff accounts';
  END IF;

  RETURN QUERY
  SELECT u.id,
         u.email::text,
         u.created_at,
         COALESCE(ARRAY(SELECT ur.role::text FROM public.user_roles ur WHERE ur.user_id = u.id ORDER BY ur.role::text), '{}'::text[]),
         a.id,
         a.name,
         a.slug
    FROM auth.users u
    LEFT JOIN public.authors a ON a.user_id = u.id
   ORDER BY u.created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_set_user_role(_user_id uuid, _role app_role)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can change roles';
  END IF;
  DELETE FROM public.user_roles WHERE user_id = _user_id;
  INSERT INTO public.user_roles (user_id, role) VALUES (_user_id, _role)
  ON CONFLICT DO NOTHING;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_remove_user_role(_user_id uuid, _role app_role)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can change roles';
  END IF;
  IF _role = 'admin' AND _user_id = auth.uid() THEN
    RAISE EXCEPTION 'You cannot remove your own admin role';
  END IF;
  DELETE FROM public.user_roles WHERE user_id = _user_id AND role = _role;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_list_staff() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_set_user_role(uuid, app_role) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_remove_user_role(uuid, app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_list_staff() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_user_role(uuid, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_remove_user_role(uuid, app_role) TO authenticated;
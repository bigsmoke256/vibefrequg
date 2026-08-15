REVOKE SELECT ON public.authors FROM anon;
GRANT SELECT (id, name, slug, avatar, bio, social_links, created_at, updated_at) ON public.authors TO anon;
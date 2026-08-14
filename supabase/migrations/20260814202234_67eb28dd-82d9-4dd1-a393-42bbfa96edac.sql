-- ENUMS
CREATE TYPE public.app_role AS ENUM ('admin', 'editor', 'reporter');
CREATE TYPE public.story_status AS ENUM ('draft', 'in_review', 'scheduled', 'published', 'archived');

-- UPDATED_AT HELPER
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- USER ROLES
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_editorial(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('admin', 'editor')
  );
$$;

CREATE POLICY "users read own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_editorial(auth.uid()));
CREATE POLICY "admins manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- CATEGORIES
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  description text,
  cover_image text,
  accent_color text NOT NULL DEFAULT '#F5C518',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories public read" ON public.categories FOR SELECT USING (true);
CREATE POLICY "categories editorial write" ON public.categories FOR ALL TO authenticated
  USING (public.is_editorial(auth.uid())) WITH CHECK (public.is_editorial(auth.uid()));

-- AUTHORS
CREATE TABLE public.authors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  avatar text,
  bio text,
  social_links jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX authors_user_id_key ON public.authors(user_id) WHERE user_id IS NOT NULL;
GRANT SELECT ON public.authors TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.authors TO authenticated;
GRANT ALL ON public.authors TO service_role;
ALTER TABLE public.authors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authors public read" ON public.authors FOR SELECT USING (true);
CREATE POLICY "authors editorial write" ON public.authors FOR ALL TO authenticated
  USING (public.is_editorial(auth.uid())) WITH CHECK (public.is_editorial(auth.uid()));
CREATE POLICY "authors update own" ON public.authors FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE TRIGGER authors_updated_at BEFORE UPDATE ON public.authors
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- TAGS
CREATE TABLE public.tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.tags TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tags TO authenticated;
GRANT ALL ON public.tags TO service_role;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tags public read" ON public.tags FOR SELECT USING (true);
CREATE POLICY "tags authenticated write" ON public.tags FOR ALL TO authenticated
  USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- STORIES
CREATE TABLE public.stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  excerpt text,
  body jsonb NOT NULL DEFAULT '[]'::jsonb,
  cover_image text,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  author_id uuid REFERENCES public.authors(id) ON DELETE SET NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status public.story_status NOT NULL DEFAULT 'draft',
  is_hero boolean NOT NULL DEFAULT false,
  hero_position int,
  is_editors_pick boolean NOT NULL DEFAULT false,
  is_voice boolean NOT NULL DEFAULT false,
  read_minutes int NOT NULL DEFAULT 4,
  view_count int NOT NULL DEFAULT 0,
  seo_title text,
  seo_description text,
  og_image text,
  published_at timestamptz,
  scheduled_for timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX stories_status_idx ON public.stories(status);
CREATE INDEX stories_category_idx ON public.stories(category_id);
CREATE INDEX stories_created_by_idx ON public.stories(created_by);

GRANT SELECT ON public.stories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.stories TO authenticated;
GRANT ALL ON public.stories TO service_role;
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

-- read: published for everyone; own drafts for reporters; everything for editorial
CREATE POLICY "stories public read published" ON public.stories
  FOR SELECT USING (status = 'published');
CREATE POLICY "stories read own" ON public.stories
  FOR SELECT TO authenticated USING (created_by = auth.uid());
CREATE POLICY "stories editorial read" ON public.stories
  FOR SELECT TO authenticated USING (public.is_editorial(auth.uid()));

-- reporters: own rows only, and only draft/in_review states
CREATE POLICY "reporters insert own drafts" ON public.stories
  FOR INSERT TO authenticated
  WITH CHECK (
    created_by = auth.uid()
    AND status IN ('draft', 'in_review')
    AND published_at IS NULL
    AND public.has_role(auth.uid(), 'reporter')
  );
CREATE POLICY "reporters update own drafts" ON public.stories
  FOR UPDATE TO authenticated
  USING (
    created_by = auth.uid()
    AND status IN ('draft', 'in_review')
    AND public.has_role(auth.uid(), 'reporter')
  )
  WITH CHECK (
    created_by = auth.uid()
    AND status IN ('draft', 'in_review')
    AND published_at IS NULL
  );

-- editors/admins: full control including status transitions
CREATE POLICY "editorial insert stories" ON public.stories
  FOR INSERT TO authenticated WITH CHECK (public.is_editorial(auth.uid()));
CREATE POLICY "editorial update stories" ON public.stories
  FOR UPDATE TO authenticated
  USING (public.is_editorial(auth.uid())) WITH CHECK (public.is_editorial(auth.uid()));
CREATE POLICY "editorial delete stories" ON public.stories
  FOR DELETE TO authenticated USING (public.is_editorial(auth.uid()));

CREATE TRIGGER stories_updated_at BEFORE UPDATE ON public.stories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- keep published_at in sync
CREATE OR REPLACE FUNCTION public.sync_published_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.status = 'published' AND NEW.published_at IS NULL THEN
    NEW.published_at = now();
  END IF;
  IF NEW.status <> 'published' AND NEW.status <> 'archived' THEN
    NEW.published_at = NULL;
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER stories_sync_published_at BEFORE INSERT OR UPDATE ON public.stories
  FOR EACH ROW EXECUTE FUNCTION public.sync_published_at();

-- STORY TAGS
CREATE TABLE public.story_tags (
  story_id uuid NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (story_id, tag_id)
);
GRANT SELECT ON public.story_tags TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.story_tags TO authenticated;
GRANT ALL ON public.story_tags TO service_role;
ALTER TABLE public.story_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "story_tags public read" ON public.story_tags FOR SELECT USING (true);
CREATE POLICY "story_tags owner write" ON public.story_tags FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.stories s WHERE s.id = story_id
                 AND (s.created_by = auth.uid() OR public.is_editorial(auth.uid()))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.stories s WHERE s.id = story_id
                 AND (s.created_by = auth.uid() OR public.is_editorial(auth.uid()))));

-- STORY VIEWS (real trending)
CREATE TABLE public.story_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id uuid NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  viewed_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX story_views_story_idx ON public.story_views(story_id, viewed_at DESC);
GRANT INSERT ON public.story_views TO anon;
GRANT SELECT, INSERT ON public.story_views TO authenticated;
GRANT ALL ON public.story_views TO service_role;
ALTER TABLE public.story_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "story_views anyone can record" ON public.story_views FOR INSERT WITH CHECK (true);
CREATE POLICY "story_views editorial read" ON public.story_views FOR SELECT TO authenticated
  USING (public.is_editorial(auth.uid()));

CREATE OR REPLACE FUNCTION public.bump_view_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.stories SET view_count = view_count + 1 WHERE id = NEW.story_id;
  RETURN NEW;
END; $$;
CREATE TRIGGER story_views_bump AFTER INSERT ON public.story_views
  FOR EACH ROW EXECUTE FUNCTION public.bump_view_count();

-- SUBSCRIBERS
CREATE TABLE public.subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  name text,
  source text NOT NULL DEFAULT 'homepage',
  status text NOT NULL DEFAULT 'active',
  date_subscribed timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.subscribers TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subscribers TO authenticated;
GRANT ALL ON public.subscribers TO service_role;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "subscribers anyone can subscribe" ON public.subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "subscribers editorial read" ON public.subscribers FOR SELECT TO authenticated
  USING (public.is_editorial(auth.uid()));
CREATE POLICY "subscribers editorial write" ON public.subscribers FOR UPDATE TO authenticated
  USING (public.is_editorial(auth.uid())) WITH CHECK (public.is_editorial(auth.uid()));

-- NEW USER BOOTSTRAP: first account is admin, later accounts are reporters
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  assigned public.app_role;
  base_slug text;
  final_slug text;
  n int := 1;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles) THEN
    assigned := 'admin';
  ELSE
    assigned := 'reporter';
  END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, assigned)
  ON CONFLICT DO NOTHING;

  base_slug := regexp_replace(lower(split_part(NEW.email, '@', 1)), '[^a-z0-9]+', '-', 'g');
  IF base_slug = '' OR base_slug IS NULL THEN base_slug := 'author'; END IF;
  final_slug := base_slug;
  WHILE EXISTS (SELECT 1 FROM public.authors WHERE slug = final_slug) LOOP
    n := n + 1;
    final_slug := base_slug || '-' || n;
  END LOOP;

  INSERT INTO public.authors (user_id, name, slug)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)), final_slug);
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- SEED CATEGORIES
INSERT INTO public.categories (name, slug, accent_color, sort_order, description) VALUES
  ('Culture', 'culture', '#F5C518', 1, 'Movements, moments and the people shaping them.'),
  ('Music', 'music', '#F5C518', 2, 'Afrobeats, amapiano and everything next.'),
  ('Style', 'style', '#F5C518', 3, 'Streetwear, runway and the business of looking good.'),
  ('Tech', 'tech', '#F5C518', 4, 'AI, startups and builders on the continent.'),
  ('Entertainment', 'entertainment', '#F5C518', 5, 'Screens, stages and the stories behind them.'),
  ('Hustle', 'hustle', '#F5C518', 6, 'Money, margins and making it work.');

-- SEED AUTHORS
INSERT INTO public.authors (name, slug, avatar, bio) VALUES
  ('Melissa A.', 'melissa-a', '/img/voice-2.jpg', 'Music writer covering the Afrobeats economy.'),
  ('Ivan K.', 'ivan-k', '/img/voice-1.jpg', 'Reporting on Kampala''s creative underground.'),
  ('T. Kato', 't-kato', '/img/voice-3.jpg', 'Style and streetwear correspondent.'),
  ('Aisha N.', 'aisha-n', '/img/voice-2.jpg', 'Screens, stages and everything entertainment.'),
  ('Daniel O.', 'daniel-o', '/img/voice-1.jpg', 'Tech and AI on the continent.'),
  ('K. Ampaire', 'k-ampaire', '/img/voice-3.jpg', 'The business behind the culture.'),
  ('VibeFreq Team', 'vibefreq-team', '/img/editors-feature.jpg', 'The VibeFreq editorial desk.'),
  ('Joash K.', 'joash-k', '/img/voice-1.jpg', 'Opinion contributor.'),
  ('Neema R.', 'neema-r', '/img/voice-2.jpg', 'Opinion contributor.'),
  ('Oscar M.', 'oscar-m', '/img/voice-3.jpg', 'Opinion contributor.');

-- SEED STORIES
INSERT INTO public.stories
  (slug, title, excerpt, body, cover_image, category_id, author_id, status, is_hero, hero_position,
   is_editors_pick, is_voice, read_minutes, view_count, published_at)
VALUES
  ('rema-global-tour', 'Rema Announces Global Tour Dates',
   'The Afrobeats star maps out 24 cities, three continents and one very loud statement of intent.',
   '[{"type":"paragraph","text":"The Afrobeats star maps out 24 cities across three continents, turning a victory lap into a statement of intent."},{"type":"paragraph","text":"Tickets go on sale in waves, with African dates leading the run before the tour moves to Europe and North America."}]'::jsonb,
   '/img/story-music.jpg',
   (SELECT id FROM public.categories WHERE slug = 'music'),
   (SELECT id FROM public.authors WHERE slug = 'melissa-a'),
   'published', true, 1, false, false, 5, 980, now() - interval '1 day'),
  ('sound-of-kampala', 'The Sound of Kampala: A Wave of New Talent',
   'Inside the studios, bars and basements shaping Uganda''s next musical export.',
   '[{"type":"paragraph","text":"Kampala''s studio scene has quietly become one of the most productive in East Africa."},{"type":"paragraph","text":"We spent a week with the producers turning bedroom sessions into charting records."}]'::jsonb,
   '/img/story-culture.jpg',
   (SELECT id FROM public.categories WHERE slug = 'culture'),
   (SELECT id FROM public.authors WHERE slug = 'ivan-k'),
   'published', true, 2, false, false, 4, 910, now() - interval '2 days'),
  ('streetwear-brands-2025', 'Streetwear Brands Leading in 2025',
   'From Lagos to Nairobi, the labels turning local craft into global demand.',
   '[{"type":"paragraph","text":"A new class of labels is proving that local manufacturing and global demand are not opposites."}]'::jsonb,
   '/img/story-style.jpg',
   (SELECT id FROM public.categories WHERE slug = 'style'),
   (SELECT id FROM public.authors WHERE slug = 't-kato'),
   'published', true, 3, false, false, 6, 870, now() - interval '3 days'),
  ('movies-this-weekend', 'Top 10 Movies to Watch This Weekend',
   'Big screens, bigger performances — the watchlist that''s worth your evening.',
   '[{"type":"paragraph","text":"Ten films worth your weekend, from festival breakouts to streaming sleepers."}]'::jsonb,
   '/img/story-entertainment.jpg',
   (SELECT id FROM public.categories WHERE slug = 'entertainment'),
   (SELECT id FROM public.authors WHERE slug = 'aisha-n'),
   'published', true, 4, false, false, 3, 800, now() - interval '3 days'),
  ('ai-tools-creators', 'AI Tools Creators Are Using Right Now',
   'The stack behind the fastest-growing creative studios on the continent.',
   '[{"type":"paragraph","text":"The tools changed. The taste still decides who wins."}]'::jsonb,
   '/img/story-tech.jpg',
   (SELECT id FROM public.categories WHERE slug = 'tech'),
   (SELECT id FROM public.authors WHERE slug = 'daniel-o'),
   'published', false, NULL, false, false, 7, 760, now() - interval '4 days'),
  ('business-behind-fashion', 'The Business Behind African Fashion',
   'Margins, manufacturing and the money conversation nobody posts about.',
   '[{"type":"paragraph","text":"Behind every sold-out drop is a spreadsheet nobody posts about."}]'::jsonb,
   '/img/story-style.jpg',
   (SELECT id FROM public.categories WHERE slug = 'hustle'),
   (SELECT id FROM public.authors WHERE slug = 'k-ampaire'),
   'published', false, NULL, false, false, 8, 710, now() - interval '3 days'),
  ('afrobeats-global-charts', 'The Rise of Afrobeats in Global Charts',
   'How a regional sound became the default rhythm of global pop — and who''s cashing in.',
   '[{"type":"paragraph","text":"Afrobeats did not cross over. The rest of the world crossed in."},{"type":"paragraph","text":"We break down the streaming data, the publishing deals and the touring economics."}]'::jsonb,
   '/img/editors-feature.jpg',
   (SELECT id FROM public.categories WHERE slug = 'music'),
   (SELECT id FROM public.authors WHERE slug = 'vibefreq-team'),
   'published', false, NULL, true, false, 9, 950, now() - interval '2 days'),
  ('future-afrobeats', 'The Future of Afrobeats is in Our Hands',
   'An argument for owning the masters, the venues and the narrative.',
   '[{"type":"paragraph","text":"Ownership is the only export strategy that compounds."}]'::jsonb,
   '/img/voice-1.jpg',
   (SELECT id FROM public.categories WHERE slug = 'music'),
   (SELECT id FROM public.authors WHERE slug = 'joash-k'),
   'published', false, NULL, false, true, 4, 400, now() - interval '1 day'),
  ('african-fashion-global', 'Why African Fashion Is Finally Global',
   'It was never a trend. It was a supply chain finally catching up.',
   '[{"type":"paragraph","text":"The talent was always here. The infrastructure is what changed."}]'::jsonb,
   '/img/voice-2.jpg',
   (SELECT id FROM public.categories WHERE slug = 'style'),
   (SELECT id FROM public.authors WHERE slug = 'neema-r'),
   'published', false, NULL, false, true, 5, 380, now() - interval '2 days'),
  ('building-in-africa', 'Building in Africa: The Real Hustle',
   'What founders actually spend their days doing.',
   '[{"type":"paragraph","text":"Fundraising is the story. Operations are the job."}]'::jsonb,
   '/img/voice-3.jpg',
   (SELECT id FROM public.categories WHERE slug = 'hustle'),
   (SELECT id FROM public.authors WHERE slug = 'oscar-m'),
   'published', false, NULL, false, true, 6, 360, now() - interval '3 days');

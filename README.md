# VibeFreq Culture

Build a modern, vibrant blog website called "VibeFreq" — a global lifestyle and culture blog 

covering Music & Entertainment, Tech & AI, Fashion, Business & Hustle, and African/Uganda culture.

Design requirements:

- Dark mode base with electric accent colors (neon green or gold highlights)

- Bold, modern typography — large headlines, clean body text

- Hero section with blog name "VibeFreq", tagline: "Music. Tech. Culture. Hustle."

- Featured posts grid (3 cards on desktop, stacked on mobile)

- Category filter tabs: Music, Tech, Lifestyle, Business, Culture

- Newsletter signup section

- Responsive — mobile first

- Clean navbar with logo, categories, and a search icon

- Footer with social links

Blog post card should include: thumbnail image, category tag, title, short excerpt, read time, and date.

Style vibe: Think The Shade Room meets TechCrunch Africa — bold, clean, culturally confident.Fix these specific deviations from the VibeFreq homepage mockup — do not redesign anything else:

1. HERO IMAGE: Replace the current concert-crowd hero image. It should be a portrait-style editorial photo (model with sunglasses and gold jewelry, warm gold-toned lighting) with a gold-duotone treatment, and the large "VF" brand mark + heartbeat waveform line visible as a background graphic behind the subject on the right side — matching the reference mockup exactly. If a licensed photo isn't available, use a comparable gold-duotone portrait placeholder, not an unrelated scene.

2. EDITOR'S PICK CARDS: Rebuild these as full-bleed image cards, not boxed layouts. The photo should fill the entire card. Category label sits top-left directly on the image. Title, byline, and date are overlaid at the bottom of the image over a dark gradient scrim (image fades to black at the bottom for text legibility) — not placed beside the image in a separate text panel.

3. IMAGE TREATMENT ACROSS ALL CARDS: Apply a consistent gold-duotone or high-contrast filter to every editorial photo (hero, Editor's Pick, Latest Stories, Trending thumbnails) so the imagery reads as one cohesive brand system rather than untreated stock-style photos.

Keep everything else as currently built — header, nav, trending panel, latest stories grid/tabs, and newsletter section are correct and should not change.Extend the VibeFreq homepage below "Latest Stories" to match this reference mockup exactly. These sections are net-new — build them in addition to what already exists, matching the established design tokens (near-black background, gold accent #F5C518, white text, waveform icon motif before section labels, sharp corners).

1. LATEST STORIES — convert to a horizontal carousel (not a static grid): left/right circular arrow nav buttons top-right of the section header, 5 visible cards, each full-bleed image with category tag (color-coded per category) top-left, title (up to 2 lines), byline, date, read-time with clock icon, and a small circular arrow button bottom-right linking to the article.

2. VOICES (new section): waveform icon + "VOICES" label, subcopy "Real opinions. Real people. Real talk.", "VIEW ALL VOICES →" link top-right. Below: 3 contributor cards, each with a circular headshot, opinion-piece headline, byline, and date — pulled from stories tagged as opinion/voices content. Include carousel pagination below (left/right circular arrows + numbered dots, active dot in gold) since there will be more than 3 contributors over time.

3. EDITOR'S PICK (redesign from 3-card grid to single large feature): big image on the left (~65% width) with a warm gold-duotone treatment, dark panel on the right with category tag, headline, byline, date, and a gold "READ FEATURE →" button. Pulls from the single story marked is_editors_pick_feature in the CMS.

4. NEWSLETTER (redesign): gold circular envelope icon on the left, "STAY IN THE FREQUENCY." headline, subcopy, email input + gold "SUBSCRIBE" button inline, small "🔒 No spam. Unsubscribe anytime." microcopy below the input. Same subscribe logic (validation, duplicate check, success/error states) as already implemented — just restyle to match.

5. FOOTER (expand): logo + wordmark + tagline on the left. Three link columns — "Quick Links" (About Us, Advertise, Contact, Careers), "Categories" (two sub-columns: Music/Style/Culture/Identity and Entertainment/Tech/Hustle, each linking to /category/:slug), "Follow Us" (Instagram, X, TikTok, YouTube, Facebook icons in circular outline buttons).

6. TRENDING TICKER (new, very bottom of page, full-width): gold "TRENDING" badge block on the left with waveform icon, followed by a horizontally-scrolling or wrapped list of numbered trending items (01-05, gold numerals) pulled from the same trending_score ranking used elsewhere on the site.

Do not modify the hero, header, or existing Editor's Pick data logic beyond restyling it into the new single-feature layout — just extend structure and visuals to match this reference.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://vibefrequg.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/25e7682d-803f-45ea-9252-17e58db5a2da).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

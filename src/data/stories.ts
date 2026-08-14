import storyMusic from "@/assets/story-music.jpg";
import storyCulture from "@/assets/story-culture.jpg";
import storyStyle from "@/assets/story-style.jpg";
import storyEntertainment from "@/assets/story-entertainment.jpg";
import storyTech from "@/assets/story-tech.jpg";
import editorsFeature from "@/assets/editors-feature.jpg";
import voice1 from "@/assets/voice-1.jpg";
import voice2 from "@/assets/voice-2.jpg";
import voice3 from "@/assets/voice-3.jpg";

export type Category =
  | "Music"
  | "Culture"
  | "Style"
  | "Tech"
  | "Entertainment"
  | "Hustle";

export const categories: Category[] = [
  "Culture",
  "Music",
  "Style",
  "Tech",
  "Entertainment",
  "Hustle",
];

export const categorySlug = (c: string) => c.toLowerCase();

export type Story = {
  id: string;
  title: string;
  excerpt: string;
  category: Category;
  author: string;
  date: string;
  readTime: string;
  image: string;
  trendingScore: number;
};

export const stories: Story[] = [
  {
    id: "rema-global-tour",
    title: "Rema Announces Global Tour Dates",
    excerpt:
      "The Afrobeats star maps out 24 cities, three continents and one very loud statement of intent.",
    category: "Music",
    author: "Melissa A.",
    date: "May 17, 2025",
    readTime: "5 min read",
    image: storyMusic,
    trendingScore: 98,
  },
  {
    id: "sound-of-kampala",
    title: "The Sound of Kampala: A Wave of New Talent",
    excerpt:
      "Inside the studios, bars and basements shaping Uganda's next musical export.",
    category: "Culture",
    author: "Ivan K.",
    date: "May 16, 2025",
    readTime: "4 min read",
    image: storyCulture,
    trendingScore: 91,
  },
  {
    id: "streetwear-brands-2025",
    title: "Streetwear Brands Leading in 2025",
    excerpt:
      "From Lagos to Nairobi, the labels turning local craft into global demand.",
    category: "Style",
    author: "T. Kato",
    date: "May 15, 2025",
    readTime: "6 min read",
    image: storyStyle,
    trendingScore: 87,
  },
  {
    id: "movies-this-weekend",
    title: "Top 10 Movies to Watch This Weekend",
    excerpt:
      "Big screens, bigger performances — the watchlist that's worth your evening.",
    category: "Entertainment",
    author: "Aisha N.",
    date: "May 15, 2025",
    readTime: "3 min read",
    image: storyEntertainment,
    trendingScore: 80,
  },
  {
    id: "ai-tools-creators",
    title: "AI Tools Creators Are Using Right Now",
    excerpt:
      "The stack behind the fastest-growing creative studios on the continent.",
    category: "Tech",
    author: "Daniel O.",
    date: "May 14, 2025",
    readTime: "7 min read",
    image: storyTech,
    trendingScore: 76,
  },
  {
    id: "business-behind-fashion",
    title: "The Business Behind African Fashion",
    excerpt:
      "Margins, manufacturing and the money conversation nobody posts about.",
    category: "Hustle",
    author: "K. Ampaire",
    date: "May 15, 2025",
    readTime: "8 min read",
    image: storyStyle,
    trendingScore: 71,
  },
];

export const editorsPicks: Story[] = [
  stories[0],
  stories[2],
  stories[4],
];

export const editorsFeatureStory: Story & { featureImage: string } = {
  id: "afrobeats-global-charts",
  title: "The Rise of Afrobeats in Global Charts",
  excerpt:
    "How a regional sound became the default rhythm of global pop — and who's cashing in.",
  category: "Music",
  author: "VibeFreq Team",
  date: "May 16, 2025",
  readTime: "9 min read",
  image: editorsFeature,
  featureImage: editorsFeature,
  trendingScore: 95,
};

export type Voice = {
  id: string;
  title: string;
  author: string;
  date: string;
  avatar: string;
};

export const voices: Voice[] = [
  {
    id: "future-afrobeats",
    title: "The Future of Afrobeats is in Our Hands",
    author: "Joash K.",
    date: "May 17, 2025",
    avatar: voice1,
  },
  {
    id: "african-fashion-global",
    title: "Why African Fashion Is Finally Global",
    author: "Neema R.",
    date: "May 16, 2025",
    avatar: voice2,
  },
  {
    id: "building-in-africa",
    title: "Building in Africa: The Real Hustle",
    author: "Oscar M.",
    date: "May 15, 2025",
    avatar: voice3,
  },
];

export const trending = [...stories]
  .sort((a, b) => b.trendingScore - a.trendingScore)
  .slice(0, 5);

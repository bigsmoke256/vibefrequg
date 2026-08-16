import { queryOptions } from "@tanstack/react-query";
import { getHomepage, getStoryBySlug, getStoriesByTag } from "./stories.functions";
import { listMedia } from "./media.functions";
import { listTags, listStaff } from "./newsroom.functions";
import { getStoryTags } from "./admin.functions";
import {
  getAdminStory,
  getDashboardStats,
  getMyAccount,
  listAdminStories,
  listRefData,
} from "./admin.functions";
import type { StoryStatus } from "./story-types";

export const homepageQuery = queryOptions({
  queryKey: ["homepage"],
  queryFn: () => getHomepage(),
});

export const storyQuery = (slug: string) =>
  queryOptions({
    queryKey: ["story", slug],
    queryFn: () => getStoryBySlug({ data: { slug } }),
  });

export const myAccountQuery = queryOptions({
  queryKey: ["my-account"],
  queryFn: () => getMyAccount(),
});

export const adminStoriesQuery = (filters: {
  status?: StoryStatus | "all";
  q?: string;
  categoryId?: string;
  authorId?: string;
}) =>
  queryOptions({
    queryKey: ["admin-stories", filters],
    queryFn: () => listAdminStories({ data: filters }),
  });

export const refDataQuery = queryOptions({
  queryKey: ["ref-data"],
  queryFn: () => listRefData(),
});

export const adminStoryQuery = (id: string) =>
  queryOptions({
    queryKey: ["admin-story", id],
    queryFn: () => getAdminStory({ data: { id } }),
  });

export const dashboardQuery = queryOptions({
  queryKey: ["admin-dashboard"],
  queryFn: () => getDashboardStats(),
});

export const mediaLibraryQuery = (q?: string) =>
  queryOptions({
    queryKey: ["media", q ?? ""],
    queryFn: () => listMedia({ data: q ? { q } : {} }),
  });

export const tagsQuery = queryOptions({
  queryKey: ["tags"],
  queryFn: () => listTags(),
});

export const staffQuery = queryOptions({
  queryKey: ["staff"],
  queryFn: () => listStaff(),
});

export const storyTagsQuery = (id: string) =>
  queryOptions({
    queryKey: ["story-tags", id],
    queryFn: () => getStoryTags({ data: { id } }),
  });

export const tagStoriesQuery = (slug: string) =>
  queryOptions({
    queryKey: ["tag-stories", slug],
    queryFn: () => getStoriesByTag({ data: { slug } }),
  });

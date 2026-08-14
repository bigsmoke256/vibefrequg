import { createFileRoute } from "@tanstack/react-router";
import { StoryForm } from "@/components/admin/StoryForm";

export const Route = createFileRoute("/_authenticated/admin/stories/new")({
  component: () => (
    <div>
      <h1 className="text-4xl leading-none uppercase">New story</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Saves as a draft until it is submitted for review.
      </p>
      <div className="mt-8">
        <StoryForm />
      </div>
    </div>
  ),
});

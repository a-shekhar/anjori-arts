"use client";

import { useActionState, useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { createBlogPost, updateBlogPost } from "@/actions/blog";
import { Wand2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type BlogFormProps = {
  initialData?: Record<string, unknown>;
};

export function BlogForm({ initialData }: BlogFormProps) {
  const isEditing = !!initialData;
  const updateAction = isEditing ? updateBlogPost.bind(null, initialData.id as string) : createBlogPost;
  const [state, formAction, isPending] = useActionState(updateAction, null);

  const [title, setTitle] = useState((initialData?.title as string) || "");
  const [slug, setSlug] = useState((initialData?.slug as string) || "");

  const generateSlug = () => {
    const generated = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    setSlug(generated);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!slug || !isEditing) {
      setSlug(
        val
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "")
      );
    }
  };

  const handleSlugBlur = () => {
    if (!slug.trim() && title.trim()) {
      generateSlug();
    }
  };

  return (
    <form action={formAction} className="space-y-8 max-w-2xl">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input 
          id="title" 
          name="title" 
          value={title}
          onChange={handleTitleChange}
          required 
        />
        {state?.errors?.title && (
          <p className="text-sm text-destructive">{state.errors.title}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <div className="flex gap-2">
          <Input 
            id="slug" 
            name="slug" 
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            onBlur={handleSlugBlur}
            required 
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={generateSlug}
            title="Auto-generate Slug from Title"
            aria-label="Auto-generate Slug from Title"
            className="shrink-0"
          >
            <Wand2 className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Public URL: <code className="font-mono text-foreground/90 bg-muted px-1.5 py-0.5 rounded text-[11px]">/blog/{slug || "..."}</code>. Click 🪄 to sync with title.
        </p>
        {state?.errors?.slug && (
          <p className="text-sm text-destructive">{state.errors.slug}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="excerpt">Excerpt</Label>
        <Textarea 
          id="excerpt" 
          name="excerpt" 
          defaultValue={initialData?.excerpt as string} 
          required 
          rows={3}
        />
        {state?.errors?.excerpt && (
          <p className="text-sm text-destructive">{state.errors.excerpt}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Content (Markdown)</Label>
        <Textarea 
          id="content" 
          name="content" 
          defaultValue={initialData?.content as string} 
          required 
          rows={15}
          className="font-mono text-sm"
        />
        {state?.errors?.content && (
          <p className="text-sm text-destructive">{state.errors.content}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="author">Author</Label>
          <Input 
            id="author" 
            name="author" 
            defaultValue={(initialData?.author as string) || "Anjori Arts"} 
            required 
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cover_image">Cover Image Path or URL</Label>
          <Input 
            id="cover_image" 
            name="cover_image" 
            type="text"
            placeholder="/images/categories/madhubani.jpg or https://..."
            defaultValue={initialData?.cover_image as string} 
            required 
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">Tags (comma separated)</Label>
        <Input 
          id="tags" 
          name="tags" 
          defaultValue={(initialData?.tags as string[] | undefined)?.join(", ")} 
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox 
          id="is_published" 
          name="is_published" 
          defaultChecked={!!initialData?.published_at} 
        />
        <Label htmlFor="is_published">Published</Label>
      </div>

      {state?.message && (
        <p className="text-sm font-medium text-destructive">{state.message}</p>
      )}

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
        <Button type="submit" disabled={isPending} className="w-full sm:w-auto min-h-[44px] h-11">
          {isPending ? "Saving..." : isEditing ? "Update Post" : "Create Post"}
        </Button>
        <Link href="/admin/blog" className={cn(buttonVariants({ variant: "outline" }), "w-full sm:w-auto min-h-[44px] h-11 text-center justify-center")}>
          Cancel
        </Link>
      </div>
    </form>
  );
}

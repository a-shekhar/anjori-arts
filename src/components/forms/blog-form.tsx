"use client";

import { useActionState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { createBlogPost, updateBlogPost } from "@/actions/blog";
import Link from "next/link";

type BlogFormProps = {
  initialData?: Record<string, unknown>;
};

export function BlogForm({ initialData }: BlogFormProps) {
  const isEditing = !!initialData;
  const updateAction = isEditing ? updateBlogPost.bind(null, initialData.id as string) : createBlogPost;
  const [state, formAction, isPending] = useActionState(updateAction, null);

  return (
    <form action={formAction} className="space-y-8 max-w-2xl">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input 
          id="title" 
          name="title" 
          defaultValue={initialData?.title as string} 
          required 
        />
        {state?.errors?.title && (
          <p className="text-sm text-destructive">{state.errors.title}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input 
          id="slug" 
          name="slug" 
          defaultValue={initialData?.slug as string} 
          required 
        />
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
          <Label htmlFor="cover_image">Cover Image URL</Label>
          <Input 
            id="cover_image" 
            name="cover_image" 
            type="url"
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

      <div className="flex gap-4">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : isEditing ? "Update Post" : "Create Post"}
        </Button>
        <Link href="/admin/blog" className={buttonVariants({ variant: "outline" })}>
          Cancel
        </Link>
      </div>
    </form>
  );
}

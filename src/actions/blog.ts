"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { withAdminAuth } from "@/lib/auth-admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const blogSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  excerpt: z.string().min(1, "Excerpt is required"),
  content: z.string().min(1, "Content is required"),
  cover_image: z
    .string()
    .min(1, "Cover image is required")
    .refine(
      (val) => val.startsWith("/") || /^https?:\/\//i.test(val),
      "Must be a valid URL or local path starting with /"
    ),
  author: z.string().min(1, "Author is required"),
  tags: z.string(), // comma separated
  is_published: z.boolean().default(false),
});

export const createBlogPost = withAdminAuth(async (prevState: unknown, formData: FormData) => {
  try {
    const supabase = createAdminClient();

    const validatedFields = blogSchema.safeParse({
      title: formData.get("title"),
      slug: formData.get("slug"),
      excerpt: formData.get("excerpt"),
      content: formData.get("content"),
      cover_image: formData.get("cover_image"),
      author: formData.get("author"),
      tags: formData.get("tags"),
      is_published: formData.get("is_published") === "on",
    });

    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: "Failed to create blog post.",
      };
    }

    const { is_published, tags, ...data } = validatedFields.data;
    const tagsArray = tags.split(",").map(t => t.trim()).filter(Boolean);

    const { error } = await supabase.from("blog_posts").insert({
      id: crypto.randomUUID(),
      ...data,
      tags: tagsArray,
      published_at: is_published ? new Date().toISOString() : null,
    });

    if (error) {
      return {
        message: error.message,
      };
    }

    revalidatePath("/blog");
    revalidatePath("/admin/blog");
  } catch (error: unknown) {
    const err = error as { message?: string; digest?: string };
    if (
      err &&
      typeof err === "object" &&
      "digest" in err &&
      typeof err.digest === "string" &&
      (err.digest.startsWith("DYNAMIC_SERVER_USAGE") ||
       err.digest.startsWith("NEXT_"))
    ) {
      throw error;
    }
    console.error("[createBlogPost] Unexpected error:", error);
    return {
      message: err?.message || "An unexpected error occurred while creating the blog post.",
    };
  }

  redirect("/admin/blog");
});

export const updateBlogPost = withAdminAuth(async (id: string, prevState: unknown, formData: FormData) => {
  try {
    const supabase = createAdminClient();

    const validatedFields = blogSchema.safeParse({
      title: formData.get("title"),
      slug: formData.get("slug"),
      excerpt: formData.get("excerpt"),
      content: formData.get("content"),
      cover_image: formData.get("cover_image"),
      author: formData.get("author"),
      tags: formData.get("tags"),
      is_published: formData.get("is_published") === "on",
    });

    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: "Failed to update blog post.",
      };
    }

    const { is_published, tags, ...data } = validatedFields.data;
    const tagsArray = tags.split(",").map(t => t.trim()).filter(Boolean);

    // Check current post to avoid overriding published_at if already published
    const { data: currentPost } = await supabase.from("blog_posts").select("published_at").eq("id", id).single();

    let publishedAt = currentPost?.published_at;
    if (is_published && !publishedAt) {
      publishedAt = new Date().toISOString();
    } else if (!is_published) {
      publishedAt = null;
    }

    const { error } = await supabase
      .from("blog_posts")
      .update({
        ...data,
        tags: tagsArray,
        published_at: publishedAt,
      })
      .eq("id", id);

    if (error) {
      return {
        message: error.message,
      };
    }

    revalidatePath("/blog");
    revalidatePath(`/blog/${validatedFields.data.slug}`);
    revalidatePath("/admin/blog");
  } catch (error: unknown) {
    const err = error as { message?: string; digest?: string };
    if (
      err &&
      typeof err === "object" &&
      "digest" in err &&
      typeof err.digest === "string" &&
      (err.digest.startsWith("DYNAMIC_SERVER_USAGE") ||
       err.digest.startsWith("NEXT_"))
    ) {
      throw error;
    }
    console.error("[updateBlogPost] Unexpected error:", error);
    return {
      message: err?.message || "An unexpected error occurred while updating the blog post.",
    };
  }

  redirect("/admin/blog");
});

export const deleteBlogPost = withAdminAuth(async (id: string) => {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("blog_posts").delete().eq("id", id);
    if (error) {
      return { success: false, message: error.message };
    }
    revalidatePath("/blog");
    revalidatePath("/admin/blog");
    return { success: true };
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error("[deleteBlogPost] Unexpected error:", error);
    return { success: false, message: err?.message || "An unexpected error occurred while deleting the blog post." };
  }
});

export async function fetchBlogPosts(options: {
  page: number;
  limit: number;
  search?: string;
  sort?: "newest" | "oldest";
}) {
  try {
    const supabase = await createClient();
    const { page, limit, search, sort = "newest" } = options;
    const offset = (page - 1) * limit;

    let query = supabase
      .from("blog_posts")
      .select("*", { count: "exact" })
      .not("published_at", "is", null);

    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    }

    if (sort === "newest") {
      query = query.order("published_at", { ascending: false });
    } else {
      query = query.order("published_at", { ascending: true });
    }

    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;

    if (error) {
      console.error("Error fetching blog posts:", error);
      return { posts: [], count: 0 };
    }

    return { posts: data || [], count: count || 0 };
  } catch (error: unknown) {
    console.error("[fetchBlogPosts] Unexpected error:", error);
    return { posts: [], count: 0 };
  }
}

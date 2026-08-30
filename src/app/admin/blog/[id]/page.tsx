import { Metadata } from "next";
import { BlogForm } from "@/components/forms/blog-form";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Edit Blog Post | Admin",
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditBlogPage({ params }: PageProps) {
  const resolvedParams = await params;
  const supabase = await createClient();
  const { data: post } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("id", resolvedParams.id)
    .single();

  if (!post) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Edit Blog Post</h2>
        <p className="text-muted-foreground">
          Update the blog post below.
        </p>
      </div>

      <div className="rounded-md border p-6 bg-card">
        <BlogForm initialData={post} />
      </div>
    </div>
  );
}


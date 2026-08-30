import { Metadata } from "next";
import { BlogForm } from "@/components/forms/blog-form";

export const metadata: Metadata = {
  title: "New Blog Post | Admin",
};

export default function NewBlogPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">New Blog Post</h2>
        <p className="text-muted-foreground">
          Create a new blog post for Anjori Arts.
        </p>
      </div>

      <div className="rounded-md border p-6 bg-card">
        <BlogForm />
      </div>
    </div>
  );
}


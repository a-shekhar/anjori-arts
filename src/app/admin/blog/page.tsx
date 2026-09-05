import { Metadata } from "next";
import Link from "next/link";
import { Plus, Edit, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { deleteBlogPost } from "@/actions/blog";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Manage Blogs | Admin",
  description: "Manage blog posts for Anjori Arts",
};

export default async function AdminBlogsPage() {
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("*")
    .order("created_at", { ascending: false });

  const blogPosts = posts || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Blog Posts</h2>
          <p className="text-muted-foreground">
            Manage your blog posts here.
          </p>
        </div>
        <Link href="/admin/blog/new" className={buttonVariants()}>
          <Plus className="mr-2 h-4 w-4" />
          Create Post
        </Link>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {blogPosts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No blog posts found. Create one to get started.
                </TableCell>
              </TableRow>
            ) : (
              blogPosts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="font-medium">
                    {post.title}
                    <div className="text-xs text-muted-foreground mt-1">
                      /{post.slug}
                    </div>
                  </TableCell>
                  <TableCell>
                    {post.published_at ? (
                      <Badge variant="default" className="bg-green-600/10 text-green-700 hover:bg-green-600/20 dark:bg-green-500/10 dark:text-green-400">Published</Badge>
                    ) : (
                      <Badge variant="secondary">Draft</Badge>
                    )}
                  </TableCell>
                  <TableCell>{post.author}</TableCell>
                  <TableCell>
                    {new Date(post.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/blog/${post.id}`} className={buttonVariants({ variant: "ghost", size: "icon" })}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Link>
                      <form action={async () => {
                        "use server";
                        await deleteBlogPost(post.id);
                      }}>
                        <Button variant="ghost" size="icon" type="submit" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </form>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}


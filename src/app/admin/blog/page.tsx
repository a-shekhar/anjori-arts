import { Metadata } from "next";
import Link from "next/link";
import { Plus, Edit, Trash2 } from "lucide-react";
import { deleteBlogPost, getAdminBlogPosts } from "@/actions/blog";
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
  const blogPosts = await getAdminBlogPosts();

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Blog Posts</h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Manage your store&apos;s editorial articles and stories.
          </p>
        </div>
        <Link
          href="/admin/blog/new"
          className={buttonVariants({
            className: "w-full sm:w-auto min-h-[44px] h-11 rounded-xl justify-center font-medium shadow-xs shrink-0",
          })}
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Post
        </Link>
      </div>

      {/* DESKTOP TABLE VIEW (>= 768px) */}
      <div className="hidden md:block rounded-xl border bg-card shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
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
                    <div className="text-xs font-mono text-muted-foreground mt-0.5">
                      /{post.slug}
                    </div>
                  </TableCell>
                  <TableCell>
                    {post.published_at ? (
                      <Badge variant="default" className="bg-green-600/15 text-green-800 dark:text-green-300">
                        Published
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Draft</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{post.author || "Anjori Arts"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(post.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end items-center gap-1.5">
                      <Link
                        href={`/admin/blog/${post.id}`}
                        className={buttonVariants({ variant: "ghost", size: "icon", className: "size-9" })}
                        aria-label={`Edit ${post.title}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <form action={async () => {
                        "use server";
                        try {
                          await deleteBlogPost(post.id);
                        } catch (err) {
                          console.error("[deleteBlogPost action] Unexpected error:", err);
                        }
                      }}>
                        <Button
                          variant="ghost"
                          size="icon"
                          type="submit"
                          aria-label={`Delete ${post.title}`}
                          className="size-9 text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* MOBILE CARDS VIEW (< 768px) */}
      <div className="grid gap-3 md:hidden">
        {blogPosts.length === 0 ? (
          <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground bg-muted/10">
            No blog posts found. Create one to get started.
          </div>
        ) : (
          blogPosts.map((post) => (
            <div
              key={post.id}
              className="rounded-2xl border border-border bg-card p-4 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm text-foreground">{post.title}</h3>
                  <p className="text-xs font-mono text-muted-foreground mt-0.5">/{post.slug}</p>
                </div>
                {post.published_at ? (
                  <Badge variant="default" className="bg-green-600/15 text-green-800 dark:text-green-300 text-[11px] shrink-0">
                    Published
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-[11px] shrink-0">
                    Draft
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border/60 pt-2.5">
                <span>By {post.author || "Anjori Arts"}</span>
                <span>
                  {new Date(post.created_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>

              <div className="flex items-center gap-2 pt-1 border-t border-border/60">
                <Link
                  href={`/admin/blog/${post.id}`}
                  className="flex-1 inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-border bg-card text-xs font-medium hover:bg-muted transition-colors"
                >
                  <Edit className="size-3.5" />
                  <span>Edit Post</span>
                </Link>
                <form
                  className="flex-initial"
                  action={async () => {
                    "use server";
                    try {
                      await deleteBlogPost(post.id);
                    } catch (err) {
                      console.error("[deleteBlogPost action] Unexpected error:", err);
                    }
                  }}
                >
                  <Button
                    variant="outline"
                    size="icon"
                    type="submit"
                    aria-label={`Delete ${post.title}`}
                    className="min-h-[44px] min-w-[44px] text-destructive hover:bg-destructive/10 hover:border-destructive/30 rounded-xl"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </form>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

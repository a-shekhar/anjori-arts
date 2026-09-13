"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Edit, Eye, MoreHorizontal, Trash2, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { deleteArtwork, toggleArtworkStatus, toggleArtworkFeatured } from "@/actions/admin-artworks";
import { toast } from "sonner";
import { cloudinaryLoader, getBlurUrl } from "@/lib/cloudinary";

export function ArtworkTable({ artworks }: { artworks: any[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredArtworks = artworks.filter((art) => {
    const matchesSearch = art.title.toLowerCase().includes(search.toLowerCase()) || 
                          art.slug.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || 
                          (statusFilter === "available" && art.is_available) ||
                          (statusFilter === "unavailable" && !art.is_available);
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) {
      return;
    }
    const toastId = toast.loading("Deleting artwork...");
    try {
      const res = await deleteArtwork(id);
      if (res.success) {
        toast.success("Artwork deleted", { id: toastId });
        router.refresh();
      } else {
        toast.error(`Error: ${res.message}`, { id: toastId });
      }
    } catch {
      toast.error("Failed to delete artwork", { id: toastId });
    }
  };

  const handleToggleStatus = async (id: string, isAvailable: boolean) => {
    const toastId = toast.loading("Updating status...");
    try {
      const res = await toggleArtworkStatus(id, !isAvailable);
      if (res.success) {
        toast.success("Status updated", { id: toastId });
        router.refresh();
      } else {
        toast.error(`Error: ${res.message}`, { id: toastId });
      }
    } catch {
      toast.error("Failed to update status", { id: toastId });
    }
  };

  const handleToggleFeatured = async (id: string, isFeatured: boolean) => {
    const toastId = toast.loading("Updating featured status...");
    try {
      const res = await toggleArtworkFeatured(id, !isFeatured);
      if (res.success) {
        toast.success("Featured status updated", { id: toastId });
        router.refresh();
      } else {
        toast.error(`Error: ${res.message}`, { id: toastId });
      }
    } catch {
      toast.error("Failed to update featured status", { id: toastId });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search artworks..." 
            className="pl-8" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={(val: any) => setStatusFilter(val || "all")}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="unavailable">Unavailable</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* DESKTOP TABLE VIEW (>= 768px) */}
      <div className="hidden md:block rounded-xl border bg-card shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredArtworks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  No artworks found.
                </TableCell>
              </TableRow>
            ) : (
              filteredArtworks.map((art) => {
                const primaryImage = art.images?.[0];
                let publicId = primaryImage?.publicId || "";
                if (!publicId && primaryImage?.url?.includes("res.cloudinary.com")) {
                   publicId = primaryImage.url.split("/upload/")[1]?.split("/").slice(1).join("/") || "";
                }

                return (
                  <TableRow key={art.id}>
                    <TableCell>
                      <div className="relative h-12 w-12 rounded-md overflow-hidden bg-muted">
                        {publicId ? (
                          <Image
                            src={publicId}
                            alt={art.title}
                            fill
                            loader={cloudinaryLoader}
                            placeholder="blur"
                            blurDataURL={getBlurUrl(publicId)}
                            className="object-cover"
                            sizes="48px"
                          />
                        ) : primaryImage?.url ? (
                          <Image
                            src={primaryImage.url}
                            alt={art.title}
                            fill
                            unoptimized
                            className="object-cover"
                            sizes="48px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No img</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{art.title}</div>
                      <div className="flex gap-2 items-center mt-1">
                        <span className="text-xs text-muted-foreground">/{art.slug}</span>
                        {art.category?.name && (
                          <Badge variant="outline" className="text-[10px] h-4 px-1 py-0">{art.category.name}</Badge>
                        )}
                        {art.variants?.length > 0 && (
                          <span className="text-[10px] text-muted-foreground">+{art.variants.length} var</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      ₹{(art.price / 100).toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell>
                      <Badge variant={art.is_available ? "default" : "secondary"} className={art.is_available ? "bg-green-600 hover:bg-green-700" : ""}>
                        {art.is_available ? "Available" : "Sold / Hidden"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {art.is_featured && <Badge variant="default" className="bg-amber-600 hover:bg-amber-700 text-white">Featured</Badge>}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger render={<Button variant="ghost" className="relative size-8 p-0 after:absolute after:-inset-2"><span className="sr-only">Open menu</span><MoreHorizontal className="h-4 w-4" /></Button>}>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => window.open(`/artworks/${art.slug}`, "_blank")} className="cursor-pointer">
                            <Eye className="mr-2 h-4 w-4" /> View Live
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/admin/artworks/${art.id}`)} className="cursor-pointer">
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleToggleStatus(art.id, art.is_available)} className="cursor-pointer">
                            {art.is_available ? "Mark as Unavailable" : "Mark as Available"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleFeatured(art.id, art.is_featured)} className="cursor-pointer">
                            {art.is_featured ? "Remove from Featured" : "Mark as Featured"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDelete(art.id, art.title)} className="text-destructive focus:bg-destructive/10 cursor-pointer">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* MOBILE CARDS VIEW (< 768px) */}
      <div className="grid gap-3 md:hidden">
        {filteredArtworks.length === 0 ? (
          <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground bg-muted/10">
            No artworks found matching your search.
          </div>
        ) : (
          filteredArtworks.map((art) => {
            const primaryImage = art.images?.[0];
            let publicId = primaryImage?.publicId || "";
            if (!publicId && primaryImage?.url?.includes("res.cloudinary.com")) {
              publicId = primaryImage.url.split("/upload/")[1]?.split("/").slice(1).join("/") || "";
            }

            return (
              <div
                key={art.id}
                className="rounded-2xl border border-border bg-card p-3.5 shadow-xs space-y-3"
              >
                {/* Image + Info Row */}
                <div className="flex gap-3 items-start">
                  <div className="relative size-18 shrink-0 rounded-xl overflow-hidden bg-muted border border-border/80">
                    {publicId ? (
                      <Image
                        src={publicId}
                        alt={art.title}
                        fill
                        loader={cloudinaryLoader}
                        placeholder="blur"
                        blurDataURL={getBlurUrl(publicId)}
                        className="object-cover"
                        sizes="72px"
                      />
                    ) : primaryImage?.url ? (
                      <Image
                        src={primaryImage.url}
                        alt={art.title}
                        fill
                        unoptimized
                        className="object-cover"
                        sizes="72px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No img</div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-foreground truncate">{art.title}</h3>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      {art.category?.name && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                          {art.category.name}
                        </Badge>
                      )}
                      {art.variants?.length > 0 && (
                        <span className="text-[10px] text-muted-foreground">
                          {art.variants.length} var
                        </span>
                      )}
                    </div>
                    <div className="mt-1.5 flex items-baseline gap-2">
                      <span className="font-serif font-bold text-base text-foreground">
                        ₹{(art.price / 100).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Badges Row */}
                <div className="flex items-center justify-between border-t border-border/60 pt-2.5 text-xs">
                  <div className="flex items-center gap-1.5">
                    <Badge
                      variant={art.is_available ? "default" : "secondary"}
                      className={`text-[11px] ${art.is_available ? "bg-green-600 hover:bg-green-700" : ""}`}
                    >
                      {art.is_available ? "Available" : "Sold / Hidden"}
                    </Badge>
                    {art.is_featured && (
                      <Badge variant="default" className="text-[11px] bg-amber-600 hover:bg-amber-700 text-white">
                        Featured
                      </Badge>
                    )}
                  </div>

                  <span className="text-[11px] font-mono text-muted-foreground truncate max-w-[120px]">
                    /{art.slug}
                  </span>
                </div>

                {/* Mobile Action Buttons (44px min hit targets) */}
                <div className="flex items-center gap-2 pt-1 border-t border-border/60">
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/admin/artworks/${art.id}`)}
                    className="flex-1 min-h-[44px] text-xs font-semibold"
                  >
                    <Edit className="mr-1.5 h-3.5 w-3.5" />
                    Edit Artwork
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={() => window.open(`/artworks/${art.slug}`, "_blank")}
                    aria-label={`View ${art.title} live`}
                    className="min-h-[44px] min-w-[44px] px-2 text-muted-foreground hover:text-foreground"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger render={
                      <Button
                        variant="ghost"
                        aria-label="More options"
                        className="min-h-[44px] min-w-[44px] px-2 text-muted-foreground hover:text-foreground"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    } />
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleToggleStatus(art.id, art.is_available)} className="cursor-pointer min-h-[40px]">
                        {art.is_available ? "Mark as Unavailable" : "Mark as Available"}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleFeatured(art.id, art.is_featured)} className="cursor-pointer min-h-[40px]">
                        {art.is_featured ? "Remove from Featured" : "Mark as Featured"}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleDelete(art.id, art.title)} className="text-destructive focus:bg-destructive/10 cursor-pointer min-h-[40px]">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete Artwork
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

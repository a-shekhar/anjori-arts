import { Metadata } from "next";
import { getAdminCategories } from "@/actions/admin-categories";
import { CategoryTable } from "@/components/admin/category-table";

export const metadata: Metadata = {
  title: "Manage Categories | Admin",
  description: "Manage art categories, slugs, and cover photos for Anjori Arts",
};

export default async function AdminCategoriesPage() {
  const categories = await getAdminCategories();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Categories</h2>
        <p className="text-muted-foreground">
          Manage your art categories, descriptions, and cover photos.
        </p>
      </div>

      <CategoryTable initialCategories={categories} />
    </div>
  );
}


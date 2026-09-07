import { Metadata } from "next";
import { getAdminMediums } from "@/actions/admin-mediums";
import { MediumTable } from "@/components/admin/medium-table";

export const metadata: Metadata = {
  title: "Manage Mediums | Admin",
  description: "Manage artwork mediums, pigments, dyes, and paints for Anjori Arts",
};

export default async function AdminMediumsPage() {
  const mediums = await getAdminMediums();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Mediums</h2>
        <p className="text-muted-foreground">
          Manage art mediums, pigments, and dyes available for artworks and custom commissions.
        </p>
      </div>

      <MediumTable initialMediums={mediums} />
    </div>
  );
}


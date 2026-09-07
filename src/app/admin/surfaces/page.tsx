import { Metadata } from "next";
import { getAdminSurfaces } from "@/actions/admin-surfaces";
import { SurfaceTable } from "@/components/admin/surface-table";

export const metadata: Metadata = {
  title: "Manage Surfaces | Admin",
  description: "Manage artwork surfaces, substrates, display ordering, and visibility for Anjori Arts",
};

export default async function AdminSurfacesPage() {
  const surfaces = await getAdminSurfaces();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Surfaces</h2>
        <p className="text-muted-foreground">
          Manage artwork substrates and surfaces, ordering in dropdowns, and form availability.
        </p>
      </div>

      <SurfaceTable initialSurfaces={surfaces} />
    </div>
  );
}


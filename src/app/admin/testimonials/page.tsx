import { Metadata } from "next";
import { getAdminTestimonials } from "@/actions/admin-testimonials";
import { TestimonialTable } from "@/components/admin/testimonial-table";

export const metadata: Metadata = {
  title: "Collector Stories & Testimonials | Admin",
  description: "Moderate, approve, and feature collector reviews and room photographs for Anjori Arts",
};

export default async function AdminTestimonialsPage() {
  const testimonials = await getAdminTestimonials();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Collector Stories</h2>
        <p className="text-muted-foreground">
          Moderate customer submissions, approve stories for publication, feature top reviews on the homepage, or add quotes from WhatsApp.
        </p>
      </div>

      <TestimonialTable initialTestimonials={testimonials} />
    </div>
  );
}


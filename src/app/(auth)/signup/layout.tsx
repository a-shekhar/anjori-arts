import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create an Anjori Arts account to discover authentic Indian art, save your favorites, and enjoy a personalized art collecting experience.",
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}


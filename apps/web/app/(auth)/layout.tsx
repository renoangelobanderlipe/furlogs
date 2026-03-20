import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FurLog — Sign In",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-dvh flex items-center justify-center p-6 bg-background">
      {children}
    </main>
  );
}

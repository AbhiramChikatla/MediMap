import { Footer } from "@/components/landing";
import { Navbar } from "@/components/landing/navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dashboard-layout">
      <Navbar />
      {children}
      <Footer />
    </div>
  );
}
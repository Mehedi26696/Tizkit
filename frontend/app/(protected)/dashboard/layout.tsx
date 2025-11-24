import Sidebar from "./components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-[#f9f4eb]/50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 py-5 px-8 mt-10 bg-[#f9f4eb]/50">
        {children}
      </div>
    </div>
  );
}

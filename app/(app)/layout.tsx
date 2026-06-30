import { TabBar } from "@/components/tab-bar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col pb-24">
      {children}
      <TabBar />
    </div>
  );
}

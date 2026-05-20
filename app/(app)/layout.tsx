import NavigationShell from "@/components/navigation-shell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <NavigationShell>{children}</NavigationShell>;
}
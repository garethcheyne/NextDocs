export default function AdminFeaturesLayout({ children }: { children: React.ReactNode }) {
  // This layout now only renders children; AdminLayout provides sidebar and header
  return children;
}

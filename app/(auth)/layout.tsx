export const dynamic = "force-dynamic";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#fffdf8] flex items-center justify-center p-4">
      {children}
    </div>
  );
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex items-center justify-center min-h-screen bg-[#fffdf8]">
        {children}
      </body>
    </html>
  );
}

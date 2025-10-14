import "./globals.css";
import Navbar from "@/components/Navbar";
import Providers from "@/components/Providers";

export const metadata = {
  title: "YourShift",
  description: "Guards and Shifts Management App",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-100 min-h-screen">
        {/* ✅ استخدم الـ Providers الذي أنشأناه */}
        <Providers>
          <Navbar />
          <main className="p-8">{children}</main>
        </Providers>
      </body>
    </html>
  );
}

import ClientLayout from "./_components/ClientLayout";
import "../globals.css";

export default function RootLayout({ children }) {
  return (
    <div className="max-h-screen overflow-hidden bg-white">
      <ClientLayout>{children}</ClientLayout>
    </div>
  );
}

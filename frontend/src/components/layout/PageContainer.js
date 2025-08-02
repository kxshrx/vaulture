import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

export function PageContainer({ children, showFooter = true }) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 pt-16">{children}</main>
      {showFooter && <Footer />}
    </div>
  );
}

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import AdSection from "./components/AdSection";
import Services from "./components/Services";
import Gallery from "./components/Gallery";
import HowToOrder from "./components/HowToOrder";
import CTA from "./components/CTA";
import ContactForm from "./components/ContactForm";
import Footer from "./components/Footer";

import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import CustomerProfile from "./pages/CustomerProfile";
import CustomerDashboard from "./pages/CustomerDashboard";

export default function App() {
  const currentPath =
    window.location.pathname.replace(/\/+$/, "") || "/";

  if (currentPath === "/admin/login") {
    return <AdminLogin />;
  }

  if (currentPath === "/admin/dashboard") {
    return <AdminDashboard />;
  }

  if (currentPath === "/profile") {
    return <CustomerProfile />;
  }

  if (currentPath === "/dashboard" || currentPath.startsWith("/dashboard/")) {
    return <CustomerDashboard />;
  }

  return (
    <>
      <Navbar />

      <main className="mc-public-page-transition">
        <Hero />
        <AdSection slot={1} />
        <Services />
        <Gallery />
        <HowToOrder />
        <CTA />
        <ContactForm />
        <AdSection slot={2} />
      </main>

      <Footer />

      <a
        className="floating-whatsapp"
        href="https://wa.me/6282188558026?text=Halo%20Mamras%20Clean%2C%20saya%20ingin%20bertanya."
        target="_blank"
        rel="noreferrer"
        aria-label="Chat Mamras Clean via WhatsApp">
        <span className="whatsapp-tooltip">Chat dengan kami</span>
        <MessageCircleIcon />
      </a>
    </>
  );
}

function MessageCircleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="25"
      height="25"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 11.5a8.5 8.5 0 0 1-12.5 7.5L3 21l2-5.5A8.5 8.5 0 1 1 21 11.5Z" />
      <path d="M8.5 9.5c.5 2 2 3.5 4 4" />
    </svg>
  );
}



import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Sparkles,
  ClipboardList,
  History,
  CircleHelp,
  UserRound,
  LogOut,
  Menu,
  X,
  ArrowRight,
  MessageCircle,
  ShieldCheck,
  LoaderCircle,
  AlertCircle,
  Home,
  CalendarCheck,
  Brush,
  Sofa,
  Wind,
  Droplets,
  Building2,
  Store,
  House,
  Waves,
  SprayCan,
  ChevronRight
} from "lucide-react";

import CustomerProfileModal from "../components/CustomerProfileModal";
import CustomerOrderForm from "../components/CustomerOrderForm";
import CustomerOrderList from "../components/CustomerOrderList";
import "../components/CustomerOrder.css";
import { openWhatsAppIfAuthenticated } from "../utils/requireCustomerAuth";
import "./CustomerDashboard.css";

const whatsappUrl =
  "https://wa.me/6282188558026?text=" +
  encodeURIComponent("Halo Mamras Clean, saya ingin bertanya tentang layanan.");

const navigation = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Layanan", path: "/dashboard/services", icon: Sparkles },
  { label: "Pesanan Saya", path: "/dashboard/orders", icon: ClipboardList },
  { label: "Riwayat Pesanan", path: "/dashboard/history", icon: History },
  { label: "Bantuan", path: "/dashboard/help", icon: CircleHelp }
];

const serviceIcons = {
  Home,
  Building2,
  Sparkles,
  SprayCan,
  Brush,
  Sofa,
  Wind,
  Droplets,
  House,
  Store,
  Waves
};

function CustomerDashboard() {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [servicesError, setServicesError] = useState("");
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState("");

  const currentPath =
    window.location.pathname.replace(/\/+$/, "") || "/dashboard";

  const activePath = navigation.some((item) => item.path === currentPath)
    ? currentPath
    : "/dashboard";

  useEffect(() => {
    const token = sessionStorage.getItem("mamras_clean_user_token");

    if (!token) {
      window.location.replace("/");
      return;
    }

    async function loadCustomer() {
      try {
        const response = await fetch("/api/auth/me", {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`
          }
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok || !data.user || data.user.role !== "user") {
          throw new Error(data.message || "Akses pelanggan tidak tersedia.");
        }

        setCustomer(data.user);
        sessionStorage.setItem(
          "mamras_clean_user",
          JSON.stringify(data.user)
        );
      } catch (err) {
        setError(err.message || "Gagal memuat data pelanggan.");

        if (err.message?.toLowerCase().includes("unauthenticated")) {
          sessionStorage.removeItem("mamras_clean_user_token");
          sessionStorage.removeItem("mamras_clean_user");
          window.location.replace("/");
        }
      } finally {
        setLoading(false);
      }
    }

    loadCustomer();
  }, []);

  useEffect(() => {
    if (activePath !== "/dashboard/services") return;

    const controller = new AbortController();

    async function loadServices() {
      setServicesLoading(true);
      setServicesError("");

      try {
        const response = await fetch("/api/services", {
          signal: controller.signal,
          headers: { Accept: "application/json" }
        });

        const result = await response.json().catch(() => ({}));

        if (!response.ok || !result.success || !Array.isArray(result.data)) {
          throw new Error(result.message || "Daftar layanan gagal dimuat.");
        }

        setServices(
          result.data.filter((service) => service.is_active !== false)
        );
      } catch (err) {
        if (err.name !== "AbortError") {
          setServicesError(err.message || "Gagal mengambil layanan.");
        }
      } finally {
        if (!controller.signal.aborted) setServicesLoading(false);
      }
    }

    loadServices();
    return () => controller.abort();
  }, [activePath]);

  async function handleLogout() {
    const token = sessionStorage.getItem("mamras_clean_user_token");

    try {
      if (token) {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`
          }
        });
      }
    } catch (err) {
      console.error("Logout:", err);
    } finally {
      sessionStorage.removeItem("mamras_clean_user_token");
      sessionStorage.removeItem("mamras_clean_user");
      window.location.assign("/");
    }
  }

  function handleWhatsApp(message) {
    const url =
      "https://wa.me/6282188558026?text=" + encodeURIComponent(message);
    openWhatsAppIfAuthenticated(url);
  }

  function renderDashboardHome() {
    return (
      <>
        <section className="mc-portal-welcome">
          <div>
            <span className="mc-portal-eyebrow">
              <Sparkles size={15} />
              AREA PELANGGAN MAMRAS CLEAN
            </span>
            <h1>
              Selamat datang,
              <span> {customer.name}!</span>
            </h1>
            <p>
              Kelola kebutuhan kebersihan Anda dengan lebih mudah melalui
              portal pelanggan Mamras Clean.
            </p>
            <a href="/dashboard/services" className="mc-portal-primary-link">
              Jelajahi Layanan <ArrowRight size={17} />
            </a>
          </div>
          <div className="mc-portal-welcome-art">
            <Home size={55} />
            <Sparkles size={23} />
          </div>
        </section>

        <section className="mc-portal-account">
          <div className="mc-portal-account-avatar">
            <UserRound size={25} />
          </div>
          <div className="mc-portal-account-info">
            <span>AKUN PELANGGAN</span>
            <strong>{customer.name}</strong>
            <small>{customer.email}</small>
          </div>
          <div className="mc-portal-account-status">
            <ShieldCheck size={17} />
            Pelanggan terdaftar
          </div>
        </section>

        <section className="mc-portal-section">
          <div className="mc-portal-section-heading">
            <span>AKSES CEPAT</span>
            <h2>Apa yang ingin Anda lakukan?</h2>
          </div>

          <div className="mc-portal-quick-grid">
            <a href="/dashboard/services" className="mc-portal-quick-card">
              <span className="mc-portal-quick-icon green">
                <Sparkles size={24} />
              </span>
              <strong>Lihat Layanan</strong>
              <p>Temukan layanan kebersihan yang tersedia.</p>
              <span className="mc-portal-card-link">
                Lihat layanan <ArrowRight size={15} />
              </span>
            </a>

            <a href="/dashboard/orders" className="mc-portal-quick-card">
              <span className="mc-portal-quick-icon teal">
                <ClipboardList size={24} />
              </span>
              <strong>Pesanan Saya</strong>
              <p>Lihat informasi pesanan layanan Anda.</p>
              <span className="mc-portal-card-link">
                Lihat pesanan <ArrowRight size={15} />
              </span>
            </a>

            <a href="/dashboard/history" className="mc-portal-quick-card">
              <span className="mc-portal-quick-icon gold">
                <History size={24} />
              </span>
              <strong>Riwayat Pesanan</strong>
              <p>Lihat catatan layanan yang telah dikerjakan.</p>
              <span className="mc-portal-card-link">
                Lihat riwayat <ArrowRight size={15} />
              </span>
            </a>

            <button
              type="button"
              className="mc-portal-quick-card"
              onClick={() => setProfileOpen(true)}
            >
              <span className="mc-portal-quick-icon blue">
                <UserRound size={24} />
              </span>
              <strong>Profil Saya</strong>
              <p>Periksa dan perbarui informasi akun.</p>
              <span className="mc-portal-card-link">
                Kelola profil <ArrowRight size={15} />
              </span>
            </button>
          </div>
        </section>

        <section className="mc-portal-help-banner">
          <div>
            <h2>Butuh bantuan kebersihan?</h2>
            <p>Tim Mamras Clean siap membantu kebutuhan Anda di Kaimana.</p>
          </div>
          <button
            type="button"
            onClick={() =>
              handleWhatsApp("Halo Mamras Clean, saya membutuhkan bantuan.")
            }
          >
            <MessageCircle size={18} />
            Hubungi Kami
          </button>
        </section>
      </>
    );
  }

  function renderServices() {
    if (bookingOpen) {
      return (
        <CustomerOrderForm
          customer={customer}
          services={services}
          initialServiceId={selectedServiceId}
          onCancel={() => {
            setBookingOpen(false);
            setSelectedServiceId("");
          }}
          onSuccess={() => {
            setBookingOpen(false);
            window.location.assign("/dashboard/orders");
          }}
        />
      );
    }

    return (
      <section className="mc-portal-content-card">
        <div className="mc-portal-page-heading">
          <span>KATALOG MAMRAS CLEAN</span>
          <h1>Layanan Kami</h1>
          <p>
            Pilih layanan kebersihan yang sesuai dengan kebutuhan rumah
            maupun tempat usaha Anda.
          </p>
        </div>

        {servicesLoading ? (
          <div className="mc-portal-empty">
            <LoaderCircle className="mc-portal-spinner" size={30} />
            <p>Memuat daftar layanan...</p>
          </div>
        ) : servicesError ? (
          <div className="mc-portal-notice error">
            <AlertCircle size={20} />
            {servicesError}
          </div>
        ) : services.length === 0 ? (
          <div className="mc-portal-empty">
            <Sparkles size={34} />
            <h3>Belum ada layanan tersedia</h3>
            <p>Silakan kembali beberapa saat lagi atau hubungi tim kami.</p>
          </div>
        ) : (
          <div className="mc-portal-service-grid">
            {services.map((service) => {
              const Icon = serviceIcons[service.icon] || Sparkles;

              return (
                <article className="mc-portal-service-card" key={service.id}>
                  <div className="mc-portal-service-icon">
                    <Icon size={27} />
                  </div>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                  <div className="mc-portal-service-price">
                    <span>Harga layanan</span>
                    <strong>
                      {service.price !== null && service.price !== undefined
                        ? new Intl.NumberFormat("id-ID", {
                            style: "currency",
                            currency: "IDR",
                            maximumFractionDigits: 0
                          }).format(Number(service.price))
                        : "Harga belum tersedia"}
                    </strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedServiceId(String(service.id));
                      setBookingOpen(true);
                    }}
                  >
                    Pesan Layanan <ArrowRight size={16} />
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </section>
    );
  }

  function renderOrders(isHistory) {
    return (
      <CustomerOrderList
        isHistory={isHistory}
        onCreateOrder={() => {
          window.location.assign("/dashboard/services");
        }}
      />
    );
  }

  function renderHelp() {
    return (
      <section className="mc-portal-content-card mc-portal-help-page">
        <div className="mc-portal-page-heading">
          <span>PUSAT BANTUAN MAMRAS CLEAN</span>
          <h1>Bagaimana Kami Bisa Membantu?</h1>
          <p>
            Temukan informasi kontak dan dapatkan bantuan dari tim Mamras Clean
            untuk kebutuhan layanan kebersihan Anda.
          </p>
        </div>

        <div className="mc-help-contact-layout">
          <div className="mc-help-main-card">
            <div className="mc-help-main-icon">
              <MessageCircle size={30} />
            </div>
            <span className="mc-help-eyebrow">LAYANAN KONSULTASI</span>
            <h2>Hubungi Tim Mamras Clean</h2>
            <p>
              Konsultasikan kebutuhan kebersihan Anda. Tim kami siap membantu
              memberikan informasi mengenai layanan dan pemesanan.
            </p>
            <button
              type="button"
              onClick={() =>
                handleWhatsApp("Halo Mamras Clean, saya ingin meminta bantuan.")
              }
            >
              <MessageCircle size={18} />
              Konsultasi via WhatsApp
            </button>
            <small>WhatsApp: 082188558026</small>
          </div>

          <div className="mc-help-contact-card">
            <h2>Informasi Kontak</h2>

            <div className="mc-help-contact-item">
              <span className="mc-help-contact-symbol">WA</span>
              <div>
                <small>Nomor WhatsApp</small>
                <strong>082188558026</strong>
              </div>
            </div>

            <div className="mc-help-contact-item">
              <span className="mc-help-contact-symbol">@</span>
              <div>
                <small>Email</small>
                <a href="mailto:mamrasclean@gmail.com">
                  mamrasclean@gmail.com
                </a>
              </div>
            </div>

            <div className="mc-help-contact-item">
              <span className="mc-help-contact-symbol">LOC</span>
              <div>
                <small>Lokasi Layanan</small>
                <strong>Kaimana, Papua Barat</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="mc-help-guide">
          <div className="mc-help-guide-heading">
            <span>PANDUAN PELANGGAN</span>
            <h2>Mulai Menggunakan Layanan</h2>
            <p>Ikuti langkah sederhana berikut untuk mendapatkan bantuan.</p>
          </div>

          <div className="mc-help-guide-grid">
            <article className="mc-help-guide-item">
              <span className="mc-help-guide-number">01</span>
              <h3>Pilih Layanan</h3>
              <p>
                Lihat katalog layanan dan tentukan kebutuhan kebersihan Anda.
              </p>
            </article>

            <article className="mc-help-guide-item">
              <span className="mc-help-guide-number">02</span>
              <h3>Konsultasi</h3>
              <p>
                Hubungi tim kami melalui WhatsApp untuk menanyakan detail layanan.
              </p>
            </article>

            <article className="mc-help-guide-item">
              <span className="mc-help-guide-number">03</span>
              <h3>Konfirmasi</h3>
              <p>
                Ikuti arahan tim Mamras Clean untuk informasi dan proses selanjutnya.
              </p>
            </article>
          </div>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <div className="mc-portal-loading">
        <LoaderCircle size={34} className="mc-portal-spinner" />
        <p>Menyiapkan area pelanggan...</p>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="mc-portal-loading">
        <AlertCircle size={35} />
        <h2>Area pelanggan tidak dapat dibuka</h2>
        <p>{error || "Data pelanggan tidak ditemukan."}</p>
        <a href="/">Kembali ke Beranda</a>
      </div>
    );
  }

  let pageTitle = "Dashboard";
  if (activePath === "/dashboard/services") pageTitle = "Layanan";
  if (activePath === "/dashboard/orders") pageTitle = "Pesanan Saya";
  if (activePath === "/dashboard/history") pageTitle = "Riwayat Pesanan";
  if (activePath === "/dashboard/help") pageTitle = "Bantuan";

  return (
    <div className="mc-portal">
      <header className="mc-portal-topbar">
        <a href="/dashboard" className="mc-portal-brand">
          <img
            src="/assets/logo.png"
            alt="Mamras Clean"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
          <span>MAMRAS <strong>CLEAN</strong></span>
        </a>

        <button
          type="button"
          className="mc-portal-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Tutup menu" : "Buka menu"}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <nav className={`mc-portal-nav ${mobileMenuOpen ? "is-open" : ""}`}>
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = activePath === item.path;

            return (
              <a
                key={item.path}
                href={item.path}
                className={active ? "active" : ""}
                aria-current={active ? "page" : undefined}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Icon size={17} />
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>

        <div className="mc-portal-header-actions">
          <button
            type="button"
            className="mc-portal-top-profile"
            onClick={() => {
              setMobileMenuOpen(false);
              setProfileOpen(true);
            }}
          >
            <span className="mc-portal-mini-avatar">
              <UserRound size={17} />
            </span>
            <span className="mc-portal-profile-name">{customer.name}</span>
          </button>

          <button
            type="button"
            className="mc-portal-logout"
            onClick={handleLogout}
            title="Keluar dari akun"
          >
            <LogOut size={17} />
            <span>Keluar</span>
          </button>
        </div>
      </header>

      <main className="mc-portal-page">
        <div className="mc-portal-current-page">
          <span>AREA PELANGGAN</span>
          <strong>{pageTitle}</strong>
        </div>

        <div
          key={`${activePath}-`}
          className="mc-portal-page-transition"
        >
          {activePath === "/dashboard" && renderDashboardHome()}
        {activePath === "/dashboard/services" && renderServices()}
        {activePath === "/dashboard/orders" && renderOrders(false)}
        {activePath === "/dashboard/history" && renderOrders(true)}
        {activePath === "/dashboard/help" && renderHelp()}
        </div>

        <footer className="mc-portal-footer">
          <Sparkles size={14} />
          Mamras Clean · Your Cleaning Solution
        </footer>
      </main>

      <CustomerProfileModal
        isOpen={profileOpen}
        onClose={() => setProfileOpen(false)}
      />
    </div>
  );
}

export default CustomerDashboard;





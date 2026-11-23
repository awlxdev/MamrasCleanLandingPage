import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  BriefcaseBusiness,
  Images,
  MessageSquare,
  ClipboardList,
  Globe,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Users,
  UserRound,
  CalendarDays,
  Clock3,
  ShieldCheck,
  ArrowUpRight
} from "lucide-react";
import "./AdminDashboard.css";
import ServiceManagement from "./ServiceManagement";
import GalleryManagement from "./GalleryManagement";
import MessageManagement from "./MessageManagement";
import ContentManagement from "./ContentManagement";
import SettingsManagement from "./SettingsManagement";
import OrderManagement from "./OrderManagement";
import UserManagement from "./UserManagement";

const navigation = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "services", label: "Layanan", icon: BriefcaseBusiness },
  { id: "users", label: "Manajemen Pengguna", icon: Users },
  { id: "orders", label: "Pesanan", icon: ClipboardList },
  { id: "gallery", label: "Galeri", icon: Images },
  { id: "messages", label: "Pesan", icon: MessageSquare },
  { id: "content", label: "Konten Website", icon: Globe },
  { id: "settings", label: "Pengaturan", icon: Settings }
];

const pageTitles = {
  dashboard: "Dashboard",
  services: "Layanan",
  users: "Manajemen Pengguna",
  orders: "Manajemen Pesanan",
  gallery: "Galeri Dokumentasi",
  messages: "Pesan Pelanggan",
  content: "Konten Website",
  settings: "Pengaturan"
};

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [error, setError] = useState("");
  const [dashboardStats, setDashboardStats] = useState(null);
  const [dashboardStatsLoading, setDashboardStatsLoading] = useState(false);
  const [dashboardStatsError, setDashboardStatsError] = useState("");

  useEffect(() => {
    let active = true;

    async function verifySession() {
      const token = sessionStorage.getItem("mamras_clean_admin_token");

      if (!token) {
        window.location.replace("/admin/login");
        return;
      }

      try {
        const response = await fetch("/api/admin/me", {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`
          }
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          sessionStorage.removeItem("mamras_clean_admin_token");
          sessionStorage.removeItem("mamras_clean_admin_user");
          window.location.replace("/admin/login");
          return;
        }

        if (active) {
          setUser(data.user);
          sessionStorage.setItem(
            "mamras_clean_admin_user",
            JSON.stringify(data.user)
          );
          setLoading(false);
        }
      } catch {
        if (active) {
          setError("Tidak dapat terhubung ke server. Periksa koneksi Laravel.");
          setLoading(false);
        }
      }
    }

    verifySession();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!user) return;

    let active = true;

    async function loadDashboardStats() {
      setDashboardStatsLoading(true);
      setDashboardStatsError("");

      const token = sessionStorage.getItem("mamras_clean_admin_token");

      const headers = {
        Accept: "application/json",
        Authorization: `Bearer ${token}`
      };

      try {
        const endpoints = [
          "/api/admin/services",
          "/api/admin/galleries",
          "/api/admin/messages",
          "/api/admin/site-content"
        ];

        const responses = await Promise.all(
          endpoints.map((endpoint) =>
            fetch(endpoint, { headers })
          )
        );

        const results = await Promise.all(
          responses.map(async (response) => {
            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
              throw new Error(
                data.message || "Gagal mengambil data dashboard."
              );
            }

            return data;
          })
        );

        const [services, galleries, messages, contents] = results;

        const serviceCount = Array.isArray(services.data)
          ? services.data.length
          : 0;

        const galleryCount = Array.isArray(galleries.data)
          ? galleries.data.length
          : 0;

        const messageCount = Number(messages.data?.total ?? 0);
        const unreadCount = Number(messages.unread_count ?? 0);

        const contentCount =
          contents.data && typeof contents.data === "object"
            ? Object.keys(contents.data).length
            : 0;

        if (active) {
          setDashboardStats({
            services: serviceCount,
            galleries: galleryCount,
            messages: messageCount,
            unreadMessages: unreadCount,
            contents: contentCount
          });
        }
      } catch (err) {
        if (active) {
          setDashboardStatsError(
            err.message || "Tidak dapat memuat statistik dashboard."
          );
        }
      } finally {
        if (active) {
          setDashboardStatsLoading(false);
        }
      }
    }

    loadDashboardStats();

    return () => {
      active = false;
    };
  }, [user]);
  async function handleLogout() {
    const token = sessionStorage.getItem("mamras_clean_admin_token");

    setLoggingOut(true);

    try {
      if (token) {
        await fetch("/api/admin/logout", {
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`
          }
        });
      }
    } catch {
      // Sesi lokal tetap dihapus jika server tidak dapat dihubungi.
    } finally {
      sessionStorage.removeItem("mamras_clean_admin_token");
      sessionStorage.removeItem("mamras_clean_admin_user");
      window.location.replace("/");
    }
  }

  if (loading) {
    return (
      <div className="admin-dashboard-loading">
        <div className="admin-dashboard-loader" />
        <p>Memverifikasi sesi administrator...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard-loading">
        <div className="admin-dashboard-error">
          <ShieldCheck size={30} />
          <h2>Koneksi bermasalah</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>
            Coba lagi
          </button>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const selectedPage = activeMenu === "dashboard";

  return (
    <div className="admin-dashboard">
      {sidebarOpen && (
        <button
          className="admin-dashboard-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-label="Tutup menu"
        />
      )}

      <aside className={`admin-dashboard-sidebar ${sidebarOpen ? "is-open" : ""}`}>
        <div className="admin-dashboard-brand">
          <img src="/assets/logo.png" alt="Mamras Clean" />
          <div>
            <strong>MAMRAS CLEAN</strong>
            <span>ADMIN PANEL</span>
          </div>
          <button
            className="admin-sidebar-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Tutup sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <div className="admin-sidebar-label">MENU UTAMA</div>

        <nav className="admin-dashboard-nav">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                className={`admin-nav-item ${activeMenu === item.id ? "active" : ""}`}
                onClick={() => {
                  setActiveMenu(item.id);
                  setSidebarOpen(false);
                }}
              >
                <Icon size={19} />
                <span>{item.label}</span>
                {activeMenu === item.id && (
                  <span className="admin-nav-indicator" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="admin-sidebar-bottom">
          <div className="admin-sidebar-security">
            <ShieldCheck size={19} />
            <div>
              <strong>Sistem Terlindungi</strong>
              <span>Akses administrator</span>
            </div>
          </div>

          <button
            className="admin-logout-button"
            onClick={handleLogout}
            disabled={loggingOut}
          >
            <LogOut size={18} />
            <span>{loggingOut ? "Keluar..." : "Keluar"}</span>
          </button>
        </div>
      </aside>

      <main className="admin-dashboard-main">
        <header className="admin-dashboard-header">
          <div className="admin-header-left">
            <button
              className="admin-mobile-menu"
              onClick={() => setSidebarOpen(true)}
              aria-label="Buka menu"
            >
              <Menu size={22} />
            </button>

            <div>
              <span className="admin-header-eyebrow">MAMRAS CLEAN</span>
              <h1>{pageTitles[activeMenu]}</h1>
            </div>
          </div>

          <div className="admin-header-right">
            <div className="admin-header-date">
              <CalendarDays size={16} />
              <span>
                {new Intl.DateTimeFormat("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric"
                }).format(new Date())}
              </span>
            </div>

            <div className="admin-header-divider" />

            <div className="admin-profile">
              <div className="admin-profile-avatar">
                <UserRound size={19} />
              </div>
              <div className="admin-profile-info">
                <strong>{user.name}</strong>
                <span>Administrator</span>
              </div>
            </div>
          </div>
        </header>

        <div className="admin-dashboard-content">
          <div key={activeMenu} className="admin-page-transition">
          {selectedPage ? (
            <>
              <section className="admin-welcome">
                <div>
                  <span className="admin-welcome-label">
                    PANEL ADMINISTRATOR
                  </span>
                  <h2>Selamat datang, {user.name}!</h2>
                  <p>
                    Kelola informasi dan aktivitas Mamras Clean
                    melalui panel administrasi.
                  </p>
                </div>

                <div className="admin-welcome-icon">
                  <ShieldCheck size={39} />
                </div>
              </section>

              <section className="admin-stats-grid">
                <StatCard
                  icon={BriefcaseBusiness}
                  label="Total Layanan"
                  value={dashboardStats ? dashboardStats.services : dashboardStatsError ? "!" : "..."}
                  note={dashboardStats ? "Data dari database" : dashboardStatsError ? "Gagal memuat data" : "Memuat data..."}
                  color="blue"
                />
                <StatCard
                  icon={Images}
                  label="Dokumentasi Galeri"
                  value={dashboardStats ? dashboardStats.galleries : dashboardStatsError ? "!" : "..."}
                  note={dashboardStats ? "Foto tersimpan" : dashboardStatsError ? "Gagal memuat data" : "Memuat data..."}
                  color="green"
                />
                <StatCard
                  icon={MessageSquare}
                  label="Pesan Pelanggan"
                  value={dashboardStats ? dashboardStats.messages : dashboardStatsError ? "!" : "..."}
                  note={dashboardStats ? `${dashboardStats.unreadMessages} pesan belum dibaca` : dashboardStatsError ? "Gagal memuat data" : "Memuat data..."}
                  color="orange"
                />
                <StatCard
                  icon={Globe}
                  label="Konten Website"
                  value={dashboardStats ? dashboardStats.contents : dashboardStatsError ? "!" : "..."}
                  note={dashboardStats ? "Entri konten tersimpan" : dashboardStatsError ? "Gagal memuat data" : "Memuat data..."}
                  color="purple"
                />
              </section>

              <section className="admin-dashboard-panels">
                <div className="admin-panel-card admin-activity-panel">
                  <div className="admin-panel-heading">
                    <div>
                      <h3>Aktivitas Sistem</h3>
                      <p>Ringkasan kondisi panel administrasi</p>
                    </div>
                    <span className="admin-panel-heading-icon">
                      <Clock3 size={18} />
                    </span>
                  </div>

                  <div className="admin-activity-item">
                    <span className="admin-activity-dot green" />
                    <div>
                      <strong>Autentikasi administrator aktif</strong>
                      <p>Akun berhasil diverifikasi oleh Laravel API.</p>
                    </div>
                    <span className="admin-activity-status">Aktif</span>
                  </div>

                  <div className="admin-activity-item">
                    <span className="admin-activity-dot blue" />
                    <div>
                      <strong>Koneksi backend tersedia</strong>
                      <p>API Mamras Clean dapat diakses melalui proxy.</p>
                    </div>
                    <span className="admin-activity-status">Terhubung</span>
                  </div>

                  <div className="admin-activity-item">
                    <span className="admin-activity-dot orange" />
                    <div>
                      <strong>Modul pengelolaan</strong>
                      <p>Menunggu pengembangan dan integrasi database.</p>
                    </div>
                    <span className="admin-activity-status pending">
                      Persiapan
                    </span>
                  </div>
                </div>

                <div className="admin-panel-card admin-account-panel">
                  <div className="admin-panel-heading">
                    <div>
                      <h3>Informasi Akun</h3>
                      <p>Administrator yang sedang masuk</p>
                    </div>
                    <span className="admin-panel-heading-icon">
                      <UserRound size={18} />
                    </span>
                  </div>

                  <div className="admin-account-avatar">
                    <UserRound size={28} />
                  </div>

                  <h4>{user.name}</h4>
                  <p className="admin-account-email">{user.email}</p>

                  <span className="admin-account-role">
                    <ShieldCheck size={14} />
                    {user.role}
                  </span>

                  <div className="admin-account-footer">
                    <span>Status sesi</span>
                    <strong>Terautentikasi</strong>
                  </div>
                </div>
              </section>

              <section className="admin-next-step">
                <div className="admin-next-step-icon">
                  <ArrowUpRight size={20} />
                </div>
                <div>
                  <strong>Langkah pengembangan berikutnya</strong>
                  <p>
                    Modul layanan akan menjadi tahap pertama
                    pengelolaan data website Mamras Clean.
                  </p>
                </div>
              </section>
            </>
          
) : activeMenu === "users" ? (
  <UserManagement />
) : activeMenu === "orders" ? (
  <OrderManagement />
) : activeMenu === "services" ? (
  <ServiceManagement />
) : activeMenu === "gallery" ? (
  <GalleryManagement />
) : activeMenu === "messages" ? (
  <MessageManagement />
) : activeMenu === "content" ? (
  <ContentManagement />
  ) : activeMenu === "settings" ? (
  <SettingsManagement
    user={user}
    onUserUpdated={(updatedUser) => {
      setUser(updatedUser);
      sessionStorage.setItem(
        "mamras_clean_admin_user",
        JSON.stringify(updatedUser)
      );
    }}
  />
) : (
  <section className="admin-module-placeholder">
    <div className="admin-placeholder-icon">
      {(() => {
        const Icon = navigation.find(
          (item) => item.id === activeMenu
        )?.icon || Settings;

        return <Icon size={30} />;
      })()}
    </div>

    <span>MODUL ADMINISTRATOR</span>
    <h2>{pageTitles[activeMenu]}</h2>

    <p>
      Modul ini belum diintegrasikan dengan database.
      Kita akan mengembangkannya secara bertahap.
    </p>

    <button onClick={() => setActiveMenu("dashboard")}>
      Kembali ke Dashboard
    </button>
  </section>
)}
        </div>

                  </div>
        <footer className="admin-dashboard-footer">
          <span>Â© {new Date().getFullYear()} Mamras Clean</span>
          <span>Admin Management System</span>
        </footer>
      </main>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, note, color }) {
  return (
    <article className="admin-stat-card">
      <div className={`admin-stat-icon ${color}`}>
        <Icon size={21} />
      </div>
      <span className="admin-stat-label">{label}</span>
      <strong className="admin-stat-value">{value}</strong>
      <span className="admin-stat-note">{note}</span>
    </article>
  );
}


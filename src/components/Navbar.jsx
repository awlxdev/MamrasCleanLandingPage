import { useEffect, useState } from "react";
import {
  Menu,
  X,
  Sparkles,
  UserRound,
  LogOut,
  ChevronDown,
  Home,
  Brush,
  Images,
  ClipboardList,
  MessageCircle
} from "lucide-react";

import AuthModal from "./AuthModal";
import CustomerProfileModal from "./CustomerProfileModal";
import "./NavbarProfile.css";
import "./NavbarPublic.css";

const links = [
  { label: "Beranda", href: "#beranda", icon: Home },
  { label: "Layanan", href: "#layanan", icon: Brush },
  { label: "Dokumentasi", href: "#dokumentasi", icon: Images },
  { label: "Cara Pesan", href: "#cara-pesan", icon: ClipboardList },
  { label: "Kontak", href: "#formulir-pesan", icon: MessageCircle }
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [customer, setCustomer] = useState(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeHash, setActiveHash] = useState(window.location.hash || "#beranda");

  const closeMenu = () => {
    setOpen(false);
    setAccountOpen(false);
  };

  useEffect(() => {
    function handleRequireAuth() {
      setAuthMode("login");
      setAuthOpen(true);
      closeMenu();
    }

    window.addEventListener("mamras:require-auth", handleRequireAuth);

    return () => {
      window.removeEventListener("mamras:require-auth", handleRequireAuth);
    };
  }, []);

  useEffect(() => {
    try {
      const savedUser = sessionStorage.getItem("mamras_clean_user");

      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);

        if (parsedUser.role === "user") {
          setCustomer(parsedUser);
        }
      }
    } catch {
      sessionStorage.removeItem("mamras_clean_user");
    }
  }, []);

  useEffect(() => {
    function updateHash() {
      setActiveHash(window.location.hash || "#beranda");
    }

    window.addEventListener("hashchange", updateHash);

    return () => window.removeEventListener("hashchange", updateHash);
  }, []);

  function openAuth(mode) {
    setAuthMode(mode);
    setAuthOpen(true);
    closeMenu();
  }

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
    } catch (error) {
      console.error("Logout API:", error);
    } finally {
      sessionStorage.removeItem("mamras_clean_user_token");
      sessionStorage.removeItem("mamras_clean_user");
      window.location.assign("/");
    }
  }

  return (
    <>
      <header className="navbar mc-public-navbar">
        <div className="container nav-inner mc-public-nav-inner">
          <a className="brand mc-public-brand" href="#beranda" onClick={closeMenu}>
            <img
              src="/assets/logo.png"
              alt="Logo Mamras Clean"
              className="brand-logo"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />

            <span className="brand-fallback">
              <Sparkles size={24} />
            </span>

            <span className="brand-name">
              MAMRAS <strong>CLEAN</strong>
              <small>YOUR CLEANING SOLUTION</small>
            </span>
          </a>

          <button
            type="button"
            className="menu-toggle mc-public-menu-toggle"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Tutup menu" : "Buka menu"}
            aria-expanded={open}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>

          <nav className={`nav-links mc-public-nav-links ${open ? "nav-open" : ""}`}>
            {links.map((link) => {
              const Icon = link.icon;
              const active = activeHash === link.href;

              return (
                <a
                  key={link.href}
                  href={link.href}
                  className={active ? "active" : ""}
                  aria-current={active ? "location" : undefined}
                  onClick={() => {
                    setActiveHash(link.href);
                    closeMenu();
                  }}
                >
                  <Icon size={17} />
                  <span>{link.label}</span>
                </a>
              );
            })}

            {customer ? (
              <button
                type="button"
                className="nav-mobile-auth nav-mobile-login"
                onClick={handleLogout}
              >
                Keluar
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="nav-mobile-auth nav-mobile-login"
                  onClick={() => openAuth("login")}
                >
                  Masuk
                </button>

                <button
                  type="button"
                  className="nav-mobile-auth nav-mobile-register"
                  onClick={() => openAuth("register")}
                >
                  Daftar
                </button>
              </>
            )}
          </nav>

          <div className="nav-auth-actions mc-public-account-actions">
            {customer ? (
              <div className="mc-account-wrapper">
                <button
                  type="button"
                  className="mc-account-button"
                  onClick={() => setAccountOpen(!accountOpen)}
                  aria-expanded={accountOpen}
                >
                  <span className="mc-account-avatar">
                    <UserRound size={18} />
                  </span>

                  <span className="mc-account-name">{customer.name}</span>

                  <ChevronDown size={16} />
                </button>

                {accountOpen && (
                  <div className="mc-account-dropdown">
                    <a
                      href="/dashboard"
                      onClick={() => setAccountOpen(false)}
                    >
                      <Home size={17} />
                      Dashboard
                    </a>

                    <button
                      type="button"
                      onClick={() => {
                        setAccountOpen(false);
                        setProfileOpen(true);
                      }}
                    >
                      <UserRound size={17} />
                      Profil Saya
                    </button>

                    <button type="button" onClick={handleLogout}>
                      <LogOut size={17} />
                      Keluar
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button
                  type="button"
                  className="button nav-login"
                  onClick={() => openAuth("login")}
                >
                  Masuk
                </button>

                <button
                  type="button"
                  className="button button-green nav-register"
                  onClick={() => openAuth("register")}
                >
                  Daftar
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <AuthModal
        isOpen={authOpen}
        initialMode={authMode}
        onClose={() => setAuthOpen(false)}
      />

      <CustomerProfileModal
        isOpen={profileOpen}
        onClose={() => setProfileOpen(false)}
      />
    </>
  );
}
import { useEffect, useState } from "react";
import {
  UserRound,
  Mail,
  Phone,
  MapPin,
  ArrowLeft,
  Save,
  LogOut,
  LoaderCircle,
  CheckCircle2,
  AlertCircle,
  Sparkles
} from "lucide-react";

import "./CustomerProfile.css";

export default function CustomerProfile() {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    whatsapp: "",
    address: ""
  });

  useEffect(() => {
    const savedToken = sessionStorage.getItem("mamras_clean_user_token");

    if (!savedToken) {
      setError("Silakan masuk terlebih dahulu untuk melihat profil Anda.");
      setLoading(false);
      return;
    }

    setToken(savedToken);

    async function loadProfile() {
      try {
        const response = await fetch("/api/auth/me", {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${savedToken}`
          }
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            data.message || "Tidak dapat mengambil data profil."
          );
        }

        if (!data.user || data.user.role !== "user") {
          throw new Error("Akun ini tidak memiliki akses profil pelanggan.");
        }

        setForm({
          name: data.user.name || "",
          email: data.user.email || "",
          whatsapp: data.user.whatsapp || "",
          address: data.user.address || ""
        });

        sessionStorage.setItem(
          "mamras_clean_user",
          JSON.stringify(data.user)
        );
      } catch (err) {
        setError(err.message || "Terjadi kesalahan saat mengambil profil.");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value
    }));

    setSuccess("");
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!token) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const validationError = Object.values(data.errors || {})
          .flat()
          .find(Boolean);

        throw new Error(
          validationError ||
          data.message ||
          "Profil gagal diperbarui."
        );
      }

      setForm({
        name: data.user.name || "",
        email: data.user.email || "",
        whatsapp: data.user.whatsapp || "",
        address: data.user.address || ""
      });

      sessionStorage.setItem(
        "mamras_clean_user",
        JSON.stringify(data.user)
      );

      setSuccess(data.message || "Profil berhasil diperbarui.");
    } catch (err) {
      setError(err.message || "Terjadi kesalahan.");
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
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

  if (loading) {
    return (
      <div className="mc-profile-loading">
        <LoaderCircle className="mc-profile-spinner" size={32} />
        <p>Memuat profil Anda...</p>
      </div>
    );
  }

  if (!token || error && !form.email) {
    return (
      <div className="mc-profile-page">
        <div className="mc-profile-message">
          <AlertCircle size={35} />
          <h2>Profil tidak dapat dibuka</h2>
          <p>{error}</p>
          <a href="/" className="mc-profile-primary-link">
            <ArrowLeft size={17} />
            Kembali ke Beranda
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="mc-profile-page">
      <header className="mc-profile-topbar">
        <a href="/" className="mc-profile-brand">
          <img
            src="/assets/logo.png"
            alt="Mamras Clean"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
          <span>MAMRAS <strong>CLEAN</strong></span>
        </a>

        <a href="/" className="mc-profile-back">
          <ArrowLeft size={17} />
          Beranda
        </a>
      </header>

      <main className="mc-profile-main">
        <div className="mc-profile-heading">
          <span className="mc-profile-eyebrow">
            <Sparkles size={15} />
            AREA PELANGGAN
          </span>

          <h1>Profil Saya</h1>
          <p>
            Kelola informasi akun dan data kontak Anda di Mamras Clean.
          </p>
        </div>

        <div className="mc-profile-layout">
          <aside className="mc-profile-sidebar">
            <div className="mc-profile-avatar">
              <UserRound size={38} />
            </div>

            <h2>{form.name || "Pelanggan"}</h2>
            <p>{form.email}</p>

            <div className="mc-profile-status">
              <CheckCircle2 size={16} />
              Akun Pelanggan
            </div>

            <button
              type="button"
              className="mc-profile-logout"
              onClick={handleLogout}
            >
              <LogOut size={17} />
              Keluar dari Akun
            </button>
          </aside>

          <section className="mc-profile-card">
            <div className="mc-profile-card-heading">
              <div>
                <h2>Informasi Pribadi</h2>
                <p>Pastikan informasi Anda selalu terbaru.</p>
              </div>

              <span className="mc-profile-edit-icon">
                <UserRound size={20} />
              </span>
            </div>

            {error && (
              <div className="mc-profile-alert mc-profile-alert-error">
                <AlertCircle size={17} />
                {error}
              </div>
            )}

            {success && (
              <div className="mc-profile-alert mc-profile-alert-success">
                <CheckCircle2 size={17} />
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mc-profile-field">
                <label htmlFor="profile-name">Nama lengkap</label>
                <div className="mc-profile-input-wrap">
                  <UserRound size={18} />
                  <input
                    id="profile-name"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    maxLength={255}
                    required
                  />
                </div>
              </div>

              <div className="mc-profile-field">
                <label htmlFor="profile-email">Email</label>
                <div className="mc-profile-input-wrap">
                  <Mail size={18} />
                  <input
                    id="profile-email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    maxLength={255}
                    required
                  />
                </div>
              </div>

              <div className="mc-profile-field">
                <label htmlFor="profile-whatsapp">Nomor WhatsApp</label>
                <div className="mc-profile-input-wrap">
                  <Phone size={18} />
                  <input
                    id="profile-whatsapp"
                    name="whatsapp"
                    type="tel"
                    value={form.whatsapp}
                    onChange={handleChange}
                    maxLength={20}
                    required
                  />
                </div>
              </div>

              <div className="mc-profile-field">
                <label htmlFor="profile-address">Alamat</label>
                <div className="mc-profile-input-wrap mc-profile-textarea-wrap">
                  <MapPin size={18} />
                  <textarea
                    id="profile-address"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    maxLength={1000}
                    rows={4}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="mc-profile-save"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <LoaderCircle className="mc-profile-spinner" size={18} />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Simpan Perubahan
                  </>
                )}
              </button>
            </form>
          </section>
        </div>

        <p className="mc-profile-footer">
          <Sparkles size={14} />
          Terima kasih telah mempercayakan kebersihan Anda kepada Mamras Clean.
        </p>
      </main>
    </div>
  );
}
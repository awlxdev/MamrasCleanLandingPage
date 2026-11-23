import { useEffect, useState } from "react";
import {
  X, Mail, LockKeyhole, UserRound, Phone, MapPin, Eye, EyeOff,
  LoaderCircle, ArrowRight, Sparkles
} from "lucide-react";
import "./AuthModal.css";

export default function AuthModal({ isOpen, initialMode = "login", onClose }) {
  const [mode, setMode] = useState(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    setMode(initialMode);
    setError("");
    setSuccess("");
    setName("");
    setEmail("");
    setWhatsapp("");
    setAddress("");
    setPassword("");
    setPasswordConfirmation("");
    setShowPassword(false);

    const handleEscape = (event) => {
      if (event.key === "Escape" && !loading) onClose();
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, initialMode, onClose]);

  function changeMode(nextMode) {
    setMode(nextMode);
    setError("");
    setSuccess("");
    setPassword("");
    setPasswordConfirmation("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const endpoint = mode === "login"
        ? "/api/auth/login"
        : "/api/auth/register";

      const payload = mode === "login"
        ? { email, password }
        : {
            name,
            email,
            whatsapp,
            address,
            password,
            password_confirmation: passwordConfirmation
          };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const validationError = Object.values(data.errors || {})
          .flat()
          .find(Boolean);

        throw new Error(
          validationError ||
          data.message ||
          "Permintaan tidak berhasil. Silakan coba kembali."
        );
      }

      if (!data.token || !data.user) {
        throw new Error("Data autentikasi dari server tidak lengkap.");
      }

      if (data.user.role === "admin") {
        sessionStorage.setItem("mamras_clean_admin_token", data.token);
        sessionStorage.setItem(
          "mamras_clean_admin_user",
          JSON.stringify(data.user)
        );

        window.location.assign("/admin/dashboard");
        return;
      }

      sessionStorage.setItem("mamras_clean_user_token", data.token);
      sessionStorage.setItem(
        "mamras_clean_user",
        JSON.stringify(data.user)
      );

      setSuccess(
        mode === "register"
          ? "Pendaftaran berhasil. Selamat datang di Mamras Clean!"
          : "Login berhasil. Selamat datang kembali!"
      );

      window.setTimeout(() => {
        window.location.assign("/dashboard");
      }, 900);
    } catch (err) {
      setError(err.message || "Terjadi kesalahan. Silakan coba kembali.");
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div
      className="mc-auth-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) onClose();
      }}
    >
      <section
        className="mc-auth-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mc-auth-title"
      >
        <button
          type="button"
          className="mc-auth-close"
          onClick={onClose}
          disabled={loading}
          aria-label="Tutup modal"
        >
          <X size={21} />
        </button>

        <div className="mc-auth-brand">
          <img src="/assets/logo.png" alt="Mamras Clean" />
          <span>MAMRAS <strong>CLEAN</strong></span>
          <small>YOUR CLEANING SOLUTION</small>
        </div>

        <div className="mc-auth-heading">
          <span className="mc-auth-eyebrow">
            {mode === "login" ? "SELAMAT DATANG KEMBALI" : "BERGABUNG BERSAMA KAMI"}
          </span>

          <h2 id="mc-auth-title">
            {mode === "login" ? "Masuk ke akun Anda" : "Buat akun baru"}
          </h2>

          <p>
            {mode === "login"
              ? "Masuk untuk melanjutkan bersama Mamras Clean."
              : "Daftar dan nikmati kemudahan layanan Mamras Clean."}
          </p>
        </div>

        <div className="mc-auth-tabs">
          <button
            type="button"
            className={mode === "login" ? "active" : ""}
            onClick={() => changeMode("login")}
          >
            Masuk
          </button>
          <button
            type="button"
            className={mode === "register" ? "active" : ""}
            onClick={() => changeMode("register")}
          >
            Daftar
          </button>
        </div>

        <form className="mc-auth-form" onSubmit={handleSubmit}>
          {mode === "register" && (
            <div className="mc-auth-field">
              <label htmlFor="mc-auth-name">Nama lengkap</label>
              <div className="mc-auth-input">
                <UserRound size={18} />
                <input
                  id="mc-auth-name"
                  type="text"
                  placeholder="Masukkan nama lengkap"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  autoComplete="name"
                  maxLength={255}
                  required
                />
              </div>
            </div>
          )}

          <div className="mc-auth-field">
            <label htmlFor="mc-auth-email">Email</label>
            <div className="mc-auth-input">
              <Mail size={18} />
              <input
                id="mc-auth-email"
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />
            </div>
          </div>

          {mode === "register" && (
            <>
              <div className="mc-auth-field">
                <label htmlFor="mc-auth-whatsapp">Nomor WhatsApp</label>
                <div className="mc-auth-input">
                  <Phone size={18} />
                  <input
                    id="mc-auth-whatsapp"
                    type="tel"
                    placeholder="Contoh: 082188558026"
                    value={whatsapp}
                    onChange={(event) => setWhatsapp(event.target.value)}
                    autoComplete="tel"
                    maxLength={20}
                    required
                  />
                </div>
              </div>

              <div className="mc-auth-field">
                <label htmlFor="mc-auth-address">Alamat</label>
                <div className="mc-auth-input mc-auth-textarea">
                  <MapPin size={18} />
                  <textarea
                    id="mc-auth-address"
                    placeholder="Masukkan alamat lengkap Anda"
                    value={address}
                    onChange={(event) => setAddress(event.target.value)}
                    autoComplete="street-address"
                    maxLength={1000}
                    rows={3}
                    required
                  />
                </div>
              </div>
            </>
          )}

          <div className="mc-auth-field">
            <label htmlFor="mc-auth-password">Password</label>
            <div className="mc-auth-input">
              <LockKeyhole size={18} />
              <input
                id="mc-auth-password"
                type={showPassword ? "text" : "password"}
                placeholder="Minimal 8 karakter"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                minLength={8}
                required
              />
              <button
                type="button"
                className="mc-auth-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {mode === "register" && (
            <div className="mc-auth-field">
              <label htmlFor="mc-auth-confirm">Konfirmasi password</label>
              <div className="mc-auth-input">
                <LockKeyhole size={18} />
                <input
                  id="mc-auth-confirm"
                  type={showPassword ? "text" : "password"}
                  placeholder="Ulangi password"
                  value={passwordConfirmation}
                  onChange={(event) => setPasswordConfirmation(event.target.value)}
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </div>
            </div>
          )}

          {error && <div className="mc-auth-error" role="alert">{error}</div>}
          {success && <div className="mc-auth-success" role="status">{success}</div>}

          <button
            type="submit"
            className="mc-auth-submit"
            disabled={loading || Boolean(success)}
          >
            {loading ? (
              <>
                <LoaderCircle size={19} className="mc-auth-spinner" />
                Memproses...
              </>
            ) : (
              <>
                {mode === "login" ? "Masuk Sekarang" : "Buat Akun"}
                <ArrowRight size={19} />
              </>
            )}
          </button>
        </form>

        <p className="mc-auth-switch">
          {mode === "login" ? "Belum memiliki akun?" : "Sudah memiliki akun?"}
          <button
            type="button"
            onClick={() => changeMode(mode === "login" ? "register" : "login")}
          >
            {mode === "login" ? "Daftar sekarang" : "Masuk di sini"}
          </button>
        </p>

        <div className="mc-auth-security">
          <Sparkles size={15} />
          <span>Akun Anda dilindungi oleh sistem autentikasi Mamras Clean.</span>
        </div>
      </section>
    </div>
  );
}


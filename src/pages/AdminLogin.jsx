import { useState } from "react";
import {
  Eye,
  EyeOff,
  ShieldCheck,
  LockKeyhole,
  Mail,
  LoaderCircle,
  CheckCircle2
} from "lucide-react";
import "./AdminLogin.css";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [authenticatedUser, setAuthenticatedUser] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setAuthenticatedUser(null);
    setLoading(true);

    try {
      const loginResponse = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({
          email,
          password
        })
      });

      const loginData = await loginResponse.json().catch(() => ({}));

      if (!loginResponse.ok) {
        throw new Error(
          loginData.errors?.email?.[0] ||
          loginData.message ||
          "Email atau password tidak valid."
        );
      }

      if (!loginData.token) {
        throw new Error("Token autentikasi tidak diterima.");
      }

      sessionStorage.setItem(
        "mamras_clean_admin_token",
        loginData.token
      );

      const profileResponse = await fetch("/api/admin/me", {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${loginData.token}`
        }
      });

      const profileData = await profileResponse.json().catch(() => ({}));

      if (!profileResponse.ok) {
        sessionStorage.removeItem("mamras_clean_admin_token");
        throw new Error("Token diterima, tetapi verifikasi akun gagal.");
      }

      sessionStorage.setItem(
        "mamras_clean_admin_user",
        JSON.stringify(profileData.user)
      );

    window.location.assign("/admin/dashboard");
    } catch (err) {
      setError(err.message || "Terjadi kesalahan. Silakan coba kembali.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-shell">
        <section className="admin-login-brand">
          <div className="admin-brand-content">
            <img
              src="/assets/logo.png"
              alt="Mamras Clean"
              className="admin-brand-logo"
            />

            <span className="admin-brand-label">
              MAMRAS CLEAN MANAGEMENT
            </span>

            <h1>
              Kelola layanan
              <br />
              kebersihan dengan
              <br />
              lebih mudah.
            </h1>

            <p>
              Panel administrator Mamras Clean untuk mengelola
              informasi dan kebutuhan operasional layanan.
            </p>

            <div className="admin-brand-security">
              <ShieldCheck size={19} />
              <span>Akses khusus administrator</span>
            </div>
          </div>

          <div className="admin-brand-decoration admin-decoration-one" />
          <div className="admin-brand-decoration admin-decoration-two" />

          <span className="admin-brand-footer">
            BERSIH • NYAMAN • TERPERCAYA
          </span>
        </section>

        <section className="admin-login-form-section">
          <div className="admin-login-form-wrapper">
            <div className="admin-login-mobile-logo">
              <img src="/assets/logo.png" alt="Mamras Clean" />
            </div>

            <div className="admin-login-heading">
              <span className="admin-login-eyebrow">
                ADMINISTRATOR
              </span>

              <h2>Selamat datang</h2>

              <p>
                Masuk menggunakan akun administrator Mamras Clean.
              </p>
            </div>

            {authenticatedUser ? (
              <div className="admin-login-success">
                <div className="admin-success-icon">
                  <CheckCircle2 size={34} />
                </div>

                <h3>Login berhasil!</h3>

                <p>
                  Autentikasi administrator dan verifikasi token
                  berhasil dilakukan.
                </p>

                <div className="admin-success-user">
                  <span>Nama administrator</span>
                  <strong>{authenticatedUser.name}</strong>

                  <span>Email</span>
                  <strong>{authenticatedUser.email}</strong>

                  <span>Role</span>
                  <strong>{authenticatedUser.role}</strong>
                </div>

                <div className="admin-success-note">
                  Dashboard siap dikembangkan pada tahap berikutnya.
                </div>
              </div>
            ) : (
              <form
                className="admin-login-form"
                onSubmit={handleSubmit}
              >
                <div className="admin-form-field">
                  <label htmlFor="admin-email">
                    Email administrator
                  </label>

                  <div className="admin-input-wrapper">
                    <Mail size={19} />

                    <input
                      id="admin-email"
                      type="email"
                      placeholder="nama@email.com"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      autoComplete="username"
                      required
                    />
                  </div>
                </div>

                <div className="admin-form-field">
                  <label htmlFor="admin-password">
                    Password
                  </label>

                  <div className="admin-input-wrapper">
                    <LockKeyhole size={19} />

                    <input
                      id="admin-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Masukkan password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      autoComplete="current-password"
                      required
                    />

                    <button
                      type="button"
                      className="admin-password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={
                        showPassword
                          ? "Sembunyikan password"
                          : "Tampilkan password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff size={19} />
                      ) : (
                        <Eye size={19} />
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="admin-login-error" role="alert">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="admin-login-button"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <LoaderCircle size={19} className="admin-spinner" />
                      Memverifikasi...
                    </>
                  ) : (
                    <>
                      Masuk ke Panel Admin
                      <span>→</span>
                    </>
                  )}
                </button>
              </form>
            )}

            <div className="admin-login-bottom">
              <ShieldCheck size={16} />
              <span>
                Halaman ini hanya untuk administrator yang berwenang.
              </span>
            </div>
          </div>
        </section>
      </div>

      <p className="admin-login-copyright">
        © {new Date().getFullYear()} Mamras Clean. All rights reserved.
      </p>
    </div>
  );
}

import { useEffect, useState } from "react";
import {
  UserRound,
  Mail,
  ShieldCheck,
  LockKeyhole,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  KeyRound
} from "lucide-react";
import "./SettingsManagement.css";

export default function SettingsManagement({ user, onUserUpdated }) {
  const [profile, setProfile] = useState({
    name: user?.name || "",
    email: user?.email || ""
  });

  const [password, setPassword] = useState({
    current_password: "",
    password: "",
    password_confirmation: ""
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  const [alert, setAlert] = useState({
    type: "",
    message: ""
  });

  useEffect(() => {
    setProfile({
      name: user?.name || "",
      email: user?.email || ""
    });
  }, [user]);

  function getToken() {
    return sessionStorage.getItem("mamras_clean_admin_token");
  }

  async function parseResponse(response) {
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const validationMessage = data.errors
        ? Object.values(data.errors).flat().join(" ")
        : "";

      throw new Error(
        validationMessage ||
        data.message ||
        "Permintaan tidak dapat diproses."
      );
    }

    return data;
  }

  async function handleProfileSubmit(event) {
    event.preventDefault();
    setAlert({ type: "", message: "" });
    setSavingProfile(true);

    try {
      const response = await fetch("/api/admin/settings/profile", {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify(profile)
      });

      const data = await parseResponse(response);

      if (data.user) {
        onUserUpdated?.(data.user);
        setProfile({
          name: data.user.name,
          email: data.user.email
        });
      }

      setAlert({
        type: "success",
        message: data.message || "Profil berhasil diperbarui."
      });
    } catch (error) {
      setAlert({
        type: "error",
        message: error.message
      });
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault();
    setAlert({ type: "", message: "" });

    if (password.password !== password.password_confirmation) {
      setAlert({
        type: "error",
        message: "Konfirmasi kata sandi baru tidak sama."
      });
      return;
    }

    setSavingPassword(true);

    try {
      const response = await fetch("/api/admin/settings/password", {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify(password)
      });

      const data = await parseResponse(response);

      setPassword({
        current_password: "",
        password: "",
        password_confirmation: ""
      });

      setAlert({
        type: "success",
        message: data.message || "Kata sandi berhasil diperbarui."
      });
    } catch (error) {
      setAlert({
        type: "error",
        message: error.message
      });
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <section className="settings-management">
      <div className="settings-page-heading">
        <div>
          <span className="settings-eyebrow">ADMINISTRATOR</span>
          <h2>Pengaturan Akun</h2>
          <p>
            Kelola informasi profil dan keamanan akun administrator
            Mamras Clean.
          </p>
        </div>
        <div className="settings-heading-icon">
          <ShieldCheck size={25} />
        </div>
      </div>

      {alert.message && (
        <div className={`settings-alert ${alert.type}`}>
          {alert.type === "success"
            ? <CheckCircle2 size={19} />
            : <AlertCircle size={19} />}
          <span>{alert.message}</span>
        </div>
      )}

      <div className="settings-layout">
        <div className="settings-main-column">
          <form className="settings-card" onSubmit={handleProfileSubmit}>
            <div className="settings-card-heading">
              <div className="settings-card-icon">
                <UserRound size={21} />
              </div>
              <div>
                <h3>Profil Administrator</h3>
                <p>Perbarui nama dan alamat email akun Anda.</p>
              </div>
            </div>

            <div className="settings-form-grid">
              <label className="settings-field">
                <span>Nama Lengkap</span>
                <div className="settings-input-wrap">
                  <UserRound size={18} />
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(event) =>
                      setProfile({ ...profile, name: event.target.value })
                    }
                    placeholder="Nama administrator"
                    maxLength={255}
                    required
                  />
                </div>
              </label>

              <label className="settings-field">
                <span>Alamat Email</span>
                <div className="settings-input-wrap">
                  <Mail size={18} />
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(event) =>
                      setProfile({ ...profile, email: event.target.value })
                    }
                    placeholder="admin@example.com"
                    maxLength={255}
                    required
                  />
                </div>
              </label>
            </div>

            <div className="settings-form-footer">
              <span>Pastikan alamat email yang digunakan masih aktif.</span>
              <button type="submit" disabled={savingProfile}>
                <Save size={17} />
                {savingProfile ? "Menyimpan..." : "Simpan Profil"}
              </button>
            </div>
          </form>

          <form className="settings-card" onSubmit={handlePasswordSubmit}>
            <div className="settings-card-heading">
              <div className="settings-card-icon security">
                <LockKeyhole size={21} />
              </div>
              <div>
                <h3>Keamanan Akun</h3>
                <p>Gunakan kata sandi yang kuat untuk melindungi akun.</p>
              </div>
            </div>

            <label className="settings-field">
              <span>Kata Sandi Saat Ini</span>
              <div className="settings-input-wrap">
                <KeyRound size={18} />
                <input
                  type={showPasswords ? "text" : "password"}
                  value={password.current_password}
                  onChange={(event) =>
                    setPassword({
                      ...password,
                      current_password: event.target.value
                    })
                  }
                  placeholder="Masukkan kata sandi saat ini"
                  autoComplete="current-password"
                  required
                />
              </div>
            </label>

            <div className="settings-form-grid">
              <label className="settings-field">
                <span>Kata Sandi Baru</span>
                <div className="settings-input-wrap">
                  <LockKeyhole size={18} />
                  <input
                    type={showPasswords ? "text" : "password"}
                    value={password.password}
                    onChange={(event) =>
                      setPassword({
                        ...password,
                        password: event.target.value
                      })
                    }
                    placeholder="Minimal 8 karakter"
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />
                </div>
              </label>

              <label className="settings-field">
                <span>Konfirmasi Kata Sandi Baru</span>
                <div className="settings-input-wrap">
                  <LockKeyhole size={18} />
                  <input
                    type={showPasswords ? "text" : "password"}
                    value={password.password_confirmation}
                    onChange={(event) =>
                      setPassword({
                        ...password,
                        password_confirmation: event.target.value
                      })
                    }
                    placeholder="Ulangi kata sandi baru"
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />
                </div>
              </label>
            </div>

            <button
              type="button"
              className="settings-password-toggle"
              onClick={() => setShowPasswords(!showPasswords)}
            >
              {showPasswords ? <EyeOff size={16} /> : <Eye size={16} />}
              {showPasswords ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
            </button>

            <div className="settings-form-footer">
              <span>Kata sandi minimal terdiri dari 8 karakter.</span>
              <button type="submit" disabled={savingPassword}>
                <LockKeyhole size={17} />
                {savingPassword ? "Memproses..." : "Perbarui Kata Sandi"}
              </button>
            </div>
          </form>
        </div>

        <aside className="settings-side-column">
          <div className="settings-account-card">
            <div className="settings-avatar">
              <UserRound size={30} />
            </div>
            <span className="settings-account-label">AKUN AKTIF</span>
            <h3>{user?.name || "Administrator"}</h3>
            <p>{user?.email || "-"}</p>
            <div className="settings-role">
              <ShieldCheck size={16} />
              {user?.role || "admin"}
            </div>
          </div>

          <div className="settings-security-note">
            <ShieldCheck size={21} />
            <h4>Keamanan Administrator</h4>
            <p>
              Jangan membagikan kata sandi kepada orang lain.
              Selalu keluar dari dashboard setelah selesai mengelola website
              melalui tombol Keluar.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}
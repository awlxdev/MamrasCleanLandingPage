import { useEffect, useState } from "react";
import {
  UserRound,
  Mail,
  Phone,
  MapPin,
  Save,
  Pencil,
  LoaderCircle,
  CheckCircle2,
  AlertCircle,
  X
} from "lucide-react";

import "./CustomerProfileModal.css";

const emptyForm = {
  name: "",
  email: "",
  whatsapp: "",
  address: ""
};

export default function CustomerProfileModal({ isOpen, onClose }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [token, setToken] = useState("");
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState(emptyForm);
  const [originalForm, setOriginalForm] = useState(emptyForm);

  useEffect(() => {
    if (!isOpen) return;

    const savedToken = sessionStorage.getItem("mamras_clean_user_token");

    setEditing(false);
    setError("");
    setSuccess("");
    setLoading(true);

    if (!savedToken) {
      setToken("");
      setError("Silakan masuk terlebih dahulu.");
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
          throw new Error(data.message || "Gagal mengambil data profil.");
        }

        if (!data.user || data.user.role !== "user") {
          throw new Error("Akun ini tidak memiliki akses profil pelanggan.");
        }

        const profile = {
          name: data.user.name || "",
          email: data.user.email || "",
          whatsapp: data.user.whatsapp || "",
          address: data.user.address || ""
        };

        setForm(profile);
        setOriginalForm(profile);

        sessionStorage.setItem(
          "mamras_clean_user",
          JSON.stringify(data.user)
        );
      } catch (err) {
        setError(err.message || "Terjadi kesalahan.");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    function handleEscape(event) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleEscape);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm(previous => ({
      ...previous,
      [name]: value
    }));

    setError("");
    setSuccess("");
  }

  function handleEdit() {
    setEditing(true);
    setError("");
    setSuccess("");
  }

  function handleCancelEdit() {
    setForm(originalForm);
    setEditing(false);
    setError("");
    setSuccess("");
  }

  async function handleSubmit(event) {
    event?.preventDefault?.();

    if (!token || !editing) return;

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
          validationError || data.message || "Profil gagal diperbarui."
        );
      }

      if (!data.user) {
        throw new Error("Respons profil dari server tidak valid.");
      }

      const updatedProfile = {
        name: data.user.name || "",
        email: data.user.email || "",
        whatsapp: data.user.whatsapp || "",
        address: data.user.address || ""
      };

      setForm(updatedProfile);
      setOriginalForm(updatedProfile);
      setEditing(false);

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

  if (!isOpen) return null;

  const fieldDisabled = !editing || saving;

  return (
    <div
      className="mc-profile-modal-overlay"
      onMouseDown={event => {
        if (event.target === event.currentTarget && !saving) onClose();
      }}
    >
      <section
        className="mc-profile-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mc-profile-modal-title"
      >
        <header className="mc-profile-modal-header">
          <div>
            <span>AREA PELANGGAN</span>
            <h2 id="mc-profile-modal-title">Profil Saya</h2>
            <p>Informasi akun pelanggan Mamras Clean.</p>
          </div>

          <button
            type="button"
            className="mc-profile-modal-close"
            onClick={onClose}
            aria-label="Tutup profil"
            disabled={saving}
          >
            <X size={21} />
          </button>
        </header>

        <div className="mc-profile-modal-body">
          {loading ? (
            <div className="mc-profile-modal-loading">
              <LoaderCircle className="mc-profile-modal-spinner" size={32} />
              <p>Mengambil data profil dari database...</p>
            </div>
          ) : (
            <>
              <div className="mc-profile-modal-avatar">
                <UserRound size={30} />
                <div>
                  <strong>{form.name || "Pelanggan"}</strong>
                  <span>{form.email}</span>
                </div>
              </div>

              {error && (
                <div className="mc-profile-modal-alert error">
                  <AlertCircle size={17} />
                  {error}
                </div>
              )}

              {success && (
                <div className="mc-profile-modal-alert success">
                  <CheckCircle2 size={17} />
                  {success}
                </div>
              )}

              <div className="mc-profile-modal-form">
                <div className="mc-profile-modal-field">
                  <label htmlFor="mc-modal-name">Nama lengkap</label>
                  <div className={fieldDisabled ? "is-readonly" : ""}>
                    <UserRound size={18} />
                    <input
                      id="mc-modal-name"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      maxLength={255}
                      required
                      disabled={fieldDisabled}
                    />
                  </div>
                </div>

                <div className="mc-profile-modal-field">
                  <label htmlFor="mc-modal-email">Email</label>
                  <div className={fieldDisabled ? "is-readonly" : ""}>
                    <Mail size={18} />
                    <input
                      id="mc-modal-email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      maxLength={255}
                      required
                      disabled={fieldDisabled}
                    />
                  </div>
                </div>

                <div className="mc-profile-modal-field">
                  <label htmlFor="mc-modal-whatsapp">Nomor WhatsApp</label>
                  <div className={fieldDisabled ? "is-readonly" : ""}>
                    <Phone size={18} />
                    <input
                      id="mc-modal-whatsapp"
                      name="whatsapp"
                      type="tel"
                      value={form.whatsapp}
                      onChange={handleChange}
                      maxLength={20}
                      required
                      disabled={fieldDisabled}
                    />
                  </div>
                </div>

                <div className="mc-profile-modal-field">
                  <label htmlFor="mc-modal-address">Alamat</label>
                  <div className={`address-field ${fieldDisabled ? "is-readonly" : ""}`}>
                    <MapPin size={18} />
                    <textarea
                      id="mc-modal-address"
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      maxLength={1000}
                      rows={3}
                      required
                      disabled={fieldDisabled}
                    />
                  </div>
                </div>

                <div className="mc-profile-modal-actions">
                  {!editing ? (
                    <>
                      <button
                        type="button"
                        className="mc-profile-modal-cancel"
                        onClick={onClose}
                      >
                        Tutup
                      </button>

                      <button
                        type="button"
                        className="mc-profile-modal-save"
                        onClick={handleEdit}
                        disabled={!token || Boolean(error)}
                      >
                        <Pencil size={17} />
                        Edit Profil
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="mc-profile-modal-cancel"
                        onClick={handleCancelEdit}
                        disabled={saving}
                      >
                        Batal
                      </button>

                      <button
                        type="button"
                        className="mc-profile-modal-save"
                        onClick={handleSubmit}
                        disabled={saving || !token}
                      >
                        {saving ? (
                          <>
                            <LoaderCircle className="mc-profile-modal-spinner" size={17} />
                            Memperbarui...
                          </>
                        ) : (
                          <>
                            <Save size={17} />
                            Perbarui Profil
                          </>
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}


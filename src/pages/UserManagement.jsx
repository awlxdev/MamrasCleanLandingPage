import { useCallback, useEffect, useState } from "react";
import {
  Users,
  Search,
  RefreshCw,
  Eye,
  Pencil,
  X,
  Save,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  CalendarDays,
  UserRound,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import "./UserManagement.css";

const emptyForm = {
  name: "",
  email: "",
  whatsapp: "",
  address: "",
  password: "",
  password_confirmation: ""
};

function formatDate(value) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(new Date(value));
}

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [summary, setSummary] = useState({ total: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("detail");
  const [selectedUser, setSelectedUser] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const token = sessionStorage.getItem("mamras_clean_admin_token");

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        page: String(page)
      });

      if (search.trim()) {
        params.set("search", search.trim());
      }

      const response = await fetch(`/api/admin/users?${params}`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal mengambil data pengguna.");
      }

      setUsers(result.data?.data || []);
      setSummary(result.summary || { total: 0 });
      setPagination({
        current_page: result.data?.current_page || 1,
        last_page: result.data?.last_page || 1,
        total: result.data?.total || 0
      });
    } catch (err) {
      setError(err.message || "Tidak dapat terhubung ke server.");
    } finally {
      setLoading(false);
    }
  }, [token, page, search]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value
    }));
  }

  async function openUser(user, mode) {
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal mengambil detail pengguna.");
      }

      const data = result.data;

      setSelectedUser(data);
      setForm({
        name: data.name || "",
        email: data.email || "",
        whatsapp: data.whatsapp || "",
        address: data.address || "",
        password: "",
        password_confirmation: ""
      });
      setModalMode(mode);
      setModalOpen(true);
    } catch (err) {
      setError(err.message || "Gagal mengambil detail pengguna.");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!selectedUser) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          whatsapp: form.whatsapp,
          address: form.address,
          ...(form.password ? {
            password: form.password,
            password_confirmation: form.password_confirmation
          } : {})
        })
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.errors) {
          throw new Error(Object.values(result.errors).flat().join(" "));
        }

        throw new Error(result.message || "Gagal memperbarui pengguna.");
      }

      setSelectedUser(result.data);
      setForm({
        name: result.data.name || "",
        email: result.data.email || "",
        whatsapp: result.data.whatsapp || "",
        address: result.data.address || "",
        password: "",
        password_confirmation: ""
      });

      setSuccess("Data pengguna berhasil diperbarui.");
      setModalMode("detail");
      await loadUsers();
    } catch (err) {
      setError(err.message || "Gagal memperbarui data pengguna.");
    } finally {
      setSaving(false);
    }
  }

  function closeModal() {
    setModalOpen(false);
    setSelectedUser(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
  }

  return (
    <section className="user-management">
      <div className="user-management-heading">
        <div>
          <span className="user-management-eyebrow">DATA PELANGGAN</span>
          <h2>Manajemen Pengguna</h2>
          <p>Lihat dan kelola informasi akun pelanggan Mamras Clean.</p>
        </div>

        <button
          type="button"
          className="user-management-refresh"
          onClick={loadUsers}
          disabled={loading}
        >
          <RefreshCw size={17} className={loading ? "is-spinning" : ""} />
          <span>Segarkan</span>
        </button>
      </div>

      <div className="user-management-summary">
        <div className="user-management-summary-icon">
          <Users size={23} />
        </div>
        <div>
          <span>Total Pelanggan</span>
          <strong>{summary.total ?? 0}</strong>
          <small>Terdaftar di database</small>
        </div>
      </div>

      {success && (
        <div className="user-management-alert success">
          <CheckCircle2 size={18} />
          <span>{success}</span>
        </div>
      )}

      {error && !modalOpen && (
        <div className="user-management-alert error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="user-management-toolbar">
        <div className="user-management-search">
          <Search size={18} />
          <input
            type="search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Cari nama, email, atau WhatsApp..."
          />
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setPage(1);
              }}
              aria-label="Hapus pencarian"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <span className="user-management-result-count">
          {pagination.total} pengguna ditemukan
        </span>
      </div>

      <div className="user-management-table-card">
        <div className="user-management-table-wrap">
          <table className="user-management-table">
            <thead>
              <tr>
                <th>PENGGUNA</th>
                <th>WHATSAPP</th>
                <th>ALAMAT</th>
                <th>TANGGAL DAFTAR</th>
                <th>AKSI</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="user-management-empty">
                    <RefreshCw size={22} className="is-spinning" />
                    <span>Memuat data pengguna...</span>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="5" className="user-management-empty">
                    <AlertCircle size={22} />
                    <span>{error}</span>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="user-management-empty">
                    <Users size={25} />
                    <strong>Pengguna tidak ditemukan</strong>
                    <span>Coba gunakan kata kunci pencarian lain.</span>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="user-management-identity">
                        <div className="user-management-avatar">
                          <UserRound size={19} />
                        </div>
                        <div>
                          <strong>{user.name}</strong>
                          <span>{user.email}</span>
                        </div>
                      </div>
                    </td>

                    <td>{user.whatsapp || "-"}</td>

                    <td>
                      <span className="user-management-address">
                        {user.address || "-"}
                      </span>
                    </td>

                    <td>{formatDate(user.created_at)}</td>

                    <td>
                      <div className="user-management-actions">
                        <button
                          type="button"
                          title="Lihat detail"
                          aria-label={`Lihat ${user.name}`}
                          onClick={() => openUser(user, "detail")}
                        >
                          <Eye size={17} />
                        </button>
                        <button
                          type="button"
                          title="Edit pengguna"
                          aria-label={`Edit ${user.name}`}
                          onClick={() => openUser(user, "edit")}
                        >
                          <Pencil size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="user-management-pagination">
          <span>
            Halaman {pagination.current_page} dari {pagination.last_page}
          </span>

          <div>
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              aria-label="Halaman sebelumnya"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              disabled={page >= pagination.last_page || loading}
              onClick={() => setPage((current) => current + 1)}
              aria-label="Halaman berikutnya"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {modalOpen && selectedUser && (
        <div className="user-management-modal-overlay" onClick={closeModal}>
          <section
            className="user-management-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="user-management-modal-header">
              <div>
                <span>PROFIL PELANGGAN</span>
                <h3>{modalMode === "edit" ? "Edit Pengguna" : "Detail Pengguna"}</h3>
              </div>
              <button type="button" onClick={closeModal} aria-label="Tutup">
                <X size={21} />
              </button>
            </header>

            {error && (
              <div className="user-management-alert error">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="user-management-alert success">
                <CheckCircle2 size={18} />
                <span>{success}</span>
              </div>
            )}

            {modalMode === "edit" ? (
              <form className="user-management-form" onSubmit={handleSubmit}>
                <label>
                  Nama lengkap
                  <input
                    type="text"
                    value={form.name}
                    onChange={(event) => updateField("name", event.target.value)}
                    maxLength={255}
                    required
                  />
                </label>

                <label>
                  Email
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) => updateField("email", event.target.value)}
                    maxLength={255}
                    required
                  />
                </label>

                <label>
                  Nomor WhatsApp
                  <input
                    type="tel"
                    value={form.whatsapp}
                    onChange={(event) => updateField("whatsapp", event.target.value)}
                    maxLength={20}
                    required
                  />
                </label>

                <label>
                  Alamat
                  <textarea
                    value={form.address}
                    onChange={(event) => updateField("address", event.target.value)}
                    maxLength={1000}
                    rows={4}
                    required
                  />
                </label>

                <div className="user-management-password-section">
                  <div>
                    <strong>Ganti Password</strong>
                    <span>Kosongkan jika tidak ingin mengubah password saat ini.</span>
                  </div>

                  <label>
                    Password Baru
                    <input
                      type="password"
                      value={form.password}
                      onChange={(event) => updateField("password", event.target.value)}
                      minLength={8}
                      autoComplete="new-password"
                      placeholder="Minimal 8 karakter"
                    />
                  </label>

                  <label>
                    Konfirmasi Password Baru
                    <input
                      type="password"
                      value={form.password_confirmation}
                      onChange={(event) => updateField("password_confirmation", event.target.value)}
                      minLength={8}
                      autoComplete="new-password"
                      placeholder="Ulangi password baru"
                    />
                  </label>
                </div>

                <div className="user-management-form-actions">
                  <button
                    type="button"
                    className="user-management-button-secondary"
                    onClick={() => {
                      setModalMode("detail");
                      setError("");
                    }}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="user-management-button-primary"
                    disabled={saving}
                  >
                    <Save size={17} />
                    {saving ? "Menyimpan..." : "Simpan Perubahan"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="user-management-detail">
                <div className="user-management-detail-profile">
                  <div className="user-management-detail-avatar">
                    <UserRound size={30} />
                  </div>
                  <div>
                    <h4>{selectedUser.name}</h4>
                    <span>Pelanggan Mamras Clean</span>
                  </div>
                </div>

                <div className="user-management-detail-list">
                  <div>
                    <Mail size={18} />
                    <span>
                      <small>Email</small>
                      <strong>{selectedUser.email}</strong>
                    </span>
                  </div>
                  <div>
                    <Phone size={18} />
                    <span>
                      <small>WhatsApp</small>
                      <strong>{selectedUser.whatsapp || "-"}</strong>
                    </span>
                  </div>
                  <div>
                    <MapPin size={18} />
                    <span>
                      <small>Alamat</small>
                      <strong>{selectedUser.address || "-"}</strong>
                    </span>
                  </div>
                  <div>
                    <CalendarDays size={18} />
                    <span>
                      <small>Tanggal bergabung</small>
                      <strong>{formatDate(selectedUser.created_at)}</strong>
                    </span>
                  </div>
                </div>

                <div className="user-management-form-actions">
                  <button
                    type="button"
                    className="user-management-button-primary"
                    onClick={() => {
                      setModalMode("edit");
                      setError("");
                      setSuccess("");
                    }}
                  >
                    <Pencil size={17} />
                    Edit Data Pengguna
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </section>
  );
}
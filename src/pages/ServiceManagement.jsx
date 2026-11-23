import { useCallback, useEffect, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  RefreshCw,
  BriefcaseBusiness,
  CheckCircle2,
  XCircle,
  Save,
  AlertCircle
} from "lucide-react";
import "./ServiceManagement.css";

const emptyForm = {
  title: "",
  slug: "",
  description: "",
  price: "",
  icon: "Sparkles",
  sort_order: 0,
  is_active: true
};

function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

export default function ServiceManagement() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const token = sessionStorage.getItem("mamras_clean_admin_token");

  const loadServices = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/services", {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal mengambil data layanan.");
      }

      setServices(result.data || []);
    } catch (err) {
      setError(err.message || "Tidak dapat terhubung ke server.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  function openCreateModal() {
    setEditingId(null);
    setForm({
      ...emptyForm,
      sort_order: services.length + 1
    });
    setError("");
    setSuccess("");
    setModalOpen(true);
  }

  function openEditModal(service) {
    setEditingId(service.id);
    setForm({
      title: service.title,
      slug: service.slug,
      description: service.description,
      price: service.price ?? "",
      icon: service.icon || "Sparkles",
      sort_order: service.sort_order ?? 0,
      is_active: Boolean(service.is_active)
    });
    setError("");
    setSuccess("");
    setModalOpen(true);
  }

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value
    }));
  }

  function createSlug(value) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const numericPrice = Number(form.price);

    if (
      form.price === "" ||
      !Number.isInteger(numericPrice) ||
      numericPrice < 0
    ) {
      setError("Harga layanan wajib diisi dengan angka Rupiah yang valid.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    const payload = {
      ...form,
      price: numericPrice,
      sort_order: Number(form.sort_order),
      is_active: form.is_active ? 1 : 0
    };

    const url = editingId
      ? `/api/admin/services/${editingId}`
      : "/api/admin/services";

    try {
      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.errors) {
          const messages = Object.values(result.errors).flat();
          throw new Error(messages.join(" "));
        }

        throw new Error(result.message || "Gagal menyimpan layanan.");
      }

      setModalOpen(false);
      setSuccess(
        editingId
          ? "Layanan dan harga berhasil diperbarui."
          : "Layanan dan harga berhasil ditambahkan."
      );

      await loadServices();
    } catch (err) {
      setError(err.message || "Terjadi kesalahan.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(service) {
    const confirmed = window.confirm(
      `Apakah Anda yakin ingin menghapus layanan "${service.title}"?`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `/api/admin/services/${service.id}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`
          }
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal menghapus layanan.");
      }

      setSuccess("Layanan berhasil dihapus.");
      await loadServices();
    } catch (err) {
      setError(err.message || "Terjadi kesalahan.");
    }
  }

  async function toggleStatus(service) {
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `/api/admin/services/${service.id}`,
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            is_active: service.is_active ? 0 : 1
          })
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal mengubah status.");
      }

      setSuccess("Status layanan berhasil diperbarui.");
      await loadServices();
    } catch (err) {
      setError(err.message || "Terjadi kesalahan.");
    }
  }

  const filteredServices = services.filter((service) => {
    const keyword = search.toLowerCase();

    const matchesSearch =
      service.title.toLowerCase().includes(keyword) ||
      service.description.toLowerCase().includes(keyword);

    const matchesFilter =
      filter === "all" ||
      (filter === "active" && service.is_active) ||
      (filter === "inactive" && !service.is_active);

    return matchesSearch && matchesFilter;
  });

  const activeCount = services.filter((item) => item.is_active).length;
  const inactiveCount = services.length - activeCount;

  return (
    <section className="service-management">
      <div className="service-management-heading">
        <div>
          <span className="service-management-eyebrow">
            PENGELOLAAN WEBSITE
          </span>
          <h2>Manajemen Layanan</h2>
          <p>Kelola layanan dan harga tetap yang ditampilkan pada website Mamras Clean.</p>
        </div>

        <button
          className="service-primary-button"
          onClick={openCreateModal}
        >
          <Plus size={18} />
          Tambah Layanan
        </button>
      </div>

      <div className="service-summary-grid">
        <div className="service-summary-card">
          <span className="service-summary-icon blue">
            <BriefcaseBusiness size={20} />
          </span>
          <div>
            <span>Total Layanan</span>
            <strong>{services.length}</strong>
          </div>
        </div>

        <div className="service-summary-card">
          <span className="service-summary-icon green">
            <CheckCircle2 size={20} />
          </span>
          <div>
            <span>Layanan Aktif</span>
            <strong>{activeCount}</strong>
          </div>
        </div>

        <div className="service-summary-card">
          <span className="service-summary-icon orange">
            <XCircle size={20} />
          </span>
          <div>
            <span>Layanan Nonaktif</span>
            <strong>{inactiveCount}</strong>
          </div>
        </div>
      </div>

      {success && (
        <div className="service-alert success">
          <CheckCircle2 size={17} />
          {success}
          <button onClick={() => setSuccess("")} aria-label="Tutup">
            <X size={16} />
          </button>
        </div>
      )}

      {error && !modalOpen && (
        <div className="service-alert error">
          <AlertCircle size={17} />
          {error}
          <button onClick={() => setError("")} aria-label="Tutup">
            <X size={16} />
          </button>
        </div>
      )}

      <div className="service-table-card">
        <div className="service-table-toolbar">
          <div>
            <h3>Daftar Layanan</h3>
            <p>Data layanan dan harga yang tersimpan di database.</p>
          </div>

          <div className="service-table-actions">
            <div className="service-search">
              <Search size={17} />
              <input
                type="text"
                placeholder="Cari layanan..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              aria-label="Filter status"
            >
              <option value="all">Semua status</option>
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
            </select>

            <button
              className="service-refresh-button"
              onClick={loadServices}
              disabled={loading}
              title="Muat ulang"
            >
              <RefreshCw size={17} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="service-empty-state">
            <RefreshCw className="service-spinning" size={25} />
            <p>Memuat data layanan...</p>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="service-empty-state">
            <BriefcaseBusiness size={32} />
            <strong>Layanan tidak ditemukan</strong>
            <p>Coba ubah kata pencarian atau tambahkan layanan baru.</p>
          </div>
        ) : (
          <div className="service-table-wrapper">
            <table className="service-table">
              <thead>
                <tr>
                  <th>LAYANAN</th>
                  <th>HARGA</th>
                  <th>IKON</th>
                  <th>URUTAN</th>
                  <th>STATUS</th>
                  <th className="service-action-heading">AKSI</th>
                </tr>
              </thead>

              <tbody>
                {filteredServices.map((service) => (
                  <tr key={service.id}>
                    <td>
                      <div className="service-table-name">
                        <strong>{service.title}</strong>
                        <span>{service.slug}</span>
                        <p>{service.description}</p>
                      </div>
                    </td>

                    <td>
                      <strong className="service-price-value">
                        {service.price !== null && service.price !== undefined
                          ? formatRupiah(service.price)
                          : "Belum diatur"}
                      </strong>
                    </td>

                    <td>
                      <span className="service-icon-label">
                        {service.icon}
                      </span>
                    </td>

                    <td>{service.sort_order}</td>

                    <td>
                      <button
                        className={`service-status ${
                          service.is_active ? "active" : "inactive"
                        }`}
                        onClick={() => toggleStatus(service)}
                        title="Klik untuk mengubah status"
                      >
                        {service.is_active ? (
                          <CheckCircle2 size={14} />
                        ) : (
                          <XCircle size={14} />
                        )}
                        {service.is_active ? "Aktif" : "Nonaktif"}
                      </button>
                    </td>

                    <td>
                      <div className="service-row-actions">
                        <button
                          className="service-edit-button"
                          onClick={() => openEditModal(service)}
                          title="Edit layanan dan harga"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          className="service-delete-button"
                          onClick={() => handleDelete(service)}
                          title="Hapus layanan"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="service-table-footer">
          Menampilkan {filteredServices.length} dari {services.length} layanan
        </div>
      </div>

      {modalOpen && (
        <div
          className="service-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) {
              setModalOpen(false);
            }
          }}
        >
          <div
            className="service-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="service-modal-title"
          >
            <div className="service-modal-header">
              <div>
                <span>PENGELOLAAN LAYANAN</span>
                <h3 id="service-modal-title">
                  {editingId ? "Edit Layanan" : "Tambah Layanan"}
                </h3>
              </div>

              <button
                onClick={() => setModalOpen(false)}
                disabled={saving}
                aria-label="Tutup modal"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {error && (
                <div className="service-alert error">
                  <AlertCircle size={17} />
                  {error}
                </div>
              )}

              <div className="service-form-group">
                <label htmlFor="service-title">Nama Layanan *</label>
                <input
                  id="service-title"
                  value={form.title}
                  onChange={(event) => {
                    const title = event.target.value;
                    setForm((current) => ({
                      ...current,
                      title,
                      slug: editingId
                        ? current.slug
                        : createSlug(title)
                    }));
                  }}
                  placeholder="Contoh: Kebersihan Hunian"
                  required
                  maxLength={255}
                />
              </div>

              <div className="service-form-group">
                <label htmlFor="service-slug">Slug *</label>
                <input
                  id="service-slug"
                  value={form.slug}
                  onChange={(event) =>
                    updateField("slug", createSlug(event.target.value))
                  }
                  placeholder="kebersihan-hunian"
                  required
                  maxLength={255}
                />
                <small>Digunakan sebagai identitas unik layanan.</small>
              </div>

              <div className="service-form-group">
                <label htmlFor="service-description">Deskripsi *</label>
                <textarea
                  id="service-description"
                  value={form.description}
                  onChange={(event) =>
                    updateField("description", event.target.value)
                  }
                  placeholder="Tuliskan deskripsi layanan..."
                  rows={4}
                  required
                />
              </div>

              <div className="service-form-group service-price-field">
                <label htmlFor="service-price">Harga Tetap (Rupiah) *</label>
                <div className="service-price-input-wrap">
                  <span>Rp</span>
                  <input
                    id="service-price"
                    type="number"
                    min="0"
                    step="1"
                    inputMode="numeric"
                    value={form.price}
                    onChange={(event) =>
                      updateField("price", event.target.value)
                    }
                    placeholder="Contoh: 150000"
                    required
                  />
                </div>
                <small>
                  Harga ini akan ditampilkan kepada pelanggan sebelum membuat pesanan.
                </small>
              </div>

              <div className="service-form-row">
                <div className="service-form-group">
                  <label htmlFor="service-icon">Nama Ikon Lucide</label>
                  <input
                    id="service-icon"
                    value={form.icon}
                    onChange={(event) =>
                      updateField("icon", event.target.value)
                    }
                    placeholder="Sparkles"
                  />
                </div>

                <div className="service-form-group">
                  <label htmlFor="service-order">Urutan</label>
                  <input
                    id="service-order"
                    type="number"
                    min="0"
                    value={form.sort_order}
                    onChange={(event) =>
                      updateField("sort_order", event.target.value)
                    }
                  />
                </div>
              </div>

              <label className="service-active-option">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(event) =>
                    updateField("is_active", event.target.checked)
                  }
                />
                <span>
                  <strong>Aktifkan layanan</strong>
                  <small>
                    Layanan aktif akan ditampilkan pada website publik.
                  </small>
                </span>
              </label>

              <div className="service-modal-footer">
                <button
                  type="button"
                  className="service-cancel-button"
                  onClick={() => setModalOpen(false)}
                  disabled={saving}
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="service-primary-button"
                  disabled={saving}
                >
                  <Save size={17} />
                  {saving
                    ? "Menyimpan..."
                    : editingId
                      ? "Simpan Perubahan"
                      : "Simpan Layanan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
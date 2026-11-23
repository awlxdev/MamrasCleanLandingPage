import { useCallback, useEffect, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  RefreshCw,
  Images,
  CheckCircle2,
  XCircle,
  Save,
  AlertCircle,
  ImagePlus,
  Upload
} from "lucide-react";
import "./GalleryManagement.css";

const emptyForm = {
  title: "",
  description: "",
  sort_order: 0,
  is_active: true
};

export default function GalleryManagement() {
  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");

  const token = sessionStorage.getItem("mamras_clean_admin_token");

  const loadGalleries = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/galleries", {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal mengambil data galeri.");
      }

      setGalleries(result.data || []);
    } catch (err) {
      setError(err.message || "Tidak dapat terhubung ke server.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadGalleries();
  }, [loadGalleries]);

  useEffect(() => {
    return () => {
      if (preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  function resetForm() {
    setForm({
      ...emptyForm,
      sort_order: galleries.length + 1
    });
    setImage(null);
    setPreview("");
    setEditingId(null);
    setError("");
  }

  function openCreateModal() {
    resetForm();
    setSuccess("");
    setModalOpen(true);
  }

  function openEditModal(gallery) {
    setEditingId(gallery.id);
    setForm({
      title: gallery.title || "",
      description: gallery.description || "",
      sort_order: gallery.sort_order ?? 0,
      is_active: Boolean(gallery.is_active)
    });
    setImage(null);
    setPreview(gallery.image_url || "");
    setError("");
    setSuccess("");
    setModalOpen(true);
  }

  function closeModal() {
    if (saving) return;

    setModalOpen(false);
    setImage(null);
    setPreview("");
    setError("");
  }

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value
    }));
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("File harus berupa gambar.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Ukuran gambar maksimal 5 MB.");
      return;
    }

    if (preview.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!editingId && !image) {
      setError("Silakan pilih foto galeri terlebih dahulu.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    const payload = new FormData();
    payload.append("title", form.title);
    payload.append("description", form.description);
    payload.append("sort_order", String(Number(form.sort_order)));
    payload.append("is_active", form.is_active ? "1" : "0");

    if (image) {
      payload.append("image", image);
    }

    if (editingId) {
      payload.append("_method", "PUT");
    }

    const url = editingId
      ? `/api/admin/galleries/${editingId}`
      : "/api/admin/galleries";

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`
        },
        body: payload
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.errors) {
          const messages = Object.values(result.errors).flat();
          throw new Error(messages.join(" "));
        }

        throw new Error(result.message || "Gagal menyimpan galeri.");
      }

      setModalOpen(false);
      setImage(null);
      setPreview("");
      setSuccess(
        editingId
          ? "Data galeri berhasil diperbarui."
          : "Foto galeri berhasil ditambahkan."
      );

      await loadGalleries();
    } catch (err) {
      setError(err.message || "Terjadi kesalahan.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(gallery) {
    const confirmed = window.confirm(
      `Apakah Anda yakin ingin menghapus foto "${gallery.title}"?`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `/api/admin/galleries/${gallery.id}`,
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
        throw new Error(result.message || "Gagal menghapus foto.");
      }

      setSuccess("Foto galeri berhasil dihapus.");
      await loadGalleries();
    } catch (err) {
      setError(err.message || "Terjadi kesalahan.");
    }
  }

  async function toggleStatus(gallery) {
    setError("");
    setSuccess("");

    const payload = new FormData();
    payload.append("_method", "PUT");
    payload.append("is_active", gallery.is_active ? "0" : "1");

    try {
      const response = await fetch(
        `/api/admin/galleries/${gallery.id}`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`
          },
          body: payload
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal mengubah status.");
      }

      setSuccess("Status foto berhasil diperbarui.");
      await loadGalleries();
    } catch (err) {
      setError(err.message || "Terjadi kesalahan.");
    }
  }

  const filteredGalleries = galleries.filter((gallery) => {
    const keyword = search.toLowerCase();

    const matchesSearch =
      (gallery.title || "").toLowerCase().includes(keyword) ||
      (gallery.description || "").toLowerCase().includes(keyword);

    const matchesFilter =
      filter === "all" ||
      (filter === "active" && gallery.is_active) ||
      (filter === "inactive" && !gallery.is_active);

    return matchesSearch && matchesFilter;
  });

  const activeCount = galleries.filter((item) => item.is_active).length;
  const inactiveCount = galleries.length - activeCount;

  return (
    <section className="gallery-management">
      <div className="gallery-management-heading">
        <div>
          <span className="gallery-management-eyebrow">
            PENGELOLAAN WEBSITE
          </span>
          <h2>Manajemen Galeri</h2>
          <p>Kelola dokumentasi foto kegiatan dan hasil pekerjaan Mamras Clean.</p>
        </div>

        <button
          className="gallery-primary-button"
          onClick={openCreateModal}
        >
          <Plus size={18} />
          Tambah Foto
        </button>
      </div>

      <div className="gallery-summary-grid">
        <div className="gallery-summary-card">
          <span className="gallery-summary-icon blue">
            <Images size={20} />
          </span>
          <div>
            <span>Total Foto</span>
            <strong>{galleries.length}</strong>
          </div>
        </div>

        <div className="gallery-summary-card">
          <span className="gallery-summary-icon green">
            <CheckCircle2 size={20} />
          </span>
          <div>
            <span>Foto Aktif</span>
            <strong>{activeCount}</strong>
          </div>
        </div>

        <div className="gallery-summary-card">
          <span className="gallery-summary-icon orange">
            <XCircle size={20} />
          </span>
          <div>
            <span>Foto Nonaktif</span>
            <strong>{inactiveCount}</strong>
          </div>
        </div>
      </div>

      {success && (
        <div className="gallery-alert success">
          <CheckCircle2 size={17} />
          {success}
          <button onClick={() => setSuccess("")} aria-label="Tutup">
            <X size={16} />
          </button>
        </div>
      )}

      {error && !modalOpen && (
        <div className="gallery-alert error">
          <AlertCircle size={17} />
          {error}
          <button onClick={() => setError("")} aria-label="Tutup">
            <X size={16} />
          </button>
        </div>
      )}

      <div className="gallery-table-card">
        <div className="gallery-table-toolbar">
          <div>
            <h3>Daftar Foto Galeri</h3>
            <p>Dokumentasi yang tersimpan di database.</p>
          </div>

          <div className="gallery-table-actions">
            <div className="gallery-search">
              <Search size={17} />
              <input
                type="text"
                placeholder="Cari foto..."
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
              className="gallery-refresh-button"
              onClick={loadGalleries}
              disabled={loading}
              title="Muat ulang"
            >
              <RefreshCw size={17} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="gallery-empty-state">
            <RefreshCw className="gallery-spinning" size={25} />
            <p>Memuat data galeri...</p>
          </div>
        ) : filteredGalleries.length === 0 ? (
          <div className="gallery-empty-state">
            <Images size={32} />
            <strong>Foto tidak ditemukan</strong>
            <p>Coba ubah pencarian atau tambahkan foto galeri baru.</p>
          </div>
        ) : (
          <div className="gallery-table-wrapper">
            <table className="gallery-table">
              <thead>
                <tr>
                  <th>FOTO</th>
                  <th>URUTAN</th>
                  <th>STATUS</th>
                  <th className="gallery-action-heading">AKSI</th>
                </tr>
              </thead>

              <tbody>
                {filteredGalleries.map((gallery) => (
                  <tr key={gallery.id}>
                    <td>
                      <div className="gallery-table-item">
                        <img
                          src={gallery.image_url}
                          alt={gallery.title}
                          className="gallery-table-thumbnail"
                        />
                        <div className="gallery-table-name">
                          <strong>{gallery.title}</strong>
                          <p>{gallery.description || "Tidak ada deskripsi."}</p>
                        </div>
                      </div>
                    </td>

                    <td>{gallery.sort_order}</td>

                    <td>
                      <button
                        className={`gallery-status ${
                          gallery.is_active ? "active" : "inactive"
                        }`}
                        onClick={() => toggleStatus(gallery)}
                        title="Klik untuk mengubah status"
                      >
                        {gallery.is_active ? (
                          <CheckCircle2 size={14} />
                        ) : (
                          <XCircle size={14} />
                        )}
                        {gallery.is_active ? "Aktif" : "Nonaktif"}
                      </button>
                    </td>

                    <td>
                      <div className="gallery-row-actions">
                        <button
                          className="gallery-edit-button"
                          onClick={() => openEditModal(gallery)}
                          title="Edit foto"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          className="gallery-delete-button"
                          onClick={() => handleDelete(gallery)}
                          title="Hapus foto"
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

        <div className="gallery-table-footer">
          Menampilkan {filteredGalleries.length} dari {galleries.length} foto
        </div>
      </div>

      {modalOpen && (
        <div
          className="gallery-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <div
            className="gallery-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="gallery-modal-title"
          >
            <div className="gallery-modal-header">
              <div>
                <span>PENGELOLAAN GALERI</span>
                <h3 id="gallery-modal-title">
                  {editingId ? "Edit Foto Galeri" : "Tambah Foto Galeri"}
                </h3>
              </div>

              <button
                onClick={closeModal}
                disabled={saving}
                aria-label="Tutup modal"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {error && (
                <div className="gallery-alert error">
                  <AlertCircle size={17} />
                  {error}
                </div>
              )}

              <div className="gallery-form-group">
                <label htmlFor="gallery-title">Judul Foto *</label>
                <input
                  id="gallery-title"
                  value={form.title}
                  onChange={(event) =>
                    updateField("title", event.target.value)
                  }
                  placeholder="Contoh: Pembersihan Rumah"
                  required
                  maxLength={255}
                />
              </div>

              <div className="gallery-form-group">
                <label htmlFor="gallery-description">Deskripsi</label>
                <textarea
                  id="gallery-description"
                  value={form.description}
                  onChange={(event) =>
                    updateField("description", event.target.value)
                  }
                  placeholder="Tuliskan keterangan foto..."
                  rows={3}
                />
              </div>

              <div className="gallery-form-group">
                <label>Foto Galeri {!editingId && "*"}</label>

                <label className="gallery-upload-area">
                  {preview ? (
                    <img
                      src={preview}
                      alt="Pratinjau foto galeri"
                      className="gallery-upload-preview"
                    />
                  ) : (
                    <span className="gallery-upload-placeholder">
                      <ImagePlus size={30} />
                      <strong>Pilih foto dari perangkat</strong>
                      <small>JPG, JPEG, PNG, atau WEBP · Maksimal 5 MB</small>
                    </span>
                  )}

                  <span className="gallery-upload-action">
                    <Upload size={15} />
                    {image ? "Ganti Foto" : preview ? "Ganti Foto" : "Pilih Foto"}
                  </span>

                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                  />
                </label>

                {editingId && (
                  <small className="gallery-form-hint">
                    Kosongkan pilihan foto jika tidak ingin mengganti gambar.
                  </small>
                )}
              </div>

              <div className="gallery-form-row">
                <div className="gallery-form-group">
                  <label htmlFor="gallery-order">Urutan Tampilan</label>
                  <input
                    id="gallery-order"
                    type="number"
                    min="0"
                    value={form.sort_order}
                    onChange={(event) =>
                      updateField("sort_order", event.target.value)
                    }
                  />
                </div>
              </div>

              <label className="gallery-active-option">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(event) =>
                    updateField("is_active", event.target.checked)
                  }
                />
                <span>
                  <strong>Tampilkan di website</strong>
                  <small>
                    Foto aktif dapat ditampilkan pada website publik.
                  </small>
                </span>
              </label>

              <div className="gallery-modal-footer">
                <button
                  type="button"
                  className="gallery-cancel-button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="gallery-primary-button"
                  disabled={saving}
                >
                  <Save size={17} />
                  {saving
                    ? "Menyimpan..."
                    : editingId
                      ? "Simpan Perubahan"
                      : "Simpan Foto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

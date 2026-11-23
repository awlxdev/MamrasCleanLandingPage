import { useCallback, useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  Upload,
  Image as ImageIcon,
  X,
  Save,
  Megaphone,
  Eye,
  EyeOff
} from "lucide-react";
import "./AdManagement.css";

const emptyForm = {
  slot: "1",
  title: "",
  description: "",
  service_id: "",
  normal_price: "",
  promo_price: "",
  button_text: "Hubungi Kami",
  button_url: "",
  is_active: true,
  sort_order: "0"
};

function formatRupiah(value) {
  const number = Number(value || 0);

  if (!number) return "Rp0";

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(number);
}

function getDiscount(ad) {
  const normal = Number(ad.normal_price || 0);
  const promo = Number(ad.promo_price || 0);

  if (normal <= 0 || promo <= 0 || promo >= normal) return null;

  return {
    amount: normal - promo,
    percentage: Math.round(((normal - promo) / normal) * 100)
  };
}

export default function AdManagement({ token }) {
  const [ads, setAds] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const loadAds = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/ads", {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.message || "Daftar iklan gagal dimuat.");
      }

      setAds(Array.isArray(result.data) ? result.data : []);
    } catch (err) {
      setError(err.message || "Tidak dapat mengambil data iklan.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadAds();
  }, [loadAds]);

  useEffect(() => {
    let cancelled = false;

    async function loadServices() {
      try {
        const response = await fetch("/api/services", {
          headers: { Accept: "application/json" }
        });

        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(result.message || "Daftar layanan gagal dimuat.");
        }

        if (!cancelled) {
          setServices(Array.isArray(result.data) ? result.data : []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Tidak dapat mengambil daftar layanan.");
        }
      }
    }

    loadServices();

    return () => {
      cancelled = true;
    };
  }, []);

  function openCreate() {
    setEditingId(null);
    setForm({ ...emptyForm });
    setImage(null);
    setImagePreview("");
    setError("");
    setSuccess("");
    setModalOpen(true);
  }

  function openEdit(ad) {
    setEditingId(ad.id);
    setForm({
      slot: String(ad.slot),
      title: ad.title || "",
      description: ad.description || "",
      service_id: String(ad.service_id ?? ""),
      normal_price: ad.normal_price ?? "",
      promo_price: ad.promo_price ?? "",
      button_text: ad.button_text || "",
      button_url: ad.button_url || "",
      is_active: Boolean(ad.is_active),
      sort_order: String(ad.sort_order ?? 0)
    });
    setImage(null);
    setImagePreview(ad.image_url || "");
    setError("");
    setSuccess("");
    setModalOpen(true);
  }

  function closeModal() {
    if (saving) return;

    setModalOpen(false);
    setEditingId(null);
    setImage(null);
    setImagePreview("");
  }

  function updateField(key, value) {
    if (key === "service_id") {
      const selectedService = services.find(
        (service) => String(service.id) === String(value)
      );

      setForm((current) => ({
        ...current,
        service_id: value,
        normal_price: selectedService?.price ?? ""
      }));

      return;
    }

    setForm((current) => ({
      ...current,
      [key]: value
    }));
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowed = ["image/jpeg", "image/png", "image/webp"];

    if (!allowed.includes(file.type)) {
      setError("Format gambar harus JPG, PNG, atau WebP.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Ukuran gambar maksimal 5 MB.");
      event.target.value = "";
      return;
    }

    setImage(file);
    setImagePreview(URL.createObjectURL(file));
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.title.trim()) {
      setError("Judul iklan wajib diisi.");
      return;
    }

    const selectedService = services.find(
      (service) => String(service.id) === String(form.service_id)
    );

    if (!selectedService) {
      setError("Silakan pilih layanan terkait.");
      return;
    }

    if (selectedService.price === null || selectedService.price === undefined) {
      setError("Layanan yang dipilih belum memiliki harga tetap.");
      return;
    }

    if (!editingId && !image) {
      setError("Silakan pilih gambar untuk iklan baru.");
      return;
    }

    const normal = Number(selectedService.price || 0);
    const promo = Number(form.promo_price || 0);

    if (promo > 0 && promo > normal) {
      setError("Harga promo tidak boleh lebih besar dari harga tetap.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    const formData = new FormData();

    formData.append("slot", form.slot);
    formData.append("title", form.title.trim());
    formData.append("description", form.description);
    formData.append("service_id", form.service_id);
    formData.append("promo_price", form.promo_price);
    formData.append("button_text", form.button_text);
    formData.append("button_url", form.button_url);
    formData.append("is_active", form.is_active ? "1" : "0");
    formData.append("sort_order", form.sort_order || "0");

    if (image) {
      formData.append("image", image);
    }

    const endpoint = editingId
      ? `/api/admin/ads/${editingId}`
      : "/api/admin/ads";

    if (editingId) {
      formData.append("_method", "PUT");
    }

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        const validation = result.errors
          ? Object.values(result.errors).flat().join(" ")
          : "";

        throw new Error(
          validation || result.message || "Iklan gagal disimpan."
        );
      }

      setModalOpen(false);
      setEditingId(null);
      setImage(null);
      setImagePreview("");
      setSuccess(
        editingId
          ? "Iklan berhasil diperbarui."
          : "Iklan baru berhasil ditambahkan."
      );

      await loadAds();
    } catch (err) {
      setError(err.message || "Terjadi kesalahan saat menyimpan iklan.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(ad) {
    const formData = new FormData();
    formData.append("_method", "PUT");
    formData.append("is_active", ad.is_active ? "0" : "1");

    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/admin/ads/${ad.id}`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.message || "Status iklan gagal diperbarui.");
      }

      setSuccess(
        ad.is_active
          ? "Iklan berhasil dinonaktifkan."
          : "Iklan berhasil diaktifkan."
      );

      await loadAds();
    } catch (err) {
      setError(err.message || "Gagal mengubah status iklan.");
    }
  }

  async function deleteAd(ad) {
    const confirmed = window.confirm(
      `Hapus iklan "${ad.title}"? Tindakan ini tidak dapat dibatalkan.`
    );

    if (!confirmed) return;

    setDeletingId(ad.id);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/admin/ads/${ad.id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.message || "Iklan gagal dihapus.");
      }

      setSuccess("Iklan berhasil dihapus.");
      await loadAds();
    } catch (err) {
      setError(err.message || "Gagal menghapus iklan.");
    } finally {
      setDeletingId(null);
    }
  }

  const slotOne = ads.filter((ad) => Number(ad.slot) === 1);
  const slotTwo = ads.filter((ad) => Number(ad.slot) === 2);

  function renderSlot(slot, items) {
    return (
      <section className="ad-manager-slot" key={slot}>
        <div className="ad-manager-slot-heading">
          <div>
            <span className="ad-manager-slot-label">AREA TAMPILAN</span>
            <h4>Slot {slot}</h4>
            <p>
              {slot === 1
                ? "Ditampilkan tepat setelah bagian Hero."
                : "Ditampilkan setelah formulir kontak, sebelum Footer."}
            </p>
          </div>
          <span className="ad-manager-count">{items.length} iklan</span>
        </div>

        {items.length === 0 ? (
          <div className="ad-manager-empty">
            <Megaphone size={25} />
            <strong>Belum ada iklan di Slot {slot}</strong>
            <span>Tambahkan iklan agar penawaran tampil di website.</span>
          </div>
        ) : (
          <div className="ad-manager-list">
            {items.map((ad) => {
              const discount = getDiscount(ad);

              return (
                <article className="ad-manager-card" key={ad.id}>
                  <div className="ad-manager-card-image">
                    {ad.image_url ? (
                      <img src={ad.image_url} alt={ad.title} />
                    ) : (
                      <ImageIcon size={28} />
                    )}
                  </div>

                  <div className="ad-manager-card-content">
                    <div className="ad-manager-card-top">
                      <span className={ad.is_active ? "ad-manager-status active" : "ad-manager-status"}>
                        {ad.is_active ? "Aktif" : "Nonaktif"}
                      </span>
                      <span className="ad-manager-order">
                        Urutan {ad.sort_order ?? 0}
                      </span>
                    </div>

                    <h5>{ad.title}</h5>
                    {ad.service_name && (
                      <span className="ad-manager-service-name">
                        Layanan: {ad.service_name}
                      </span>
                    )}
                    <p className="ad-manager-description">
                      {ad.description || "Tidak ada deskripsi."}
                    </p>

                    <div className="ad-manager-prices">
                      {Number(ad.normal_price) > 0 && (
                        <span className={discount ? "ad-manager-old-price" : "ad-manager-normal-price"}>
                          {formatRupiah(ad.normal_price)}
                        </span>
                      )}
                      {Number(ad.promo_price) > 0 && (
                        <strong>{formatRupiah(ad.promo_price)}</strong>
                      )}
                      {discount && (
                        <span className="ad-manager-discount">
                          Hemat {discount.percentage}%
                        </span>
                      )}
                    </div>

                    <div className="ad-manager-card-actions">
                      <button type="button" onClick={() => openEdit(ad)}>
                        <Pencil size={15} />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleStatus(ad)}
                        disabled={deletingId === ad.id}
                      >
                        {ad.is_active ? <EyeOff size={15} /> : <Eye size={15} />}
                        {ad.is_active ? "Nonaktifkan" : "Aktifkan"}
                      </button>
                      <button
                        type="button"
                        className="danger"
                        onClick={() => deleteAd(ad)}
                        disabled={deletingId === ad.id}
                      >
                        <Trash2 size={15} />
                        {deletingId === ad.id ? "Menghapus..." : "Hapus"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    );
  }

  return (
    <div className="ad-manager">
      <div className="ad-manager-toolbar">
        <div>
          <strong>{ads.length} iklan tersimpan</strong>
          <p>Kelola promosi yang tampil pada kedua area website.</p>
        </div>

        <button type="button" className="ad-manager-add" onClick={openCreate}>
          <Plus size={17} />
          Tambah Iklan
        </button>
      </div>

      {error && (
        <div className="ad-manager-alert error" role="alert">
          {error}
          <button type="button" onClick={() => setError("")} aria-label="Tutup">
            <X size={16} />
          </button>
        </div>
      )}

      {success && (
        <div className="ad-manager-alert success" role="status">
          {success}
          <button type="button" onClick={() => setSuccess("")} aria-label="Tutup">
            <X size={16} />
          </button>
        </div>
      )}

      {loading ? (
        <div className="ad-manager-loading">
          <RefreshCw size={20} className="ad-manager-spin" />
          Memuat daftar iklan...
        </div>
      ) : (
        <>
          {renderSlot(1, slotOne)}
          {renderSlot(2, slotTwo)}
        </>
      )}

      {modalOpen && (
        <div className="ad-manager-modal-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) closeModal();
        }}>
          <form className="ad-manager-modal" onSubmit={handleSubmit}>
            <div className="ad-manager-modal-heading">
              <div>
                <span>PENGELOLAAN PROMOSI</span>
                <h3>{editingId ? "Edit Iklan" : "Tambah Iklan Baru"}</h3>
              </div>
              <button type="button" onClick={closeModal} disabled={saving} aria-label="Tutup">
                <X size={20} />
              </button>
            </div>

            {error && (
              <div className="ad-manager-alert error" role="alert">{error}</div>
            )}

            <div className="ad-manager-form">
              <div className="ad-manager-field">
                <label htmlFor="ad-slot">Lokasi Slot</label>
                <select
                  id="ad-slot"
                  value={form.slot}
                  onChange={(event) => updateField("slot", event.target.value)}
                >
                  <option value="1">Slot 1 - Setelah Hero</option>
                  <option value="2">Slot 2 - Sebelum Footer</option>
                </select>
              </div>

              <div className="ad-manager-field">
                <label htmlFor="ad-title">Judul Iklan *</label>
                <input
                  id="ad-title"
                  value={form.title}
                  onChange={(event) => updateField("title", event.target.value)}
                  maxLength={255}
                  required
                />
              </div>

              <div className="ad-manager-field full">
                <label htmlFor="ad-description">Deskripsi</label>
                <textarea
                  id="ad-description"
                  value={form.description}
                  onChange={(event) => updateField("description", event.target.value)}
                  rows={3}
                />
              </div>

              <div className="ad-manager-field full">
                <label>Gambar Iklan {editingId ? "(opsional jika tidak diganti)" : "*"}</label>
                <div className="ad-manager-image-picker">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Pratinjau gambar iklan" />
                  ) : (
                    <div className="ad-manager-image-placeholder">
                      <ImageIcon size={28} />
                      <span>Belum ada gambar dipilih</span>
                    </div>
                  )}
                  <label className="ad-manager-file-button">
                    <Upload size={16} />
                    Pilih Gambar
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
                <small>JPG, PNG, atau WebP. Maksimal 5 MB.</small>
              </div>

              <div className="ad-manager-field full">
                <label htmlFor="ad-service">Layanan Terkait *</label>
                <select
                  id="ad-service"
                  value={form.service_id}
                  onChange={(event) => updateField("service_id", event.target.value)}
                  required
                >
                  <option value="">Pilih layanan terkait</option>
                  {services.map((service) => (
                    <option key={service.id} value={String(service.id)}>
                      {service.title}
                    </option>
                  ))}
                </select>
                <small>
                  Harga tetap iklan mengikuti harga layanan yang dipilih.
                </small>
              </div>

              <div className="ad-manager-field">
                <label htmlFor="ad-normal-price">Harga Tetap (Rp)</label>
                <input
                  id="ad-normal-price"
                  type="text"
                  value={
                    form.normal_price !== "" && form.normal_price !== null
                      ? formatRupiah(form.normal_price)
                      : "Pilih layanan terlebih dahulu"
                  }
                  readOnly
                  placeholder="Otomatis dari layanan"
                />
              </div>

              <div className="ad-manager-field">
                <label htmlFor="ad-promo-price">Harga Promo (Rp)</label>
                <input
                  id="ad-promo-price"
                  type="number"
                  min="0"
                  step="1"
                  value={form.promo_price}
                  onChange={(event) => updateField("promo_price", event.target.value)}
                  placeholder="Contoh: 199000"
                />
              </div>

              {getDiscount(form) && (
                <div className="ad-manager-discount-preview">
                  Diskon {getDiscount(form).percentage}% - Hemat {formatRupiah(getDiscount(form).amount)}
                </div>
              )}

              <div className="ad-manager-field">
                <label htmlFor="ad-button-text">Teks Tombol</label>
                <input
                  id="ad-button-text"
                  value={form.button_text}
                  onChange={(event) => updateField("button_text", event.target.value)}
                  maxLength={100}
                  placeholder="Contoh: Pesan Sekarang"
                />
              </div>

              <div className="ad-manager-field">
                <label htmlFor="ad-button-url">URL Tujuan</label>
                <input
                  id="ad-button-url"
                  type="url"
                  value={form.button_url}
                  onChange={(event) => updateField("button_url", event.target.value)}
                  placeholder="https://..."
                />
              </div>

              <div className="ad-manager-field">
                <label htmlFor="ad-sort-order">Urutan Tampilan</label>
                <input
                  id="ad-sort-order"
                  type="number"
                  min="0"
                  step="1"
                  value={form.sort_order}
                  onChange={(event) => updateField("sort_order", event.target.value)}
                />
              </div>

              <div className="ad-manager-field ad-manager-active-field">
                <label>Status Iklan</label>
                <label className="ad-manager-switch">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(event) => updateField("is_active", event.target.checked)}
                  />
                  <span>{form.is_active ? "Aktif" : "Nonaktif"}</span>
                </label>
              </div>
            </div>

            <div className="ad-manager-modal-footer">
              <button type="button" className="ad-manager-cancel" onClick={closeModal} disabled={saving}>
                Batal
              </button>
              <button type="submit" className="ad-manager-submit" disabled={saving}>
                <Save size={16} />
                {saving ? "Menyimpan..." : editingId ? "Simpan Perubahan" : "Tambah Iklan"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
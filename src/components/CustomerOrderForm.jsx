import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  ClipboardCheck,
  LoaderCircle,
  MapPin,
  MessageCircle,
  Send,
  Sparkles,
  UserRound,
  Wallet,
  AlertCircle
} from "lucide-react";

import { createCustomerOrder } from "../utils/customerOrderApi";

function getLocalDateString() {
  const now = new Date();
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 10);
}

function formatPrice(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(Number(value));
}

function CustomerOrderForm({ customer, services, initialServiceId, onSuccess, onCancel }) {
  const [form, setForm] = useState({
    service_id: initialServiceId ? String(initialServiceId) : "",
    customer_name: customer?.name || "",
    customer_whatsapp: customer?.whatsapp || "",
    address: customer?.address || "",
    requested_date: "",
    requested_time: "",
    details: ""
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const selectedService = services.find(
    (service) => String(service.id) === String(form.service_id)
  );

  useEffect(() => {
    if (initialServiceId) {
      setForm((previous) => ({ ...previous, service_id: String(initialServiceId) }));
      return;
    }
    if (services.length > 0 && !form.service_id) {
      setForm((previous) => ({
        ...previous,
        service_id: String(services[0].id)
      }));
    }
  }, [services, form.service_id, initialServiceId]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!form.service_id || !selectedService) {
      setError("Silakan pilih layanan terlebih dahulu.");
      return;
    }

    if (selectedService.price === null || selectedService.price === undefined || selectedService.price === "") {
      setError("Harga layanan belum tersedia. Silakan hubungi admin.");
      return;
    }

    if (!form.customer_name.trim() ||
        !form.customer_whatsapp.trim() ||
        !form.address.trim()) {
      setError("Nama, WhatsApp, dan alamat wajib diisi.");
      return;
    }

    const selectedDate = new Date(`${form.requested_date}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      setError("Tanggal layanan tidak boleh sebelum hari ini.");
      return;
    }

    try {
      setSubmitting(true);

      const result = await createCustomerOrder({
        ...form,
        service_id: Number(form.service_id),
        customer_name: form.customer_name.trim(),
        customer_whatsapp: form.customer_whatsapp.trim(),
        address: form.address.trim(),
        details: form.details.trim() || null
      });

      onSuccess(result.data, result.message);
    } catch (err) {
      setError(err.message || "Pesanan gagal dikirim.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mc-portal-content-card mc-order-form-page">
      <div className="mc-portal-page-heading">
        <span>PEMESANAN MAMRAS CLEAN</span>
        <h1>Formulir Pemesanan</h1>
        <p>
          Lengkapi informasi berikut agar tim kami dapat memproses
          permintaan layanan kebersihan Anda.
        </p>
      </div>

      <form className="mc-order-form" onSubmit={handleSubmit}>
        <div className="mc-order-form-section">
          <div className="mc-order-form-section-title">
            <span><Sparkles size={19} /></span>
            <div>
              <h2>Pilih Layanan</h2>
              <p>Tentukan jenis layanan yang Anda butuhkan.</p>
            </div>
          </div>

          <label className="mc-order-field">
            <span>Layanan <b>*</b></span>
            <select
              name="service_id"
              value={form.service_id}
              onChange={handleChange}
              required
              disabled={services.length === 0}
            >
              <option value="">Pilih layanan</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.title}
                </option>
              ))}
            </select>
          </label>

          {selectedService && (
            <div className="mc-order-price">
              <Wallet size={19} />
              <div>
                <small>Harga tetap layanan</small>
                <strong>
                  {selectedService.price !== null && selectedService.price !== undefined
                    ? formatPrice(selectedService.price)
                    : "Belum tersedia"}
                </strong>
              </div>
            </div>
          )}
        </div>

        <div className="mc-order-form-section">
          <div className="mc-order-form-section-title">
            <span><UserRound size={19} /></span>
            <div>
              <h2>Informasi Pelanggan</h2>
              <p>Pastikan informasi kontak dan alamat Anda benar.</p>
            </div>
          </div>

          <div className="mc-order-form-grid">
            <label className="mc-order-field">
              <span>Nama Lengkap <b>*</b></span>
              <input
                name="customer_name"
                value={form.customer_name}
                onChange={handleChange}
                placeholder="Masukkan nama lengkap"
                maxLength={255}
                required
              />
            </label>

            <label className="mc-order-field">
              <span>Nomor WhatsApp <b>*</b></span>
              <input
                name="customer_whatsapp"
                type="tel"
                value={form.customer_whatsapp}
                onChange={handleChange}
                placeholder="Contoh: 082188558026"
                maxLength={20}
                required
              />
            </label>
          </div>

          <label className="mc-order-field">
            <span>Alamat <b>*</b></span>
            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Masukkan alamat lengkap lokasi layanan"
              rows={3}
              maxLength={1000}
              required
            />
          </label>
        </div>

        <div className="mc-order-form-section">
          <div className="mc-order-form-section-title">
            <span><CalendarDays size={19} /></span>
            <div>
              <h2>Jadwal Layanan</h2>
              <p>Pilih tanggal dan waktu yang Anda inginkan.</p>
            </div>
          </div>

          <div className="mc-order-form-grid">
            <label className="mc-order-field">
              <span>Tanggal Layanan <b>*</b></span>
              <input
                type="date"
                name="requested_date"
                value={form.requested_date}
                onChange={handleChange}
                min={getLocalDateString()}
                required
              />
            </label>

            <label className="mc-order-field">
              <span>Waktu Layanan <b>*</b></span>
              <input
                type="time"
                name="requested_time"
                value={form.requested_time}
                onChange={handleChange}
                required
              />
            </label>
          </div>
        </div>

        <div className="mc-order-form-section">
          <div className="mc-order-form-section-title">
            <span><MessageCircle size={19} /></span>
            <div>
              <h2>Detail Tambahan</h2>
              <p>Berikan informasi tambahan jika diperlukan.</p>
            </div>
          </div>

          <label className="mc-order-field">
            <span>Catatan / Detail Kebutuhan</span>
            <textarea
              name="details"
              value={form.details}
              onChange={handleChange}
              placeholder="Jelaskan kebutuhan kebersihan, ukuran ruangan, atau informasi lainnya (opsional)"
              rows={4}
              maxLength={3000}
            />
          </label>
        </div>

        <div className="mc-order-form-notice">
          <ClipboardCheck size={21} />
          <div>
            <strong>Informasi proses pemesanan</strong>
            <p>
              Harga layanan yang ditampilkan merupakan harga tetap.
              Admin akan menghubungi Anda untuk konfirmasi jadwal dan
              tindak lanjut pesanan.
            </p>
          </div>
        </div>

        {error && (
          <div className="mc-order-form-error" role="alert">
            <AlertCircle size={19} />
            {error}
          </div>
        )}

        <div className="mc-order-form-actions">
          <button
            type="button"
            className="mc-order-secondary-button"
            onClick={onCancel}
            disabled={submitting}
          >
            <ArrowLeft size={17} />
            Kembali
          </button>

          <button
            type="submit"
            className="mc-order-submit-button"
            disabled={submitting || services.length === 0}
          >
            {submitting ? (
              <>
                <LoaderCircle className="mc-order-spinner" size={18} />
                Mengirim...
              </>
            ) : (
              <>
                <Send size={17} />
                Kirim Permintaan Pesanan
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  );
}

export default CustomerOrderForm;
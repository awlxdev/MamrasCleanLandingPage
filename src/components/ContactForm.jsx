import { useState } from "react";
import { Send, MessageSquareText, CheckCircle2, AlertCircle } from "lucide-react";
import "./ContactForm.css";

const initialForm = {
  name: "",
  email: "",
  whatsapp: "",
  subject: "",
  message: "",
};

export default function ContactForm() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({
    type: "",
    message: "",
  });

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);
    setFeedback({ type: "", message: "" });

    try {
      const response = await fetch("/api/contact-messages", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 422) {
          const firstError = Object.values(result.errors || {}).flat()[0];

          throw new Error(firstError || "Periksa kembali data formulir Anda.");
        }

        throw new Error(result.message || "Pesan gagal dikirim. Silakan coba lagi.");
      }

      setForm(initialForm);
      setFeedback({
        type: "success",
        message: result.message || "Pesan berhasil dikirim. Terima kasih!",
      });
    } catch (error) {
      setFeedback({
        type: "error",
        message: error.message || "Tidak dapat terhubung ke server.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="contact-form-section" id="formulir-pesan">
      <div className="container">
        <div className="contact-form-heading">
          <span className="eyebrow eyebrow-green">KIRIM PESAN</span>
          <h2>Ada yang Ingin <span>Anda Tanyakan?</span></h2>
          <p>
            Sampaikan kebutuhan atau pertanyaan Anda kepada Mamras Clean.
            Tim kami akan menghubungi Anda kembali.
          </p>
        </div>

        <div className="contact-form-card">
          <div className="contact-form-intro">
            <div className="contact-form-icon">
              <MessageSquareText size={25} />
            </div>
            <div>
              <h3>Formulir Pesan Pelanggan</h3>
              <p>Lengkapi informasi berikut agar kami dapat membantu Anda.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="contact-form-grid">
              <div className="contact-form-field">
                <label htmlFor="contact-name">Nama lengkap</label>
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  placeholder="Masukkan nama lengkap"
                  value={form.name}
                  onChange={handleChange}
                  maxLength={150}
                  autoComplete="name"
                  required
                />
              </div>

              <div className="contact-form-field">
                <label htmlFor="contact-email">Alamat email</label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  placeholder="contoh@email.com"
                  value={form.email}
                  onChange={handleChange}
                  maxLength={150}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="contact-form-field">
                <label htmlFor="contact-whatsapp">Nomor WhatsApp</label>
                <input
                  id="contact-whatsapp"
                  name="whatsapp"
                  type="tel"
                  placeholder="Contoh: 082188558026"
                  value={form.whatsapp}
                  onChange={handleChange}
                  maxLength={30}
                  autoComplete="tel"
                  required
                />
              </div>

              <div className="contact-form-field">
                <label htmlFor="contact-subject">Subjek pesan</label>
                <input
                  id="contact-subject"
                  name="subject"
                  type="text"
                  placeholder="Contoh: Konsultasi layanan"
                  value={form.subject}
                  onChange={handleChange}
                  maxLength={200}
                  required
                />
              </div>

              <div className="contact-form-field contact-form-field-full">
                <label htmlFor="contact-message">Isi pesan</label>
                <textarea
                  id="contact-message"
                  name="message"
                  placeholder="Tuliskan kebutuhan atau pertanyaan Anda..."
                  value={form.message}
                  onChange={handleChange}
                  minLength={10}
                  maxLength={5000}
                  rows={6}
                  required
                />
                <span className="contact-form-hint">
                  Minimal 10 karakter.
                </span>
              </div>
            </div>

            {feedback.message && (
              <div
                className={`contact-form-feedback ${feedback.type}`}
                role="status"
                aria-live="polite"
              >
                {feedback.type === "success" ? (
                  <CheckCircle2 size={19} />
                ) : (
                  <AlertCircle size={19} />
                )}
                <span>{feedback.message}</span>
              </div>
            )}

            <div className="contact-form-submit">
              <p>Pastikan informasi yang Anda masukkan sudah benar.</p>
              <button type="submit" disabled={loading}>
                <Send size={17} />
                {loading ? "Mengirim pesan..." : "Kirim Pesan"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
import { useEffect, useMemo, useState } from "react";
import {
  Save,
  RefreshCw,
  Upload,
  Image as ImageIcon,
  Building2,
  PanelsTopLeft,
  ListOrdered,
  Megaphone,
  Contact,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import AdManagement from "./AdManagement";
import "./ContentManagement.css";

const sections = [
  {
    id: "identity",
    title: "Identitas Bisnis",
    description: "Atur nama dan informasi utama Mamras Clean.",
    icon: Building2,
    fields: [
      { key: "brand_name", label: "Nama Bisnis", type: "text" },
      { key: "brand_tagline", label: "Tagline", type: "text" },
      { key: "business_description", label: "Deskripsi Bisnis", type: "textarea" }
    ]
  },
  {
    id: "hero",
    title: "Hero / Banner",
    description: "Atur tampilan utama yang pertama dilihat pengunjung.",
    icon: PanelsTopLeft,
    fields: [
      { key: "hero_label", label: "Label Hero", type: "text" },
      { key: "hero_title", label: "Judul Utama", type: "text" },
      { key: "hero_description", label: "Deskripsi Hero", type: "textarea" },
      { key: "hero_button_text", label: "Teks Tombol", type: "text" },
      { key: "hero_button_url", label: "Tautan Tombol", type: "url" }
    ]
  },
  {
    id: "ads",
    title: "Iklan Website",
    description: "Kelola seluruh iklan promosi pada Slot 1 dan Slot 2 website publik.",
    icon: Megaphone,
    fields: []
  },
  {
    id: "how",
    title: "Cara Pemesanan",
    description: "Atur judul dan empat langkah pemesanan layanan.",
    icon: ListOrdered,
    fields: [
      { key: "how_title", label: "Judul Bagian", type: "text" },
      ...[1, 2, 3, 4].flatMap((number) => [
        {
          key: `how_step_${number}_title`,
          label: `Langkah ${number} — Judul`,
          type: "text"
        },
        {
          key: `how_step_${number}_description`,
          label: `Langkah ${number} — Deskripsi`,
          type: "textarea"
        }
      ])
    ]
  },
  {
    id: "cta",
    title: "Call to Action",
    description: "Atur ajakan pelanggan untuk menghubungi Mamras Clean.",
    icon: Megaphone,
    fields: [
      { key: "cta_label", label: "Label CTA", type: "text" },
      { key: "cta_title", label: "Judul CTA", type: "text" },
      { key: "cta_description", label: "Deskripsi CTA", type: "textarea" },
      { key: "cta_button_text", label: "Teks Tombol CTA", type: "text" }
    ]
  },
  {
    id: "contact",
    title: "Footer & Kontak",
    description: "Atur informasi kontak dan deskripsi bagian footer.",
    icon: Contact,
    fields: [
      { key: "contact_whatsapp", label: "Nomor WhatsApp", type: "text" },
      { key: "contact_email", label: "Email", type: "email" },
      { key: "contact_address", label: "Alamat", type: "textarea" },
      { key: "footer_description", label: "Deskripsi Footer", type: "textarea" }
    ]
  }
];

const emptyContents = Object.fromEntries(
  sections.flatMap((section) =>
    section.fields.map((field) => [field.key, ""])
  )
);

export default function ContentManagement() {
  const [activeSection, setActiveSection] = useState("identity");
  const [contents, setContents] = useState(emptyContents);
  const [heroImageUrl, setHeroImageUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  const token = sessionStorage.getItem("mamras_clean_admin_token");

  const currentSection = useMemo(
    () => sections.find((section) => section.id === activeSection),
    [activeSection]
  );

  async function loadContents() {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/admin/site-content", {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.message || "Konten website gagal dimuat."
        );
      }

      setContents({
        ...emptyContents,
        ...(result.data || {})
      });

      setHeroImageUrl(result.hero_image_url || "");
    } catch (err) {
      setError(err.message || "Terjadi kesalahan saat mengambil konten.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadContents();
  }, []);

  function updateField(key, value) {
    setContents((current) => ({
      ...current,
      [key]: value
    }));

    setSuccess("");
  }

  async function handleSave() {
    if (!currentSection) return;

    setSaving(true);
    setError("");
    setSuccess("");

    const sectionContents = Object.fromEntries(
      currentSection.fields.map((field) => [
        field.key,
        contents[field.key] ?? ""
      ])
    );

    try {
      const response = await fetch("/api/admin/site-content", {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          contents: sectionContents
        })
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        const validationMessage = result.errors
          ? Object.values(result.errors).flat().join(" ")
          : "";

        throw new Error(
          validationMessage ||
          result.message ||
          "Konten gagal disimpan."
        );
      }

      setContents((current) => ({
        ...current,
        ...(result.data || sectionContents)
      }));

      setSuccess("Perubahan berhasil disimpan.");
    } catch (err) {
      setError(err.message || "Gagal menyimpan perubahan.");
    } finally {
      setSaving(false);
    }
  }

  async function handleImageUpload(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp"
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Format gambar harus JPG, PNG, atau WebP.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Ukuran gambar maksimal 5 MB.");
      event.target.value = "";
      return;
    }

    setUploading(true);
    setError("");
    setSuccess("");

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch(
        "/api/admin/site-content/hero-image",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`
          },
          body: formData
        }
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.message || "Gambar Hero gagal diunggah."
        );
      }

      setHeroImageUrl(result.hero_image_url || "");
      setSuccess("Gambar Hero berhasil diperbarui.");
      setSelectedImage(null);
    } catch (err) {
      setError(err.message || "Gagal mengunggah gambar.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }


  if (loading) {
    return (
      <section className="content-management">
        <div className="content-loading">
          <RefreshCw size={22} className="content-spinning" />
          <span>Memuat konten website...</span>
        </div>
      </section>
    );
  }

  return (
    <section className="content-management">
      <div className="content-management-heading">
        <div>
          <span className="content-eyebrow">PENGELOLAAN WEBSITE</span>
          <h2>Konten Website</h2>
          <p>
            Kelola informasi dan teks yang ditampilkan pada website
            publik Mamras Clean.
          </p>
        </div>

        <button
          className="content-refresh-button"
          onClick={loadContents}
          disabled={saving || uploading}
          type="button"
        >
          <RefreshCw size={16} />
          Muat Ulang
        </button>
      </div>

      {error && (
        <div className="content-alert error">
          <AlertCircle size={17} />
          <span>{error}</span>
          <button onClick={() => setError("")} type="button">×</button>
        </div>
      )}

      {success && (
        <div className="content-alert success">
          <CheckCircle2 size={17} />
          <span>{success}</span>
          <button onClick={() => setSuccess("")} type="button">×</button>
        </div>
      )}

      <div className="content-layout">
        <aside className="content-sidebar">
          <span className="content-sidebar-label">BAGIAN WEBSITE</span>

          {sections.map((section) => {
            const Icon = section.icon;

            return (
              <button
                key={section.id}
                type="button"
                className={`content-nav-item ${
                  activeSection === section.id ? "active" : ""
                }`}
                onClick={() => {
                  setActiveSection(section.id);
                  setError("");
                  setSuccess("");
                }}
              >
                <Icon size={18} />
                <span>{section.title}</span>
              </button>
            );
          })}
        </aside>

        <div className="content-editor">
          <div className="content-editor-heading">
            <div>
              <span className="content-editor-eyebrow">
                EDITOR KONTEN
              </span>
              <h3>{currentSection.title}</h3>
              <p>{currentSection.description}</p>
            </div>
          </div>

                    {activeSection === "ads" && <AdManagement token={token} />}

          {activeSection !== "ads" && (
          <div className="content-fields">
            {currentSection.fields.map((field) => (
              <div className="content-form-group" key={field.key}>
                <label htmlFor={`content-${field.key}`}>
                  {field.label}
                </label>

                {field.type === "toggle" ? (
                  <label className="content-toggle">
                    <input
                      type="checkbox"
                      checked={contents[field.key] === "1"}
                      onChange={(event) =>
                        updateField(
                          field.key,
                          event.target.checked ? "1" : "0"
                        )
                      }
                    />
                    <span className="content-toggle-track" />
                    <span>
                      {contents[field.key] === "1" ? "Aktif" : "Nonaktif"}
                    </span>
                  </label>
                ) : field.type === "textarea" ? (
                  <textarea
                    id={`content-${field.key}`}
                    value={contents[field.key] ?? ""}
                    onChange={(event) =>
                      updateField(field.key, event.target.value)
                    }
                    rows={4}
                    placeholder={`Masukkan ${field.label.toLowerCase()}...`}
                  />
                ) : (
                  <input
                    id={`content-${field.key}`}
                    type={field.type}
                    value={contents[field.key] ?? ""}
                    onChange={(event) =>
                      updateField(field.key, event.target.value)
                    }
                    placeholder={`Masukkan ${field.label.toLowerCase()}...`}
                  />
                )}
              </div>
            ))}
          </div>
          )}

          {activeSection !== "ads" && (
          <div className="content-editor-footer">
            <span>
              Perubahan hanya disimpan pada bagian yang sedang dibuka.
            </span>

            <button
              type="button"
              className="content-save-button"
              onClick={handleSave}
              disabled={saving || uploading}
            >
              <Save size={17} />
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
          )}
        </div>
      </div>
    </section>
  );
}

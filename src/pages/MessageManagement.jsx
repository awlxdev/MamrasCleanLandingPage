import { useCallback, useEffect, useState } from "react";
import {
  Search,
  RefreshCw,
  Mail,
  MailOpen,
  MessageSquare,
  Eye,
  Trash2,
  X,
  UserRound,
  Phone,
  CalendarDays,
  Clock3,
  CheckCircle2,
  AlertCircle,
  Send,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Inbox
} from "lucide-react";
import "./MessageManagement.css";

const filters = [
  { value: "all", label: "Semua Pesan" },
  { value: "unread", label: "Belum Dibaca" },
  { value: "read", label: "Sudah Dibaca" },
  { value: "replied", label: "Sudah Dibalas" }
];

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function getStatusLabel(status) {
  if (status === "unread") return "Belum dibaca";
  if (status === "read") return "Sudah dibaca";
  if (status === "replied") return "Sudah dibalas";
  return status || "Tidak diketahui";
}

function getWhatsAppLink(number, message) {
  const digits = String(number || "").replace(/\D/g, "");

  if (!digits) return "#";

  const normalized = digits.startsWith("0")
    ? `62${digits.slice(1)}`
    : digits.startsWith("62")
      ? digits
      : `62${digits}`;

  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

export default function MessageManagement() {
  const token = sessionStorage.getItem("mamras_clean_admin_token");

  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const requestHeaders = {
    Accept: "application/json",
    Authorization: `Bearer ${token}`
  };

  const loadMessages = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({ page: String(page) });

      if (filter !== "all") {
        params.set("status", filter);
      }

      const response = await fetch(
        `/api/admin/messages?${params.toString()}`,
        { headers: requestHeaders }
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.message || "Gagal mengambil daftar pesan."
        );
      }

      const payload = result.data || {};
      const pagination = Array.isArray(payload)
        ? null
        : payload;

      const rows = Array.isArray(payload)
        ? payload
        : Array.isArray(payload.data)
          ? payload.data
          : [];

      setMessages(rows);
      setUnreadCount(Number(result.unread_count || 0));
      setLastPage(Number(pagination?.last_page || 1));
    } catch (err) {
      setError(err.message || "Tidak dapat terhubung ke server.");
    } finally {
      setLoading(false);
    }
  }, [token, filter, page]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  async function openMessage(id) {
    setDetailLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/admin/messages/${id}`, {
        headers: requestHeaders
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.message || "Gagal membuka pesan.");
      }

      const message = result.data?.data || result.data;

      if (!message || !message.id) {
        throw new Error("Data detail pesan tidak ditemukan.");
      }

      setSelectedMessage(message);
      await loadMessages();
    } catch (err) {
      setError(err.message || "Gagal membuka detail pesan.");
    } finally {
      setDetailLoading(false);
    }
  }

  async function updateStatus(status) {
    if (!selectedMessage) return;

    setActionLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `/api/admin/messages/${selectedMessage.id}`,
        {
          method: "PATCH",
          headers: {
            ...requestHeaders,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ status })
        }
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.message || "Gagal mengubah status pesan.");
      }

      const updated = result.data?.data || result.data;

      if (updated?.id) {
        setSelectedMessage(updated);
      } else {
        setSelectedMessage((current) => ({
          ...current,
          status
        }));
      }

      setSuccess("Status pesan berhasil diperbarui.");
      await loadMessages();
    } catch (err) {
      setError(err.message || "Gagal mengubah status.");
    } finally {
      setActionLoading(false);
    }
  }

  async function deleteMessage(message) {
    const confirmed = window.confirm(
      `Hapus pesan dari ${message.name}? Tindakan ini tidak dapat dibatalkan.`
    );

    if (!confirmed) return;

    setActionLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `/api/admin/messages/${message.id}`,
        {
          method: "DELETE",
          headers: requestHeaders
        }
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.message || "Gagal menghapus pesan.");
      }

      setSelectedMessage(null);
      setSuccess("Pesan berhasil dihapus.");

      if (messages.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        await loadMessages();
      }
    } catch (err) {
      setError(err.message || "Gagal menghapus pesan.");
    } finally {
      setActionLoading(false);
    }
  }

  const filteredMessages = messages.filter((message) => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return true;

    return [
      message.name,
      message.email,
      message.whatsapp,
      message.subject,
      message.message
    ].some((value) =>
      String(value || "").toLowerCase().includes(keyword)
    );
  });

  const readCount = messages.filter(
    (message) => message.status === "read"
  ).length;

  const repliedCount = messages.filter(
    (message) => message.status === "replied"
  ).length;

  return (
    <section className="message-management">
      <div className="message-heading">
        <div>
          <span className="message-eyebrow">PUSAT KOMUNIKASI</span>
          <h2>Pesan Pelanggan</h2>
          <p>Kelola pertanyaan dan pesan yang dikirim melalui website.</p>
        </div>

        <button
          className="message-refresh"
          onClick={loadMessages}
          disabled={loading}
        >
          <RefreshCw
            size={16}
            className={loading ? "message-spinning" : ""}
          />
          Perbarui
        </button>
      </div>

      <div className="message-summary">
        <div className="message-summary-card">
          <div className="message-summary-icon blue">
            <Inbox size={20} />
          </div>
          <div>
            <span>Belum Dibaca</span>
            <strong>{unreadCount}</strong>
          </div>
        </div>

        <div className="message-summary-card">
          <div className="message-summary-icon orange">
            <MailOpen size={20} />
          </div>
          <div>
            <span>Sudah Dibaca</span>
            <strong>{readCount}</strong>
          </div>
        </div>

        <div className="message-summary-card">
          <div className="message-summary-icon green">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <span>Sudah Dibalas</span>
            <strong>{repliedCount}</strong>
          </div>
        </div>
      </div>

      {error && (
        <div className="message-alert error">
          <AlertCircle size={17} />
          <span>{error}</span>
          <button onClick={() => setError("")} aria-label="Tutup">
            <X size={16} />
          </button>
        </div>
      )}

      {success && (
        <div className="message-alert success">
          <CheckCircle2 size={17} />
          <span>{success}</span>
          <button onClick={() => setSuccess("")} aria-label="Tutup">
            <X size={16} />
          </button>
        </div>
      )}

      <div className="message-table-card">
        <div className="message-toolbar">
          <div>
            <h3>Kotak Masuk</h3>
            <p>Pesan yang dikirim oleh pengunjung website.</p>
          </div>

          <div className="message-toolbar-actions">
            <label className="message-search">
              <Search size={16} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari pesan..."
              />
            </label>

            <select
              value={filter}
              onChange={(event) => {
                setFilter(event.target.value);
                setPage(1);
              }}
              aria-label="Filter pesan"
            >
              {filters.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="message-empty">
            <RefreshCw size={25} className="message-spinning" />
            <strong>Memuat pesan...</strong>
            <p>Mohon tunggu sebentar.</p>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="message-empty">
            <Inbox size={34} />
            <strong>
              {search ? "Pesan tidak ditemukan" : "Belum ada pesan"}
            </strong>
            <p>
              {search
                ? "Coba gunakan kata kunci yang berbeda."
                : "Pesan dari formulir website akan tampil di sini."}
            </p>
          </div>
        ) : (
          <div className="message-table-wrapper">
            <table className="message-table">
              <thead>
                <tr>
                  <th>PENGIRIM</th>
                  <th>SUBJEK</th>
                  <th>TANGGAL</th>
                  <th>STATUS</th>
                  <th className="message-action-heading">AKSI</th>
                </tr>
              </thead>
              <tbody>
                {filteredMessages.map((message) => (
                  <tr
                    key={message.id}
                    className={
                      message.status === "unread"
                        ? "message-row-unread"
                        : ""
                    }
                  >
                    <td>
                      <div className="message-sender">
                        <strong>{message.name}</strong>
                        <span>{message.email}</span>
                      </div>
                    </td>
                    <td>
                      <div className="message-subject">
                        {message.subject}
                      </div>
                      <div className="message-preview">
                        {message.message}
                      </div>
                    </td>
                    <td className="message-date">
                      {formatDate(message.created_at)}
                    </td>
                    <td>
                      <span className={`message-status ${message.status}`}>
                        {getStatusLabel(message.status)}
                      </span>
                    </td>
                    <td>
                      <div className="message-row-actions">
                        <button
                          className="message-view-button"
                          onClick={() => openMessage(message.id)}
                          title="Lihat detail"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className="message-delete-button"
                          onClick={() => deleteMessage(message)}
                          title="Hapus pesan"
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

        <div className="message-table-footer">
          <span>
            Menampilkan {filteredMessages.length} pesan pada halaman ini
          </span>

          <div className="message-pagination">
            <button
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page <= 1 || loading}
              aria-label="Halaman sebelumnya"
            >
              <ChevronLeft size={17} />
            </button>
            <span>
              Halaman {page} dari {lastPage}
            </span>
            <button
              onClick={() =>
                setPage((current) => Math.min(lastPage, current + 1))
              }
              disabled={page >= lastPage || loading}
              aria-label="Halaman berikutnya"
            >
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      </div>

      {selectedMessage && (
        <div
          className="message-modal-backdrop"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !actionLoading
            ) {
              setSelectedMessage(null);
            }
          }}
        >
          <div
            className="message-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="message-detail-title"
          >
            <div className="message-modal-header">
              <div>
                <span>DETAIL PESAN PELANGGAN</span>
                <h3 id="message-detail-title">Informasi Pesan</h3>
              </div>
              <button
                onClick={() => setSelectedMessage(null)}
                disabled={actionLoading}
                aria-label="Tutup detail"
              >
                <X size={20} />
              </button>
            </div>

            <div className="message-detail-body">
              <div className="message-detail-subject">
                <span>SUBJEK PESAN</span>
                <h4>{selectedMessage.subject}</h4>
                <span className={`message-status ${selectedMessage.status}`}>
                  {getStatusLabel(selectedMessage.status)}
                </span>
              </div>

              <div className="message-detail-grid">
                <div>
                  <UserRound size={16} />
                  <span>
                    <small>Nama Pengirim</small>
                    <strong>{selectedMessage.name}</strong>
                  </span>
                </div>
                <div>
                  <Mail size={16} />
                  <span>
                    <small>Email</small>
                    <strong>{selectedMessage.email}</strong>
                  </span>
                </div>
                <div>
                  <Phone size={16} />
                  <span>
                    <small>WhatsApp</small>
                    <strong>{selectedMessage.whatsapp}</strong>
                  </span>
                </div>
                <div>
                  <CalendarDays size={16} />
                  <span>
                    <small>Dikirim Pada</small>
                    <strong>{formatDate(selectedMessage.created_at)}</strong>
                  </span>
                </div>
                {selectedMessage.read_at && (
                  <div>
                    <Eye size={16} />
                    <span>
                      <small>Dibaca Pada</small>
                      <strong>{formatDate(selectedMessage.read_at)}</strong>
                    </span>
                  </div>
                )}
                {selectedMessage.replied_at && (
                  <div>
                    <Clock3 size={16} />
                    <span>
                      <small>Dibalas Pada</small>
                      <strong>{formatDate(selectedMessage.replied_at)}</strong>
                    </span>
                  </div>
                )}
              </div>

              <div className="message-content-box">
                <span>ISI PESAN</span>
                <p>{selectedMessage.message}</p>
              </div>

              <div className="message-contact-actions">
                <a
                  href={`mailto:${selectedMessage.email}?subject=${encodeURIComponent(
                    `Re: ${selectedMessage.subject}`
                  )}`}
                >
                  <Mail size={16} />
                  Balas Email
                  <ExternalLink size={13} />
                </a>
                <a
                  href={getWhatsAppLink(
                    selectedMessage.whatsapp,
                    `Halo ${selectedMessage.name}, terima kasih telah menghubungi Mamras Clean. Kami ingin menanggapi pesan Anda mengenai: ${selectedMessage.subject}`
                  )}
                  target="_blank"
                  rel="noreferrer"
                >
                  <MessageSquare size={16} />
                  Hubungi WhatsApp
                  <ExternalLink size={13} />
                </a>
              </div>
            </div>

            <div className="message-modal-footer">
              <button
                className="message-modal-delete"
                onClick={() => deleteMessage(selectedMessage)}
                disabled={actionLoading}
              >
                <Trash2 size={16} />
                Hapus
              </button>

              {selectedMessage.status !== "replied" && (
                <button
                  className="message-modal-primary"
                  onClick={() => updateStatus("replied")}
                  disabled={actionLoading}
                >
                  <CheckCircle2 size={16} />
                  {actionLoading ? "Memproses..." : "Tandai Sudah Dibalas"}
                </button>
              )}

              {selectedMessage.status === "replied" && (
                <button
                  className="message-modal-primary"
                  onClick={() => setSelectedMessage(null)}
                >
                  Tutup
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
import { useEffect, useState } from "react";
import {
  Search, RefreshCw, Eye, X, CalendarDays, Clock3,
  MapPin, Phone, UserRound, ClipboardList, MessageCircle,
  Save, ChevronLeft, ChevronRight, LoaderCircle,
  PackageCheck, CheckCircle2, CircleDashed, Ban, Wallet
} from "lucide-react";
import "./OrderManagement.css";

const API = "/api/admin/orders";

const statuses = [
  { value: "pending_confirmation", label: "Menunggu Konfirmasi" },
  { value: "confirmed", label: "Dikonfirmasi" },
  { value: "processing", label: "Diproses" },
  { value: "completed", label: "Selesai" },
  { value: "cancelled", label: "Dibatalkan" }
];

const statusLabels = Object.fromEntries(
  statuses.map((item) => [item.value, item.label])
);

function getHeaders(json = false) {
  const token = sessionStorage.getItem("mamras_clean_admin_token");

  if (!token) {
    throw new Error("Sesi admin tidak ditemukan. Silakan login kembali.");
  }

  return {
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
    ...(json ? { "Content-Type": "application/json" } : {})
  };
}

async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getHeaders(Boolean(options.body)),
      ...options.headers
    }
  });

  const result = await response.json().catch(() => ({}));

  if (response.status === 401 || response.status === 403) {
    if (response.status === 401) {
      sessionStorage.removeItem("mamras_clean_admin_token");
      sessionStorage.removeItem("mamras_clean_admin_user");
      window.location.replace("/admin/login");
    }
  }

  if (!response.ok) {
    const validation = result.errors
      ? Object.values(result.errors).flat().join(" ")
      : "";

    throw new Error(
      validation || result.message || "Permintaan gagal diproses."
    );
  }

  return result;
}

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(`${String(value).slice(0, 10)}T12:00:00`);

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(date);
}

function formatPrice(value) {
  if (value === null || value === undefined || value === "") {
    return "Harga belum tercatat";
  }

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(Number(value));
}

function whatsappLink(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  const normalized = digits.startsWith("0")
    ? `62${digits.slice(1)}`
    : digits;

  return normalized ? `https://wa.me/${normalized}` : null;
}

export default function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0
  });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    status: "",
    admin_notes: ""
  });

  async function loadOrders(targetPage = page) {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({ page: String(targetPage) });

      if (statusFilter) params.set("status", statusFilter);
      if (search.trim()) params.set("search", search.trim());

      const result = await apiRequest(`${API}?${params.toString()}`);
      const data = result.data || {};

      setOrders(Array.isArray(data.data) ? data.data : []);
      setSummary(result.summary || {});
      setPagination({
        current_page: data.current_page || 1,
        last_page: data.last_page || 1,
        total: data.total || 0
      });
    } catch (err) {
      setError(err.message || "Gagal mengambil daftar pesanan.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders(page);
  }, [page, statusFilter, search]);

  function openDetail(order) {
    setSelectedOrder(order);
    setEditForm({
      status: order.status || "pending_confirmation",
      admin_notes: order.admin_notes ?? ""
    });
    setNotice("");
  }

  async function saveOrder(event) {
    event.preventDefault();

    if (!selectedOrder) return;

    setSaving(true);
    setNotice("");

    try {
      const result = await apiRequest(`${API}/${selectedOrder.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          status: editForm.status,
          admin_notes: editForm.admin_notes.trim() || null
        })
      });

      setNotice(result.message || "Pesanan berhasil diperbarui.");
      setSelectedOrder(result.data);
      setEditForm({
        status: result.data.status,
        admin_notes: result.data.admin_notes ?? ""
      });

      await loadOrders(page);
    } catch (err) {
      setNotice(err.message || "Gagal memperbarui pesanan.");
    } finally {
      setSaving(false);
    }
  }

  function searchOrders(event) {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

  const summaryCards = [
    { label: "Total Pesanan", value: summary.total ?? 0, icon: ClipboardList, color: "blue" },
    { label: "Menunggu Konfirmasi", value: summary.pending ?? 0, icon: CircleDashed, color: "orange" },
    { label: "Sedang Diproses", value: summary.processing ?? 0, icon: PackageCheck, color: "purple" },
    { label: "Selesai", value: summary.completed ?? 0, icon: CheckCircle2, color: "green" }
  ];

  return (
    <section className="admin-orders">
      <div className="admin-orders-intro">
        <div>
          <span className="admin-orders-eyebrow">OPERASIONAL MAMRAS CLEAN</span>
          <h2>Manajemen Pesanan</h2>
          <p>Kelola permintaan layanan dan perkembangan pesanan pelanggan.</p>
        </div>

        <button
          type="button"
          className="admin-orders-refresh"
          onClick={() => loadOrders(page)}
          disabled={loading}
        >
          <RefreshCw size={16} />
          Perbarui
        </button>
      </div>

      <div className="admin-orders-summary">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <article className="admin-orders-stat" key={card.label}>
              <span className={`admin-orders-stat-icon ${card.color}`}>
                <Icon size={20} />
              </span>
              <div>
                <span>{card.label}</span>
                <strong>{card.value}</strong>
              </div>
            </article>
          );
        })}
      </div>

      <div className="admin-orders-panel">
        <div className="admin-orders-panel-heading">
          <div>
            <h3>Daftar Pesanan</h3>
            <p>{pagination.total} pesanan tercatat</p>
          </div>
        </div>

        <div className="admin-orders-toolbar">
          <form className="admin-orders-search" onSubmit={searchOrders}>
            <Search size={18} />
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Cari nomor, nama, WhatsApp, layanan..."
            />
            <button type="submit">Cari</button>
          </form>

          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setPage(1);
            }}
            aria-label="Filter status pesanan"
          >
            <option value="">Semua Status</option>
            {statuses.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        {error && <div className="admin-orders-error">{error}</div>}

        {loading ? (
          <div className="admin-orders-loading">
            <LoaderCircle size={26} />
            <span>Memuat data pesanan...</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="admin-orders-empty">
            <ClipboardList size={38} />
            <h3>Belum ada pesanan</h3>
            <p>Pesanan pelanggan akan muncul di halaman ini.</p>
          </div>
        ) : (
          <div className="admin-orders-table-wrap">
            <table className="admin-orders-table">
              <thead>
                <tr>
                  <th>Nomor Pesanan</th>
                  <th>Pelanggan</th>
                  <th>Layanan</th>
                  <th>Jadwal</th>
                  <th>Status</th>
                  <th>Harga Layanan</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <strong>{order.order_number}</strong>
                      <small>Dibuat {formatDate(order.created_at)}</small>
                    </td>
                    <td>
                      <strong>{order.customer_name}</strong>
                      <small>{order.customer_whatsapp}</small>
                    </td>
                    <td>{order.service_title}</td>
                    <td>
                      <strong>{formatDate(order.requested_date)}</strong>
                      <small>{String(order.requested_time || "").slice(0, 5)} WIT</small>
                    </td>
                    <td>
                      <span className={`admin-order-status ${order.status}`}>
                        {statusLabels[order.status] || order.status}
                      </span>
                    </td>
                    <td>{formatPrice(order.service_price)}</td>
                    <td>
                      <button
                        type="button"
                        className="admin-order-detail-button"
                        onClick={() => openDetail(order)}
                      >
                        <Eye size={15} />
                        Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="admin-orders-pagination">
          <span>
            Halaman {pagination.current_page} dari {pagination.last_page}
          </span>
          <div>
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              aria-label="Halaman sebelumnya"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              disabled={page >= pagination.last_page || loading}
              onClick={() => setPage((value) => value + 1)}
              aria-label="Halaman berikutnya"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {selectedOrder && (
        <div
          className="admin-order-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedOrder(null);
          }}
        >
          <section className="admin-order-modal" role="dialog" aria-modal="true">
            <header>
              <div>
                <span>DETAIL TRANSAKSI</span>
                <h2>{selectedOrder.order_number}</h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                aria-label="Tutup detail"
              >
                <X size={21} />
              </button>
            </header>

            <div className="admin-order-modal-body">
              <div className="admin-order-customer">
                <span className="admin-order-customer-avatar">
                  <UserRound size={24} />
                </span>
                <div>
                  <strong>{selectedOrder.customer_name}</strong>
                  <span>{selectedOrder.customer_whatsapp}</span>
                </div>
                {whatsappLink(selectedOrder.customer_whatsapp) && (
                  <a
                    href={whatsappLink(selectedOrder.customer_whatsapp)}
                    target="_blank"
                    rel="noreferrer"
                    className="admin-order-whatsapp"
                  >
                    <MessageCircle size={16} />
                    WhatsApp
                  </a>
                )}
              </div>

              <div className="admin-order-information">
                <div>
                  <ClipboardList size={17} />
                  <span>
                    <small>Layanan</small>
                    <strong>{selectedOrder.service_title}</strong>
                  </span>
                </div>
                <div>
                  <Wallet size={17} />
                  <span>
                    <small>Harga layanan saat pemesanan</small>
                    <strong>{formatPrice(selectedOrder.service_price)}</strong>
                  </span>
                </div>
                <div>
                  <CalendarDays size={17} />
                  <span>
                    <small>Tanggal layanan</small>
                    <strong>{formatDate(selectedOrder.requested_date)}</strong>
                  </span>
                </div>
                <div>
                  <Clock3 size={17} />
                  <span>
                    <small>Waktu layanan</small>
                    <strong>{String(selectedOrder.requested_time || "").slice(0, 5)} WIT</strong>
                  </span>
                </div>
                <div>
                  <MapPin size={17} />
                  <span>
                    <small>Alamat pelanggan</small>
                    <strong>{selectedOrder.address}</strong>
                  </span>
                </div>
              </div>

              <div className="admin-order-customer-notes">
                <strong>Detail kebutuhan pelanggan</strong>
                <p>{selectedOrder.details || "Tidak ada catatan tambahan."}</p>
              </div>

              <form className="admin-order-edit-form" onSubmit={saveOrder}>
                <h3>Kelola Pesanan</h3>

                <label>
                  Status Pesanan
                  <select
                    value={editForm.status}
                    onChange={(event) =>
                      setEditForm((value) => ({ ...value, status: event.target.value }))
                    }
                  >
                    {statuses.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>


                <label>
                  Catatan Admin
                  <textarea
                    rows="3"
                    value={editForm.admin_notes}
                    onChange={(event) =>
                      setEditForm((value) => ({ ...value, admin_notes: event.target.value }))
                    }
                    placeholder="Catatan internal untuk pengelolaan pesanan..."
                  />
                </label>

                {notice && <div className="admin-order-notice">{notice}</div>}

                <button
                  type="submit"
                  className="admin-order-save"
                  disabled={saving}
                >
                  {saving ? <LoaderCircle size={17} /> : <Save size={17} />}
                  {saving ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </form>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}
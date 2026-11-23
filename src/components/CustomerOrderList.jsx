import { useEffect, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  Clock3,
  ClipboardList,
  History,
  LoaderCircle,
  MapPin,
  RefreshCw,
  XCircle,
  Wallet
} from "lucide-react";

import {
  getCustomerOrders,
  cancelCustomerOrder
} from "../utils/customerOrderApi";

const statusInfo = {
  pending_confirmation: {
    label: "Menunggu Konfirmasi",
    className: "pending"
  },
  confirmed: {
    label: "Dikonfirmasi",
    className: "confirmed"
  },
  processing: {
    label: "Sedang Diproses",
    className: "processing"
  },
  completed: {
    label: "Selesai",
    className: "completed"
  },
  cancelled: {
    label: "Dibatalkan",
    className: "cancelled"
  }
};

function formatDate(value) {
  if (!value) return "-";

  const dateOnly = String(value).slice(0, 10);
  const date = new Date(`${dateOnly}T12:00:00`);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
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

function CustomerOrderList({ isHistory = false, onCreateOrder }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState(null);
  const [notice, setNotice] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0
  });

  async function loadOrders(requestedPage = page) {
    setLoading(true);
    setError("");

    try {
      const result = await getCustomerOrders(
        requestedPage,
        isHistory ? "history" : "active"
      );

      const responseData = result.data || {};

      setOrders(responseData.data || []);
      setPagination({
        current_page: responseData.current_page || 1,
        last_page: responseData.last_page || 1,
        total: responseData.total || 0
      });
    } catch (err) {
      setError(err.message || "Daftar pesanan gagal dimuat.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders(page);
  }, [isHistory, page]);

  async function handleCancel(order) {
    const confirmed = window.confirm(
      `Apakah Anda yakin ingin membatalkan pesanan ${order.order_number}?`
    );

    if (!confirmed) return;

    setActionId(order.id);
    setNotice("");
    setError("");

    try {
      const result = await cancelCustomerOrder(order.id);
      setNotice(result.message || "Pesanan berhasil dibatalkan.");
      await loadOrders(page);
    } catch (err) {
      setError(err.message || "Pesanan gagal dibatalkan.");
    } finally {
      setActionId(null);
    }
  }

  return (
    <section className="mc-portal-content-card mc-order-list-page">
      <div className="mc-portal-page-heading">
        <span>{isHistory ? "ARSIP PEMESANAN" : "AREA PEMESANAN"}</span>
        <h1>{isHistory ? "Riwayat Pesanan" : "Pesanan Saya"}</h1>
        <p>
          {isHistory
            ? "Lihat kembali pesanan yang sudah selesai atau dibatalkan."
            : "Pantau perkembangan permintaan layanan kebersihan Anda."}
        </p>
      </div>

      {notice && (
        <div className="mc-order-list-notice success">
          <ClipboardList size={18} />
          {notice}
        </div>
      )}

      {error && (
        <div className="mc-order-list-notice error">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {loading ? (
        <div className="mc-portal-empty">
          <LoaderCircle className="mc-portal-spinner" size={30} />
          <p>Memuat data pesanan...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className={`mc-portal-empty ${isHistory ? "mc-portal-history-empty" : "mc-portal-orders-empty"}`}>
          {isHistory ? <History size={38} /> : <ClipboardList size={38} />}
          <h3>
            {isHistory
              ? "Belum Ada Riwayat Pesanan"
              : "Belum Ada Pesanan Aktif"}
          </h3>
          <p>
            {isHistory
              ? "Pesanan yang selesai atau dibatalkan akan muncul di halaman ini."
              : "Anda belum memiliki pesanan. Silakan pilih layanan dan buat permintaan pemesanan."}
          </p>

          {!isHistory && (
            <button
              type="button"
              className="mc-portal-primary-link"
              onClick={onCreateOrder}
            >
              Buat Pesanan Sekarang
            </button>
          )}
        </div>
      ) : (
        <div className="mc-order-list">
          {orders.map((order) => {
            const status = statusInfo[order.status] || {
              label: order.status,
              className: "pending"
            };

            const canCancel = [
              "pending_confirmation",
              "confirmed"
            ].includes(order.status);

            return (
              <article className="mc-order-card" key={order.id}>
                <div className="mc-order-card-header">
                  <div>
                    <span className="mc-order-number-label">NOMOR PESANAN</span>
                    <strong className="mc-order-number">
                      {order.order_number}
                    </strong>
                  </div>
                  <span className={`mc-order-status ${status.className}`}>
                    {status.label}
                  </span>
                </div>

                <div className="mc-order-card-body">
                  <h2>{order.service_title}</h2>

                  <div className="mc-order-detail-grid">
                    <div>
                      <CalendarDays size={17} />
                      <span>{formatDate(order.requested_date)}</span>
                    </div>

                    <div>
                      <Clock3 size={17} />
                      <span>{String(order.requested_time || "-").slice(0, 5)} WIT</span>
                    </div>

                    <div>
                      <MapPin size={17} />
                      <span>{order.address}</span>
                    </div>
                  </div>

                  {order.details && (
                    <div className="mc-order-customer-details">
                      <strong>Catatan pesanan</strong>
                      <p>{order.details}</p>
                    </div>
                  )}
                </div>

                <div className="mc-order-card-footer">
                  <div className="mc-order-price">
                    <Wallet size={17} />
                    <div>
                      <small>Harga layanan</small>
                      <strong>{formatPrice(order.service_price)}</strong>
                    </div>
                  </div>

                  {canCancel && (
                    <button
                      type="button"
                      className="mc-order-cancel-button"
                      onClick={() => handleCancel(order)}
                      disabled={actionId === order.id}
                    >
                      {actionId === order.id ? (
                        <LoaderCircle className="mc-order-spinner" size={16} />
                      ) : (
                        <XCircle size={16} />
                      )}
                      Batalkan Pesanan
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {!loading && pagination.last_page > 1 && (
        <div className="mc-order-pagination">
          <span>
            Halaman {pagination.current_page} dari {pagination.last_page}
            {" · "}{pagination.total} pesanan
          </span>

          <div>
            <button
              type="button"
              disabled={pagination.current_page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              Sebelumnya
            </button>

            <button
              type="button"
              disabled={pagination.current_page >= pagination.last_page}
              onClick={() => setPage((current) => Math.min(pagination.last_page, current + 1))}
            >
              Berikutnya
            </button>
          </div>
        </div>
      )}

      {!loading && (
        <button
          type="button"
          className="mc-order-refresh-button"
          onClick={() => loadOrders(page)}
        >
          <RefreshCw size={16} />
          Muat Ulang
        </button>
      )}
    </section>
  );
}

export default CustomerOrderList;
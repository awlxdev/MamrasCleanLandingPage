import { useEffect, useState } from "react";
import "./AdSection.css";

const formatRupiah = (value) => {
  const amount = Number(value);

  if (!Number.isFinite(amount) || amount <= 0) {
    return null;
  }

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function AdSection({ slot = 1 }) {
  const [ads, setAds] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadAds() {
      setLoading(true);

      try {
        const response = await fetch(`/api/ads?slot=${slot}`);

        if (!response.ok) {
          throw new Error("Gagal mengambil daftar iklan.");
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.message || "Data iklan tidak tersedia.");
        }

        const availableAds = Array.isArray(result.data)
          ? result.data.filter((ad) => ad.is_active && ad.image_url)
          : [];

        if (isMounted) {
          setAds(availableAds);
          setActiveIndex(0);
        }
      } catch (error) {
        console.error(`AdSection Slot ${slot}:`, error);

        if (isMounted) {
          setAds([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadAds();

    return () => {
      isMounted = false;
    };
  }, [slot]);

  if (loading || ads.length === 0) {
    return null;
  }

  const activeAd = ads[activeIndex];

  const normalPrice = Number(activeAd.normal_price || 0);
  const promoPrice = Number(activeAd.promo_price || 0);

  const hasDiscount =
    normalPrice > 0 &&
    promoPrice > 0 &&
    promoPrice < normalPrice;

  const normalPriceText = formatRupiah(normalPrice);
  const promoPriceText = formatRupiah(promoPrice);

  const previousAd = () => {
    setActiveIndex((current) =>
      current === 0 ? ads.length - 1 : current - 1
    );
  };

  const nextAd = () => {
    setActiveIndex((current) =>
      current === ads.length - 1 ? 0 : current + 1
    );
  };

  return (
    <section
      className={`public-ad-section public-ad-slot-${slot}`}
      aria-label={`Penawaran Mamras Clean Slot ${slot}`}
    >
      <div className="public-ad-container">
        <div className="public-ad-heading">
          <span className="public-ad-eyebrow">MAMRAS CLEAN</span>
          <h2>Penawaran Spesial</h2>
          <p>Temukan informasi dan penawaran menarik dari kami.</p>
        </div>

        <div className="public-ad-carousel">
          <article className="public-ad-card" key={activeAd.id}>
            <div className="public-ad-image">
              <img
                src={activeAd.image_url}
                alt={activeAd.title || "Penawaran Mamras Clean"}
                loading="lazy"
              />

              {hasDiscount && activeAd.discount_percentage > 0 && (
                <span className="public-ad-discount">
                  Hemat {Math.round(activeAd.discount_percentage)}%
                </span>
              )}
            </div>

            <div className="public-ad-content">
              {activeAd.title && <h3>{activeAd.title}</h3>}

              {activeAd.description && <p>{activeAd.description}</p>}

              {(normalPriceText || promoPriceText) && (
                <div className="public-ad-pricing">
                  {hasDiscount && normalPriceText && (
                    <span className="public-ad-normal-price">
                      {normalPriceText}
                    </span>
                  )}

                  {promoPriceText && (
                    <strong className="public-ad-promo-price">
                      {promoPriceText}
                    </strong>
                  )}

                  {!hasDiscount && normalPriceText && !promoPriceText && (
                    <strong className="public-ad-promo-price">
                      {normalPriceText}
                    </strong>
                  )}
                </div>
              )}

              {activeAd.button_text && activeAd.button_url && (
                <a
                  className="public-ad-button"
                  href={activeAd.button_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {activeAd.button_text}
                  <span aria-hidden="true">→</span>
                </a>
              )}
            </div>
          </article>

          {ads.length > 1 && (
            <div className="public-ad-navigation">
              <button
                type="button"
                className="public-ad-arrow"
                onClick={previousAd}
                aria-label="Iklan sebelumnya"
              >
                ‹
              </button>

              <div className="public-ad-indicators">
                {ads.map((ad, index) => (
                  <button
                    type="button"
                    key={ad.id}
                    className={`public-ad-indicator ${
                      index === activeIndex ? "active" : ""
                    }`}
                    onClick={() => setActiveIndex(index)}
                    aria-label={`Tampilkan iklan ${index + 1}`}
                    aria-current={index === activeIndex ? "true" : undefined}
                  />
                ))}
              </div>

              <button
                type="button"
                className="public-ad-arrow"
                onClick={nextAd}
                aria-label="Iklan berikutnya"
              >
                ›
              </button>
            </div>
          )}

          {ads.length > 1 && (
            <span className="public-ad-counter">
              {activeIndex + 1} / {ads.length}
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
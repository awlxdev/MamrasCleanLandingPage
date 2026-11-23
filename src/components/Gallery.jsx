import { useEffect, useState } from "react";
import { Images, Camera, MessageCircle, X, ZoomIn } from "lucide-react";
const galleryAnimationStyles = `
  @keyframes galleryFadeUp {
    from {
      opacity: 0;
      transform: translateY(25px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .gallery-section article {
      animation: none !important;
      transition: none !important;
    }
  }
`;

export default function Gallery() {
    const [galleries, setGalleries] = useState([]);
    const [selectedGallery, setSelectedGallery] = useState(null);

    useEffect(() => {
        const controller = new AbortController();

        async function fetchGalleries() {
            try {
                const response = await fetch("/api/galleries", {
                    signal: controller.signal,
                });

                if (!response.ok) {
                    throw new Error("Gagal mengambil data galeri.");
                }

                const result = await response.json();

                if (result.success && Array.isArray(result.data)) {
                    setGalleries(result.data);
                }
            } catch (error) {
                if (error.name !== "AbortError") {
                    console.error("Gagal memuat galeri:", error);
                }
            }
        }

        fetchGalleries();

        return () => controller.abort();
    }, []);

    useEffect(() => {
        if (!selectedGallery) return;

        function handleEscape(event) {
            if (event.key === "Escape") {
                setSelectedGallery(null);
            }
        }

        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("keydown", handleEscape);
        };
    }, [selectedGallery]);

    return (
        <section className="section gallery-section" id="dokumentasi">
            <style>{galleryAnimationStyles}</style>
            <div className="container">
                <div className="section-heading">
                    <span className="eyebrow eyebrow-green">GALERI MAMRAS CLEAN</span>
                    <h2>
                        Dokumentasi <span>Kegiatan Kami.</span>
                    </h2>
                    <p>
                        Kenali aktivitas dan hasil pekerjaan Mamras Clean melalui
                        dokumentasi layanan kami.
                    </p>
                </div>

                {galleries.length > 0 ? (
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(auto-fit, minmax(min(100%, 220px), 260px))",
                            justifyContent: "center",
                            gap: "18px",
                            width: "100%",
                        }}
                    >
                        {galleries.map((gallery, index) => (
                            <article
                                key={gallery.id}
                                style={{
                                    overflow: "hidden",
                                    background: "#FFFFFF",
                                    borderRadius: "14px",
                                    border: "1px solid #E5EBE7",
                                    boxShadow: "0 4px 16px rgba(0,0,0,0.05)",
                                    animation: "galleryFadeUp 0.6s ease both",
                                    animationDelay: `${(index % 8) * 100}ms`,
                                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                                }}
                                onMouseEnter={(event) => {
                                    event.currentTarget.style.transform = "translateY(-7px)";
                                    event.currentTarget.style.boxShadow =
                                        "0 12px 28px rgba(11,42,111,0.13)";
                                }}
                                onMouseLeave={(event) => {
                                    event.currentTarget.style.transform = "translateY(0)";
                                    event.currentTarget.style.boxShadow =
                                        "0 4px 16px rgba(0,0,0,0.05)";
                                }}
                            >
                                <button
                                    type="button"
                                    onClick={() => setSelectedGallery(gallery)}
                                    aria-label={`Lihat foto ${gallery.title}`}
                                    style={{
                                        display: "block",
                                        position: "relative",
                                        width: "100%",
                                        padding: 0,
                                        border: "none",
                                        background: "#F4F7F5",
                                        cursor: "zoom-in",
                                        overflow: "hidden",
                                    }}
                                >
                                    <img
                                        src={gallery.image_url}
                                        alt={gallery.title}
                                        loading="lazy"
                                        style={{
                                            display: "block",
                                            width: "100%",
                                            height: "175px",
                                            objectFit: "cover",
                                            transition: "transform 0.5s ease",
                                        }}
                                        onMouseEnter={(event) => {
                                            event.currentTarget.style.transform = "scale(1.07)";
                                        }}
                                        onMouseLeave={(event) => {
                                            event.currentTarget.style.transform = "scale(1)";
                                        }}
                                        onError={(event) => {
                                            event.currentTarget.style.opacity = "0.3";
                                        }}
                                    />

                                    <span
                                        style={{
                                            position: "absolute",
                                            right: "10px",
                                            bottom: "10px",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "5px",
                                            padding: "7px 10px",
                                            borderRadius: "20px",
                                            color: "#FFFFFF",
                                            background: "rgba(11,42,111,0.85)",
                                            fontSize: "11px",
                                        }}
                                    >
                                        <ZoomIn size={14} />
                                        Lihat foto
                                    </span>
                                </button>

                                <div style={{ padding: "13px 15px 15px" }}>
                                    <h3
                                        style={{
                                            color: "#0B2A6F",
                                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                                            fontSize: "15px",
                                            fontWeight: 700,
                                            margin: "0 0 6px",
                                        }}
                                    >
                                        {gallery.title}
                                    </h3>

                                    {gallery.description && (
                                        <p
                                            style={{
                                                color: "#5B6B8C",
                                                fontSize: "12px",
                                                lineHeight: 1.6,
                                                margin: 0,
                                            }}
                                        >
                                            {gallery.description}
                                        </p>
                                    )}
                                </div>
                            </article>
                        ))}
                    </div>
                ) : (
                    <div className="gallery-empty">
                        <div className="gallery-empty-icon">
                            <Images size={36} />
                        </div>
                        <h3>Dokumentasi segera hadir</h3>
                        <p>
                            Foto kegiatan dan hasil pekerjaan Mamras Clean akan ditampilkan
                            di area ini.
                        </p>
                        <span className="gallery-hint">
                            <Camera size={15} /> Tambahkan foto melalui halaman admin.
                        </span>
                    </div>
                )}

                <div className="gallery-contact">
                    <span>Punya pertanyaan tentang hasil pekerjaan kami?</span>
                    <a
                        href="https://wa.me/6282188558026"
                        target="_blank"
                        rel="noreferrer">
                        <MessageCircle size={17} /> Hubungi Mamras Clean
                    </a>
                </div>
            </div>

            {selectedGallery && (
                <div
                    onClick={() => setSelectedGallery(null)}
                    style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 9999,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "20px",
                        background: "rgba(0,0,0,0.88)",
                    }}
                >
                    <button
                        type="button"
                        onClick={() => setSelectedGallery(null)}
                        aria-label="Tutup foto"
                        style={{
                            position: "absolute",
                            top: "20px",
                            right: "20px",
                            width: "42px",
                            height: "42px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "none",
                            borderRadius: "50%",
                            color: "#FFFFFF",
                            background: "rgba(255,255,255,0.15)",
                            cursor: "pointer",
                        }}
                    >
                        <X size={23} />
                    </button>

                    <div
                        onClick={(event) => event.stopPropagation()}
                        style={{
                            width: "100%",
                            maxWidth: "950px",
                            textAlign: "center",
                        }}
                    >
                        <img
                            src={selectedGallery.image_url}
                            alt={selectedGallery.title}
                            style={{
                                display: "block",
                                maxWidth: "100%",
                                maxHeight: "78vh",
                                width: "auto",
                                height: "auto",
                                objectFit: "contain",
                                margin: "0 auto",
                                borderRadius: "10px",
                            }}
                        />

                        <h3
                            style={{
                                color: "#FFFFFF",
                                fontSize: "17px",
                                margin: "15px 0 5px",
                            }}
                        >
                            {selectedGallery.title}
                        </h3>

                        {selectedGallery.description && (
                            <p
                                style={{
                                    color: "#D9E1EA",
                                    fontSize: "13px",
                                    margin: 0,
                                }}
                            >
                                {selectedGallery.description}
                            </p>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
}





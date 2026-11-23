import { useEffect, useState } from "react";
import {
  Home,
  Building2,
  Sparkles,
  SprayCan,
  ArrowUpRight,
  Brush,
  Sofa,
  Wind,
  Droplets,
  House,
  Store,
  Building,
  Waves,
} from "lucide-react";

const iconMap = {
  Home,
  Building2,
  Sparkles,
  SprayCan,
  Brush,
  Sofa,
  Wind,
  Droplets,
  House,
  Store,
  Building,
  Waves,
};

export default function Services() {
  const [services, setServices] = useState([]);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchServices() {
      try {
        const response = await fetch("/api/services", {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Gagal mengambil data layanan.");
        }

        const result = await response.json();

        if (result.success && Array.isArray(result.data)) {
          setServices(
            result.data.filter((service) => service.is_active !== false)
          );
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Gagal memuat layanan:", error);
        }
      }
    }

    fetchServices();

    return () => controller.abort();
  }, []);

  return (
    <section className="section services-section" id="layanan">
      <div className="container">
        <div className="section-heading">
          <span className="eyebrow eyebrow-green">APA YANG KAMI TAWARKAN</span>
          <h2>Layanan untuk Ruang <span>Lebih Bersih.</span></h2>
          <p>
            Setiap ruang memiliki kebutuhan berbeda. Temukan solusi
            kebersihan yang sesuai dengan kebutuhan Anda.
          </p>
        </div>

        <div className="services-grid">
          {services.map((service, index) => {
            const Icon = iconMap[service.icon] || Sparkles;
            const number = String(index + 1).padStart(2, "0");

            return (
              <article className="service-card" key={service.id}>
                <div className="service-card-top">
                  <div className="service-icon">
                    <Icon size={27} />
                  </div>
                  <span className="service-number">{number}</span>
                </div>

                <h3>{service.title}</h3>
                <p>{service.description}</p>

                <button
                  type="button"
                  className="service-link"
                  onClick={() => {
                    const token = sessionStorage.getItem("mamras_clean_user_token");

                    if (!token) {
                      window.dispatchEvent(new Event("mamras:require-auth"));
                      return;
                    }

                    const message = encodeURIComponent(
                      "Halo Mamras Clean, saya ingin bertanya tentang " +
                        service.title +
                        "."
                    );

                    window.open(
                      `https://wa.me/6282188558026?text=${message}`,
                      "_blank",
                      "noopener,noreferrer"
                    );
                  }}
                >
                  Tanya layanan <ArrowUpRight size={17} />
                </button>
              </article>
            );
          })}
        </div>

        <p className="service-note">
          *Jenis layanan dan cakupan pekerjaan dapat dikonfirmasi langsung
          melalui WhatsApp.
        </p>
      </div>
    </section>
  );
}

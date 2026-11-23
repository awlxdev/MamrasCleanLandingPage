import {
  ArrowRight,
  Brush,
  Droplets,
  Home,
  MessageCircle,
  Sparkles,
  SprayCan,
  Wind,
} from "lucide-react";

const whatsappUrl =
  "https://wa.me/6282188558026?text=" +
  encodeURIComponent(
    "Halo Mamras Clean, saya ingin bertanya tentang layanan kebersihan."
  );

export default function Hero() {
  return (
    <section className="hero" id="beranda">
      <div className="hero-background-overlay" aria-hidden="true" />

      <div className="container hero-layout">
        <div className="hero-cleaning-visual" aria-label="Ikon layanan kebersihan">
          <div className="hero-glass-orbit hero-orbit-one" />
          <div className="hero-glass-orbit hero-orbit-two" />

          <div className="hero-glass-icon hero-glass-main">
            <Sparkles size={43} />
            <span>Fresh & Clean</span>
          </div>

          <div className="hero-glass-icon hero-glass-spray">
            <SprayCan size={30} />
            <span>Cleaning</span>
          </div>

          <div className="hero-glass-icon hero-glass-water">
            <Droplets size={30} />
            <span>Hygiene</span>
          </div>

          <div className="hero-glass-icon hero-glass-brush">
            <Brush size={29} />
            <span>Detail</span>
          </div>

          <div className="hero-glass-icon hero-glass-home">
            <Home size={27} />
          </div>

          <div className="hero-glass-icon hero-glass-wind">
            <Wind size={25} />
          </div>
        </div>

        <div className="hero-content-panel">
          <div className="hero-eyebrow">
            <Sparkles size={16} />
            <span>JASA KEBERSIHAN KAIMANA</span>
          </div>

          <h1>
            Ruang Bersih,
            <span> Hidup Nyaman.</span>
          </h1>

          <p className="hero-description">
            Solusi kebersihan rumah dan ruang usaha Anda di Kaimana.
          </p>

          <div className="hero-actions">
            <a
              className="button button-green button-large"
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle size={18} />
              Chat WhatsApp
            </a>

            <a
              className="button button-outline button-large hero-services-button"
              href="#layanan"
            >
              Lihat Layanan
              <ArrowRight size={18} />
            </a>
          </div>

          <div className="hero-trust">
            <span>
              <Home size={16} />
              Rumah & ruang usaha
            </span>
            <span>
              <Droplets size={16} />
              Kaimana, Papua Barat
            </span>
          </div>
        </div>
      </div>

      <div className="hero-bottom-accent" aria-hidden="true" />
    </section>
  );
}

import {
  Mail, MapPin, Phone, MessageCircle, ArrowUp, Sparkles
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-main">
          <div className="footer-brand">
            <a href="#beranda" className="brand footer-brand-link">
              <img
                src="/assets/logo.png"
                alt="Mamras Clean"
                className="brand-logo"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
              <span className="brand-name">
                MAMRAS <strong>CLEAN</strong>
                <small>YOUR CLEANING SOLUTION</small>
              </span>
            </a>
            <p>
              Membantu menciptakan lingkungan yang lebih bersih,
              rapi, dan nyaman untuk Anda.
            </p>
          </div>

          <div className="footer-column">
            <h3>Navigasi</h3>
            <a href="#beranda">Beranda</a>
            <a href="#layanan">Layanan</a>
            <a href="#dokumentasi">Dokumentasi</a>
            <a href="#cara-pesan">Cara Pesan</a>
          </div>

          <div className="footer-column footer-contact">
            <h3>Hubungi Kami</h3>
            <a href="https://wa.me/6282188558026" target="_blank" rel="noreferrer">
              <Phone size={16} /> 0821-8855-8026
            </a>
            <a href="mailto:mamrasclean@gmail.com">
              <Mail size={16} /> mamrasclean@gmail.com
            </a>
            <span><MapPin size={16} /> Kabupaten Kaimana, Papua Barat, Indonesia</span>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Mamras Clean. Hak cipta dilindungi.</span>
          <a href="#beranda" className="back-top" aria-label="Kembali ke atas">
            Kembali ke atas <ArrowUp size={16} />
          </a>
        </div>
      </div>
    </footer>
  );
}


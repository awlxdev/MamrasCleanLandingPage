import { ArrowUpRight, MessageCircle, Sparkles } from "lucide-react";

export default function CTA() {
  return (
    <section className="cta-section" id="kontak">
      <div className="cta-decoration cta-decoration-one" />
      <div className="cta-decoration cta-decoration-two" />
      <div className="container cta-content">
        <div className="cta-icon"><Sparkles size={30} /></div>
        <span className="eyebrow eyebrow-yellow">MULAI DARI SEKARANG</span>
        <h2>Ingin Ruangan Lebih Bersih dan Nyaman?</h2>
        <p>
          Ceritakan kebutuhan kebersihan Anda. Hubungi Mamras Clean
          untuk mendapatkan informasi lebih lanjut.
        </p>
        <a
          href="https://wa.me/6282188558026?text=Halo%20Mamras%20Clean%2C%20saya%20ingin%20konsultasi%20layanan."
          target="_blank"
          rel="noreferrer"
          className="button button-green button-large">
          <MessageCircle size={19} /> Konsultasi via WhatsApp
          <ArrowUpRight size={18} />
        </a>
      </div>
    </section>
  );
}


import {
  MessageCircle, ClipboardList, CalendarDays, CheckCircle2
} from "lucide-react";

const steps = [
  {
    icon: MessageCircle,
    number: "01",
    title: "Hubungi Kami",
    description: "Mulai percakapan dengan Mamras Clean melalui WhatsApp."
  },
  {
    icon: ClipboardList,
    number: "02",
    title: "Ceritakan Kebutuhan",
    description: "Sampaikan jenis pekerjaan dan area yang ingin dibersihkan."
  },
  {
    icon: CalendarDays,
    number: "03",
    title: "Atur Jadwal",
    description: "Diskusikan lokasi, waktu, dan detail pemesanan."
  },
  {
    icon: CheckCircle2,
    number: "04",
    title: "Konfirmasi Pesanan",
    description: "Pastikan detail layanan bersama Mamras Clean."
  }
];

export default function HowToOrder() {
  return (
    <section className="section order-section" id="cara-pesan">
      <div className="container">
        <div className="section-heading">
          <span className="eyebrow eyebrow-blue">MUDAH DAN PRAKTIS</span>
          <h2>Bagaimana Cara <span>Memesan?</span></h2>
          <p>Hanya beberapa langkah untuk memulai konsultasi kebutuhan kebersihan Anda.</p>
        </div>

        <div className="steps-grid">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <article className="step-card" key={step.number}>
                <div className="step-icon"><Icon size={25} /></div>
                <span className="step-number">{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

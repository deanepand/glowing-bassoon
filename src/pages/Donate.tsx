import { Link } from "react-router-dom";
import {
  Heart,
  ArrowLeft,
  ExternalLink,
  Coffee,
  Star,
  Gift,
  Sparkles,
  CircleDollarSign,
  HandHeart,
  Flame,
  Crown,
  Gem,
  ShieldCheck,
  MessageCircleHeart,
} from "lucide-react";

const TRAKTEER_URL = "https://trakteer.id/epandlabs";
const SAWERIA_URL = "https://saweria.co/epandlabs";

const tiers = [
  {
    icon: <Coffee className="h-7 w-7" strokeWidth={2.5} />,
    name: "Kopi",
    amount: "Rp 10.000",
    desc: "Beliin satu gelas kopi biar semangat ngoding.",
    color: "bg-[#ffd166]",
  },
  {
    icon: <Star className="h-7 w-7" strokeWidth={2.5} />,
    name: "Supporter",
    amount: "Rp 25.000",
    desc: "Dukungan yang sangat membantu development EpanDGist.",
    color: "bg-[#06d6a0]",
  },
  {
    icon: <Gem className="h-7 w-7" strokeWidth={2.5} />,
    name: "Premium",
    amount: "Rp 50.000",
    desc: "Level dukungan premium. Kamu the real MVP!",
    color: "bg-[#3a86ff]",
  },
  {
    icon: <Crown className="h-7 w-7" strokeWidth={2.5} />,
    name: "Legend",
    amount: "Rp 100.000+",
    desc: "Dukungan level legend. Nama kamu akan dikenang selamanya.",
    color: "bg-[#8338ec]",
  },
];

const reasons = [
  {
    icon: <Flame className="h-5 w-5" strokeWidth={3} />,
    text: "Server & hosting tetap jalan",
  },
  {
    icon: <Sparkles className="h-5 w-5" strokeWidth={3} />,
    text: "Fitur baru terus dikembangkan",
  },
  {
    icon: <ShieldCheck className="h-5 w-5" strokeWidth={3} />,
    text: "Platform tetap gratis & open",
  },
  {
    icon: <MessageCircleHeart className="h-5 w-5" strokeWidth={3} />,
    text: "Komunitas developer Indonesia makin kuat",
  },
];

export default function Donate() {
  return (
    <div>
      {/* Back button */}
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 border-3 border-black bg-white px-4 py-2 font-bold uppercase text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px]"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={3} />
          Kembali
        </Link>
      </div>

      {/* ===== HERO ===== */}
      <section className="mb-10">
        <div className="border-3 border-black bg-[#ef476f] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
          {/* Decorative top bar */}
          <div className="flex h-2">
            <div className="flex-1 bg-[#ff6b35]" />
            <div className="flex-1 bg-[#ffd166]" />
            <div className="flex-1 bg-[#06d6a0]" />
            <div className="flex-1 bg-[#3a86ff]" />
            <div className="flex-1 bg-[#8338ec]" />
          </div>

          <div className="px-6 sm:px-10 py-10 sm:py-14 text-center">
            <div className="flex justify-center mb-5">
              <div className="flex h-20 w-20 items-center justify-center border-3 border-black bg-white shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
                <HandHeart className="h-10 w-10 text-[#ef476f]" strokeWidth={2.5} />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tight text-white leading-tight">
              Support EpanDGist
            </h1>
            <p className="mt-4 text-lg font-bold text-white/80 max-w-xl mx-auto leading-relaxed">
              EpanDGist dibuat dengan sepenuh hati oleh{" "}
              <span className="text-white underline underline-offset-4 decoration-2 decoration-white/60">
                epandlabs
              </span>
              . Bantu kami terus berkembang dengan dukunganmu!
            </p>
          </div>
        </div>
      </section>

      {/* ===== DONATION PLATFORMS ===== */}
      <section className="mb-10">
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Trakteer Card */}
          <a
            href={TRAKTEER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group block border-3 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[3px] hover:translate-y-[3px]"
          >
            {/* Card header */}
            <div className="flex items-center justify-between border-b-3 border-black bg-[#ff6b35] px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center border-2 border-black bg-white">
                  <Coffee className="h-6 w-6" strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tight text-black">
                    Trakteer
                  </h2>
                  <p className="text-xs font-bold text-black/60 uppercase tracking-wider">
                    trakteer.id/epandlabs
                  </p>
                </div>
              </div>
              <ExternalLink
                className="h-5 w-5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                strokeWidth={3}
              />
            </div>

            {/* Card body */}
            <div className="px-6 py-5">
              <p className="font-bold text-black/60 text-sm leading-relaxed">
                Traktir kami segelas kopi atau makanan lewat Trakteer.
                Platform donasi kreator Indonesia yang mudah dan cepat.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 border-3 border-black bg-[#ff6b35] px-5 py-2.5 font-black uppercase text-sm tracking-wider shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] group-hover:translate-x-[2px] group-hover:translate-y-[2px] transition-all">
                <Coffee className="h-4 w-4" strokeWidth={3} />
                Trakteer Sekarang
                <ExternalLink className="h-3.5 w-3.5" strokeWidth={3} />
              </div>
            </div>
          </a>

          {/* Saweria Card */}
          <a
            href={SAWERIA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group block border-3 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[3px] hover:translate-y-[3px]"
          >
            {/* Card header */}
            <div className="flex items-center justify-between border-b-3 border-black bg-[#ffd166] px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center border-2 border-black bg-white">
                  <CircleDollarSign className="h-6 w-6" strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tight text-black">
                    Saweria
                  </h2>
                  <p className="text-xs font-bold text-black/60 uppercase tracking-wider">
                    saweria.co/epandlabs
                  </p>
                </div>
              </div>
              <ExternalLink
                className="h-5 w-5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                strokeWidth={3}
              />
            </div>

            {/* Card body */}
            <div className="px-6 py-5">
              <p className="font-bold text-black/60 text-sm leading-relaxed">
                Kirim donasi lewat Saweria dengan berbagai metode
                pembayaran. QRIS, transfer bank, e-wallet, semua bisa!
              </p>
              <div className="mt-4 inline-flex items-center gap-2 border-3 border-black bg-[#ffd166] px-5 py-2.5 font-black uppercase text-sm tracking-wider shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] group-hover:translate-x-[2px] group-hover:translate-y-[2px] transition-all">
                <CircleDollarSign className="h-4 w-4" strokeWidth={3} />
                Donasi via Saweria
                <ExternalLink className="h-3.5 w-3.5" strokeWidth={3} />
              </div>
            </div>
          </a>
        </div>
      </section>

      {/* ===== DONATION TIERS ===== */}
      <section className="mb-10">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center border-3 border-black bg-[#8338ec] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <Gift className="h-5 w-5 text-white" strokeWidth={3} />
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tight text-black">
            Pilih Tier Donasi
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {tiers.map((tier, i) => (
            <div
              key={i}
              className="border-3 border-black bg-white shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] transition-all hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[3px] hover:translate-y-[3px]"
            >
              <div
                className={`flex items-center gap-3 border-b-3 border-black ${tier.color} px-4 py-3`}
              >
                <div className="flex h-11 w-11 items-center justify-center border-2 border-black bg-white">
                  {tier.icon}
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-tight">
                    {tier.name}
                  </h3>
                  <p className="text-xs font-bold text-black/60">
                    {tier.amount}
                  </p>
                </div>
              </div>
              <div className="px-4 py-3">
                <p className="text-xs font-bold text-black/50 leading-relaxed">
                  {tier.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== WHY SUPPORT ===== */}
      <section className="mb-10">
        <div className="border-3 border-black bg-[#1e1e1e] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
          <div className="border-b-3 border-black bg-[#06d6a0] px-6 py-4 flex items-center gap-3">
            <Heart className="h-6 w-6" strokeWidth={3} />
            <h2 className="text-xl font-black uppercase tracking-tight">
              Kenapa Harus Support?
            </h2>
          </div>
          <div className="p-6 sm:p-8">
            <div className="grid gap-5 sm:grid-cols-2">
              {reasons.map((reason, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-[#06d6a0]/50 bg-[#06d6a0]/10 text-[#06d6a0]">
                    {reason.icon}
                  </div>
                  <p className="text-sm font-bold text-white/70 leading-relaxed pt-2">
                    {reason.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== ABOUT EPANDLABS ===== */}
      <section className="mb-10">
        <div className="border-3 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
          <div className="border-b-3 border-black bg-[#3a86ff] px-6 py-4 flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-white" strokeWidth={3} />
            <h2 className="text-xl font-black uppercase tracking-tight text-white">
              Tentang epandlabs
            </h2>
          </div>
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center border-3 border-black bg-[#ff6b35] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <span className="text-3xl font-black text-black">eD</span>
              </div>
              <div>
                <h3 className="text-lg font-black uppercase text-black">
                  epandlabs
                </h3>
                <p className="mt-2 text-sm font-bold text-black/55 leading-relaxed max-w-lg">
                  Kami adalah developer independen yang passionate tentang
                  open-source dan tools untuk developer. EpanDGist adalah salah
                  satu project kami untuk membantu komunitas developer Indonesia
                  berbagi code snippet dengan cara yang simple dan raw.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 border-2 border-black bg-[#ff6b35]/20 px-3 py-1 text-xs font-black uppercase">
                    <Flame className="h-3 w-3" strokeWidth={3} />
                    Open Source
                  </span>
                  <span className="inline-flex items-center gap-1 border-2 border-black bg-[#3a86ff]/20 px-3 py-1 text-xs font-black uppercase">
                    <Star className="h-3 w-3" strokeWidth={3} />
                    Developer Tools
                  </span>
                  <span className="inline-flex items-center gap-1 border-2 border-black bg-[#06d6a0]/20 px-3 py-1 text-xs font-black uppercase">
                    <Heart className="h-3 w-3" strokeWidth={3} />
                    Made in Indonesia
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== BOTTOM CTA ===== */}
      <section>
        <div className="border-3 border-black bg-[#8338ec] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
          <div className="px-6 sm:px-10 py-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left">
              <h3 className="text-2xl font-black uppercase text-white tracking-tight">
                Siap Support?
              </h3>
              <p className="mt-1 font-bold text-white/70 text-sm">
                Pilih platform favoritmu dan dukung EpanDGist sekarang.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href={TRAKTEER_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border-3 border-black bg-[#ff6b35] px-5 py-3 font-black uppercase text-sm tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px]"
              >
                <Coffee className="h-4 w-4" strokeWidth={3} />
                Trakteer
                <ExternalLink className="h-3.5 w-3.5" strokeWidth={3} />
              </a>
              <a
                href={SAWERIA_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border-3 border-black bg-[#ffd166] px-5 py-3 font-black uppercase text-sm tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px]"
              >
                <CircleDollarSign className="h-4 w-4" strokeWidth={3} />
                Saweria
                <ExternalLink className="h-3.5 w-3.5" strokeWidth={3} />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

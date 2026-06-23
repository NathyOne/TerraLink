import { ArrowRight, Building2, Hammer, Package, ShieldCheck, Truck } from "lucide-react";
import { Link } from "react-router-dom";

import backhoeImage from "../../assets/optimized/backhoe.webp";
import dozerImage from "../../assets/optimized/dozer.webp";
import excavatorHero from "../../assets/optimized/hero-excavator.webp";
import excavatorProduct from "../../assets/optimized/tracked-excavator.webp";
import howoTrucksImage from "../../assets/optimized/howo-trucks.webp";
import loaderImage from "../../assets/optimized/loader.webp";
import trucksImage from "../../assets/optimized/dump-trucks.webp";
import LanguageSwitch from "../../components/LanguageSwitch";
import { useI18n } from "../../i18n/I18nContext";

const features = [
  { icon: Building2, title: "Client Requests", text: "Equipment and material needs, quantity, date, and status tracking." },
  { icon: Package, title: "Material Supply", text: "Cement, gypsum, steel, aggregates, blocks, and finishing materials can be requested from one place." },
  { icon: ShieldCheck, title: "Admin Control", text: "Requests stay with the platform team until a match is coordinated." },
  { icon: Truck, title: "Owner Network", text: "Machine owners manage assets and receive direct admin messages." },
];

const photos = [
  { src: excavatorHero, label: "Excavator fleet" },
  { src: loaderImage, label: "Wheel loaders" },
  { src: backhoeImage, label: "Site loading" },
  { src: dozerImage, label: "Dozers" },
  { src: trucksImage, label: "Dump trucks" },
  { src: howoTrucksImage, label: "HOWO truck fleet" },
  { src: excavatorProduct, label: "Tracked excavators" },
];

export default function Landing() {
  const { language, t } = useI18n();

  return (
    <div className="min-h-screen bg-[#f6f7f4]" lang={language}>
      <header className="absolute left-0 right-0 top-0 z-10 mx-auto flex max-w-7xl items-center justify-between px-4 py-5 lg:px-8">
        <Link to="/" className="flex items-center gap-3 text-white">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500 text-slate-950">
            <Hammer size={21} />
          </span>
          <span className="hidden text-lg font-bold sm:inline">TerraLink</span>
        </Link>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <LanguageSwitch dark />
          <Link to="/login" className="rounded-lg px-3 py-2 text-sm font-semibold text-white hover:bg-white/10 sm:px-4">
            {t("Login")}
          </Link>
          <Link to="/register" className="rounded-lg bg-amber-500 px-3 py-2 text-sm font-bold text-slate-950 hover:bg-amber-400 sm:px-4">
            {t("Register")}
          </Link>
        </div>
      </header>

      <section className="relative min-h-[88vh] overflow-hidden">
        <img
          src={excavatorHero}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          decoding="async"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/58 to-slate-950/10" />
        <div className="mx-auto flex min-h-[88vh] max-w-7xl items-center px-4 pb-14 pt-28 lg:px-8">
          <div className="relative max-w-2xl text-white">
            <p className="mb-4 inline-flex items-center rounded-full border border-white/30 bg-white/10 px-3 py-1 text-sm font-semibold backdrop-blur">
              {t("Admin-mediated machines and material supply")}
            </p>
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">TerraLink</h1>
            <p className="mt-5 max-w-xl text-base font-medium leading-7 text-stone-100 sm:text-lg">
              {t("Construction owners submit equipment and material needs. TerraLink admins coordinate machines, cement, gypsum, steel, aggregates, and other site supplies.")}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register" className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-amber-500 px-5 text-sm font-bold text-slate-950 hover:bg-amber-400">
                {t("Start now")}
                <ArrowRight size={17} />
              </Link>
              <Link to="/login" className="inline-flex min-h-11 items-center rounded-lg border border-white/30 px-5 text-sm font-semibold text-white hover:bg-white/10">
                {t("Open dashboard")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-8 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
        {features.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
              <Icon className="text-amber-600" size={26} />
              <h2 className="mt-4 text-base font-bold text-slate-950">{t(item.title)}</h2>
              <p className="mt-2 text-sm leading-6 text-stone-600">{t(item.text)}</p>
            </div>
          );
        })}
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12 lg:px-8">
        <div className="mb-5 max-w-2xl">
          <h2 className="text-2xl font-bold text-slate-950">{t("Machines and materials ready for admin coordination")}</h2>
          <p className="mt-2 text-sm leading-6 text-stone-600">{t("A practical network for excavation, hauling, loading, grading, cement supply, steel supply, gypsum, and site preparation.")}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((photo, index) => (
            <figure
              key={photo.label}
              className={`overflow-hidden rounded-lg border border-stone-200 bg-white shadow-soft ${
                index === 0 ? "sm:col-span-2" : ""
              }`}
            >
              <img
                src={photo.src}
                alt={photo.label}
                className="h-56 w-full object-cover sm:h-64"
                decoding="async"
                loading={index === 0 ? "eager" : "lazy"}
                fetchPriority={index === 0 ? "high" : "auto"}
              />
              <figcaption className="px-4 py-3 text-sm font-bold text-slate-800">{t(photo.label)}</figcaption>
            </figure>
          ))}
        </div>
      </section>
    </div>
  );
}

import { languages, useI18n } from "../i18n/I18nContext";

export default function LanguageSwitch({ dark = false }) {
  const { language, setLanguage } = useI18n();

  return (
    <div className={`flex rounded-lg p-1 ${dark ? "border border-white/30 bg-white/10 backdrop-blur" : "border border-stone-200 bg-stone-50"}`}>
      {languages.map((item) => (
        <button
          key={item.code}
          type="button"
          title={item.name}
          onClick={() => setLanguage(item.code)}
          className={`min-h-8 rounded-md px-2.5 text-xs font-bold transition ${
            language === item.code
              ? dark
                ? "bg-white text-slate-950"
                : "bg-slate-950 text-white"
              : dark
                ? "text-white hover:bg-white/10"
                : "text-slate-600 hover:bg-white"
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

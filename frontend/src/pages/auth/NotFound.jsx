import { Link } from "react-router-dom";
import { useI18n } from "../../i18n/I18nContext";

export default function NotFound() {
  const { t } = useI18n();
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f6f7f4] px-4">
      <div className="max-w-md rounded-lg border border-stone-200 bg-white p-6 text-center shadow-soft">
        <h1 className="text-2xl font-bold text-slate-950">{t("Page not found")}</h1>
        <p className="mt-2 text-sm font-medium text-stone-500">{t("The requested route is not available.")}</p>
        <Link to="/" className="mt-5 inline-flex min-h-10 items-center justify-center rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white">
          {t("Go home")}
        </Link>
      </div>
    </div>
  );
}

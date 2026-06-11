import { availabilityLabel, assignmentStatusLabel, requestStatusLabel, roleLabel } from "../utils/format";
import { useI18n } from "../i18n/I18nContext";

const styles = {
  pending: "border-amber-200 bg-amber-50 text-amber-800",
  reviewing: "border-sky-200 bg-sky-50 text-sky-800",
  contacted: "border-indigo-200 bg-indigo-50 text-indigo-800",
  assigned: "border-emerald-200 bg-emerald-50 text-emerald-800",
  completed: "border-stone-200 bg-stone-100 text-stone-700",
  cancelled: "border-rose-200 bg-rose-50 text-rose-800",
  proposed: "border-amber-200 bg-amber-50 text-amber-800",
  accepted: "border-emerald-200 bg-emerald-50 text-emerald-800",
  rejected: "border-rose-200 bg-rose-50 text-rose-800",
  active: "border-blue-200 bg-blue-50 text-blue-800",
  available: "border-emerald-200 bg-emerald-50 text-emerald-800",
  busy: "border-blue-200 bg-blue-50 text-blue-800",
  maintenance: "border-amber-200 bg-amber-50 text-amber-800",
  unavailable: "border-stone-200 bg-stone-100 text-stone-700",
  admin: "border-slate-300 bg-slate-100 text-slate-800",
  construction_owner: "border-orange-200 bg-orange-50 text-orange-800",
  machine_owner: "border-cyan-200 bg-cyan-50 text-cyan-800",
};

export default function StatusBadge({ value }) {
  const { t } = useI18n();
  const label = requestStatusLabel[value] || assignmentStatusLabel[value] || availabilityLabel[value] || roleLabel[value] || value || "-";
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${styles[value] || "border-stone-200 bg-stone-50 text-stone-700"}`}>
      {t(label)}
    </span>
  );
}

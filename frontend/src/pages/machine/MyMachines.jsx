import { Plus, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

import { api, getErrorMessage, toList } from "../../api/client";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "../../components/DataState";
import { inputClass, secondaryButtonClass } from "../../components/FormControls";
import StatusBadge from "../../components/StatusBadge";
import { useI18n } from "../../i18n/I18nContext";

export default function MyMachines() {
  const { t } = useI18n();
  const [machines, setMachines] = useState([]);
  const [filters, setFilters] = useState({ search: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.set("search", filters.search);
      const response = await api.get(`/machines/?${params.toString()}`);
      setMachines(toList(response.data));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [filters.search]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-950">{t("My Machines")}</h2>
          <p className="mt-1 text-sm font-medium text-stone-500">{t("Registered equipment for admin matching.")}</p>
        </div>
        <Link to="/machine/machines/new" className={secondaryButtonClass}>
          <Plus size={17} />
          {t("Add Machine")}
        </Link>
      </div>

      <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-soft">
        <label className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={17} />
          <input className={`${inputClass} pl-10`} placeholder={t("Search machines")} value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
        </label>
      </div>

      <ErrorBlock message={error} />
      {loading ? (
        <LoadingBlock label="Loading machines" />
      ) : machines.length === 0 ? (
        <EmptyBlock label="No machines found." />
      ) : (
        <div className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-soft">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-stone-200">
              <thead className="bg-stone-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase text-stone-500">{t("Plate")}</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase text-stone-500">{t("Machine type")}</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase text-stone-500">{t("Status")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {machines.map((machine) => (
                  <tr key={machine.id}>
                    <td className="px-4 py-4 text-sm font-medium text-stone-600">{machine.plate_number || "-"}</td>
                    <td className="px-4 py-4 text-sm font-medium text-stone-600">{machine.machine_type}</td>
                    <td className="px-4 py-4">
                      <StatusBadge value={machine.availability_status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

import { Search } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

import { api, getErrorMessage, toList } from "../../api/client";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "../../components/DataState";
import { inputClass } from "../../components/FormControls";
import StatusBadge from "../../components/StatusBadge";
import { useI18n } from "../../i18n/I18nContext";
import { shortDate } from "../../utils/format";
import { requestCategoryLabel, requestDisplayName, requestItem } from "../../utils/requestOptions";

export default function MyRequests() {
  const { t } = useI18n();
  const [requests, setRequests] = useState([]);
  const [filters, setFilters] = useState({ search: "", status: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filters.search) params.set("search", filters.search);
        if (filters.status) params.set("status", filters.status);
        const response = await api.get(`/machine-requests/?${params.toString()}`);
        if (alive) setRequests(toList(response.data));
      } catch (err) {
        if (alive) setError(getErrorMessage(err));
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => {
      alive = false;
    };
  }, [filters]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-slate-950">{t("My Requests")}</h2>
        <p className="mt-1 text-sm font-medium text-stone-500">{t("Requests submitted to the admin team.")}</p>
      </div>
      <div className="grid gap-3 rounded-lg border border-stone-200 bg-white p-4 shadow-soft md:grid-cols-[1fr_220px]">
        <label className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={17} />
          <input className={`${inputClass} pl-10`} placeholder={t("Search requests")} value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
        </label>
        <select className={inputClass} value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
          <option value="">{t("All statuses")}</option>
          <option value="pending">{t("Pending")}</option>
          <option value="reviewing">{t("Reviewing")}</option>
          <option value="contacted">{t("Contacted")}</option>
          <option value="assigned">{t("Assigned")}</option>
          <option value="completed">{t("Completed")}</option>
          <option value="cancelled">{t("Cancelled")}</option>
        </select>
      </div>
      <ErrorBlock message={error} />
      {loading ? (
        <LoadingBlock label="Loading requests" />
      ) : requests.length === 0 ? (
        <EmptyBlock label="No requests match the current filters." />
      ) : (
        <div className="grid gap-4">
          {requests.map((request) => (
            <Link key={request.id} to={`/construction/requests/${request.id}`} className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft transition hover:border-amber-300">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div>
                  <h3 className="text-lg font-bold text-slate-950">{requestDisplayName(request, t)}</h3>
                  <p className="mt-1 text-sm font-medium text-stone-500">{request.location}</p>
                </div>
                <StatusBadge value={request.status} />
              </div>
              <div className="mt-4 grid gap-3 text-sm font-medium text-stone-600 sm:grid-cols-4">
                <span>{t(requestCategoryLabel(request.request_category))}</span>
                <span>{t(requestItem(request))}</span>
                <span>{request.quantity || 1}</span>
                <span>{shortDate(request.expected_start_date)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

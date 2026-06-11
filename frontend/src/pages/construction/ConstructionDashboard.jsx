import { ClipboardList, Clock3, FileCheck2, Plus, SearchCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

import { api, getErrorMessage, toList } from "../../api/client";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "../../components/DataState";
import { secondaryButtonClass } from "../../components/FormControls";
import StatCard from "../../components/StatCard";
import StatusBadge from "../../components/StatusBadge";
import { useI18n } from "../../i18n/I18nContext";
import { shortDate } from "../../utils/format";
import { requestCategoryLabel, requestDisplayName, requestItem } from "../../utils/requestOptions";

export default function ConstructionDashboard() {
  const { t } = useI18n();
  const [stats, setStats] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const [statsResponse, requestsResponse] = await Promise.all([
          api.get("/dashboard/stats/"),
          api.get("/machine-requests/?ordering=-created_at"),
        ]);
        if (!alive) return;
        setStats(statsResponse.data);
        setRequests(toList(requestsResponse.data).slice(0, 5));
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
  }, []);

  if (loading) return <LoadingBlock label="Loading dashboard" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-950">{t("Construction Dashboard")}</h2>
          <p className="mt-1 text-sm font-medium text-stone-500">{t("Requests, status, and admin responses.")}</p>
        </div>
        <Link to="/construction/requests/new" className={secondaryButtonClass}>
          <Plus size={17} />
          {t("New Request")}
        </Link>
      </div>

      <ErrorBlock message={error} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total requests" value={stats?.requests} icon={ClipboardList} accent="bg-slate-950 text-white" />
        <StatCard label="Pending" value={stats?.pending_requests} icon={Clock3} accent="bg-amber-500 text-slate-950" />
        <StatCard label="Reviewing" value={stats?.reviewing_requests} icon={SearchCheck} accent="bg-sky-600 text-white" />
        <StatCard label="Assigned" value={stats?.assigned_requests} icon={FileCheck2} accent="bg-emerald-600 text-white" />
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-950">{t("Recent Requests")}</h3>
          <Link to="/construction/requests" className="text-sm font-bold text-slate-950">
            {t("View all")}
          </Link>
        </div>
        {requests.length === 0 ? (
          <EmptyBlock label="No machine requests yet." />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {requests.map((request) => (
              <Link key={request.id} to={`/construction/requests/${request.id}`} className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft transition hover:border-amber-300">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-slate-950">{requestDisplayName(request, t)}</h4>
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
      </section>
    </div>
  );
}

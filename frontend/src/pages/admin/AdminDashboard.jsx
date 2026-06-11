import { Boxes, ClipboardList, Package, Truck, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

import { api, getErrorMessage, toList } from "../../api/client";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "../../components/DataState";
import StatCard from "../../components/StatCard";
import StatusBadge from "../../components/StatusBadge";
import { useI18n } from "../../i18n/I18nContext";
import { currency, shortDate } from "../../utils/format";
import { machineTitle } from "../../utils/machines";
import { requestCategoryLabel, requestDisplayName, requestItem } from "../../utils/requestOptions";

export default function AdminDashboard() {
  const { t } = useI18n();
  const [stats, setStats] = useState(null);
  const [requests, setRequests] = useState([]);
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const [statsResponse, requestsResponse, machinesResponse] = await Promise.all([
          api.get("/dashboard/stats/"),
          api.get("/machine-requests/?ordering=-created_at"),
          api.get("/machines/?availability_status=available&ordering=-created_at"),
        ]);
        if (!alive) return;
        setStats(statsResponse.data);
        setRequests(toList(requestsResponse.data).slice(0, 5));
        setMachines(toList(machinesResponse.data).slice(0, 5));
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

  if (loading) return <LoadingBlock label="Loading admin dashboard" />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-950">{t("Admin Dashboard")}</h2>
        <p className="mt-1 text-sm font-medium text-stone-500">{t("Requests, machine network, users, and materials.")}</p>
      </div>
      <ErrorBlock message={error} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Requests" value={stats?.requests} icon={ClipboardList} accent="bg-slate-950 text-white" />
        <StatCard label="Machines" value={stats?.machines} icon={Truck} accent="bg-amber-500 text-slate-950" />
        <StatCard label="Users" value={stats?.users} icon={UsersRound} accent="bg-sky-600 text-white" />
        <StatCard label="Assignments" value={stats?.assignments} icon={Boxes} accent="bg-emerald-600 text-white" />
        <StatCard label="Materials" value={stats?.materials} icon={Package} accent="bg-stone-700 text-white" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.25fr_1fr]">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-950">{t("Latest Requests")}</h3>
            <Link to="/admin/requests" className="text-sm font-bold text-slate-950">
              {t("Open")}
            </Link>
          </div>
          {requests.length === 0 ? (
            <EmptyBlock label="No requests submitted." />
          ) : (
            <div className="space-y-3">
              {requests.map((request) => (
                <Link key={request.id} to={`/admin/requests/${request.id}`} className="block rounded-lg border border-stone-200 bg-white p-4 shadow-soft transition hover:border-amber-300">
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div>
                      <h4 className="font-bold text-slate-950">{requestDisplayName(request, t)}</h4>
                      <p className="mt-1 text-sm font-medium text-stone-500">{request.requested_by?.username} - {request.location}</p>
                    </div>
                    <StatusBadge value={request.status} />
                  </div>
                  <div className="mt-3 grid gap-2 text-sm font-medium text-stone-600 sm:grid-cols-4">
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

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-950">{t("Available Machines")}</h3>
            <Link to="/admin/matching" className="text-sm font-bold text-slate-950">
              {t("Match")}
            </Link>
          </div>
          {machines.length === 0 ? (
            <EmptyBlock label="No available machines." />
          ) : (
            <div className="space-y-3">
              {machines.map((machine) => (
                <div key={machine.id} className="rounded-lg border border-stone-200 bg-white p-4 shadow-soft">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-slate-950">{machineTitle(machine)}</p>
                      <p className="mt-1 text-sm font-medium text-stone-500">{machine.owner?.username} - {machine.owner?.phone_number || "-"}</p>
                    </div>
                    <StatusBadge value={machine.availability_status} />
                  </div>
                  <p className="mt-3 text-sm font-medium text-stone-600">{machine.machine_type} - {currency(machine.daily_rate)}/day</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

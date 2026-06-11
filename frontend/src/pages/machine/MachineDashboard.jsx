import { Bell, CheckCircle2, MessageSquareText, Truck } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

import { api, getErrorMessage, toList } from "../../api/client";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "../../components/DataState";
import { secondaryButtonClass } from "../../components/FormControls";
import StatCard from "../../components/StatCard";
import StatusBadge from "../../components/StatusBadge";
import { useI18n } from "../../i18n/I18nContext";
import { requestDisplayName } from "../../utils/requestOptions";

export default function MachineDashboard() {
  const { t } = useI18n();
  const [stats, setStats] = useState(null);
  const [machines, setMachines] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const [statsResponse, machinesResponse, messagesResponse] = await Promise.all([
          api.get("/dashboard/stats/"),
          api.get("/machines/?ordering=-created_at"),
          api.get("/messages/?ordering=-created_at"),
        ]);
        if (!alive) return;
        setStats(statsResponse.data);
        setMachines(toList(machinesResponse.data).slice(0, 4));
        setMessages(toList(messagesResponse.data).slice(0, 3));
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
          <h2 className="text-2xl font-bold text-slate-950">{t("Machine Owner Dashboard")}</h2>
          <p className="mt-1 text-sm font-medium text-stone-500">{t("Machines registered for admin matching and messages.")}</p>
        </div>
        <Link to="/machine/machines/new" className={secondaryButtonClass}>
          <Truck size={17} />
          {t("Add Machine")}
        </Link>
      </div>
      <ErrorBlock message={error} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Machines" value={stats?.machines} icon={Truck} accent="bg-slate-950 text-white" />
        <StatCard label="Available" value={stats?.available_machines} icon={CheckCircle2} accent="bg-emerald-600 text-white" />
        <StatCard label="Messages" value={stats?.messages} icon={MessageSquareText} accent="bg-sky-600 text-white" />
        <StatCard label="Unread" value={stats?.unread_messages} icon={Bell} accent="bg-amber-500 text-slate-950" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-950">{t("My Machines")}</h3>
            <Link to="/machine/machines" className="text-sm font-bold text-slate-950">
              {t("Manage")}
            </Link>
          </div>
          {machines.length === 0 ? (
            <EmptyBlock label="No machines registered." />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {machines.map((machine) => (
                <div key={machine.id} className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-slate-950">{machine.plate_number || t("No plate")}</h4>
                      <p className="mt-1 text-sm font-medium text-stone-500">{machine.machine_type}</p>
                    </div>
                    <StatusBadge value={machine.availability_status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-950">{t("Admin Messages")}</h3>
            <Link to="/machine/messages" className="text-sm font-bold text-slate-950">
              {t("View")}
            </Link>
          </div>
          {messages.length === 0 ? (
            <EmptyBlock label="No admin messages." />
          ) : (
            <div className="space-y-3">
              {messages.map((message) => (
                <div key={message.id} className="rounded-lg border border-stone-200 bg-white p-4 shadow-soft">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-bold text-slate-950">{requestDisplayName(message.machine_request, t)}</p>
                    <StatusBadge value={message.is_read ? "completed" : "pending"} />
                  </div>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-stone-600">{message.message}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

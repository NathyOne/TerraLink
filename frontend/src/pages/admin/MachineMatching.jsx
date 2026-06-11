import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, MessageSquareText, Phone, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { api, getErrorMessage, toList } from "../../api/client";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "../../components/DataState";
import { Field, buttonClass, inputClass, secondaryButtonClass } from "../../components/FormControls";
import StatusBadge from "../../components/StatusBadge";
import { useI18n } from "../../i18n/I18nContext";
import { currency } from "../../utils/format";
import { machineTitle } from "../../utils/machines";
import { isEquipmentRequest, requestDisplayName, requestItem } from "../../utils/requestOptions";

export default function MachineMatching() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialRequest = searchParams.get("request") || "";
  const [requests, setRequests] = useState([]);
  const [machines, setMachines] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(initialRequest);
  const [filters, setFilters] = useState({ machine_type: "", location: "", hourly_rate_lte: "", daily_rate_lte: "" });
  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const request = useMemo(() => requests.find((item) => String(item.id) === String(selectedRequest)), [requests, selectedRequest]);

  useEffect(() => {
    let alive = true;
    async function loadRequests() {
      try {
        const response = await api.get("/machine-requests/?ordering=-created_at");
        if (!alive) return;
        const list = toList(response.data).filter(isEquipmentRequest);
        setRequests(list);
        if (list.length) {
          if (!selectedRequest || !list.some((item) => String(item.id) === String(selectedRequest))) {
            setSelectedRequest(String(list[0].id));
          }
        } else {
          setSelectedRequest("");
        }
      } catch (err) {
        if (alive) setError(getErrorMessage(err));
      } finally {
        if (alive) setLoading(false);
      }
    }
    loadRequests();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    setSearchParams(selectedRequest ? { request: selectedRequest } : {});
  }, [selectedRequest, setSearchParams]);

  async function loadMatches(event) {
    event?.preventDefault();
    setError("");
    setSuccess("");
    setMatching(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });
      let url = "/machines/?availability_status=available";
      if (selectedRequest) {
        url = `/machine-requests/${selectedRequest}/matches/?${params.toString()}`;
      } else if (params.toString()) {
        url += `&${params.toString()}`;
      }
      const response = await api.get(url);
      setMachines(toList(response.data));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setMatching(false);
    }
  }

  useEffect(() => {
    if (selectedRequest) loadMatches();
  }, [selectedRequest]);

  const assign = async (machine) => {
    if (!selectedRequest) return;
    setError("");
    setSuccess("");
    try {
      await api.post("/assignments/", {
        machine_request_id: selectedRequest,
        machine_id: machine.id,
        status: "proposed",
      });
      setSuccess(`${machineTitle(machine)} ${t("proposed for")} ${request ? requestDisplayName(request, t) : t("request")}.`);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  if (loading) return <LoadingBlock label="Loading matching workspace" />;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-slate-950">{t("Machine Matching")}</h2>
        <p className="mt-1 text-sm font-medium text-stone-500">{t("Filter available machines and contact owners.")}</p>
      </div>

      <form onSubmit={loadMatches} className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
        <div className="grid gap-4 xl:grid-cols-[1.2fr_repeat(4,1fr)_auto]">
          <Field label="Machine request">
            <select className={inputClass} value={selectedRequest} onChange={(e) => setSelectedRequest(e.target.value)}>
              <option value="">{t("Available Machines")}</option>
              {requests.map((item) => (
                <option key={item.id} value={item.id}>
                  {requestDisplayName(item, t)}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Type">
            <input className={inputClass} value={filters.machine_type} onChange={(e) => setFilters({ ...filters, machine_type: e.target.value })} placeholder={request ? t(requestItem(request)) : t("Any")} />
          </Field>
          <Field label="Location">
            <input className={inputClass} value={filters.location} onChange={(e) => setFilters({ ...filters, location: e.target.value })} placeholder={request?.location || t("Any")} />
          </Field>
          <Field label="Max hourly">
            <input className={inputClass} type="number" min="0" step="0.01" value={filters.hourly_rate_lte} onChange={(e) => setFilters({ ...filters, hourly_rate_lte: e.target.value })} />
          </Field>
          <Field label="Max daily">
            <input className={inputClass} type="number" min="0" step="0.01" value={filters.daily_rate_lte} onChange={(e) => setFilters({ ...filters, daily_rate_lte: e.target.value })} />
          </Field>
          <div className="flex items-end">
            <button disabled={matching} className={buttonClass} type="submit">
              <Search size={17} />
              {t("Match")}
            </button>
          </div>
        </div>
      </form>

      <ErrorBlock message={error} />
      {success ? <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">{success}</div> : null}

      {matching ? (
        <LoadingBlock label="Finding matches" />
      ) : machines.length === 0 ? (
        <EmptyBlock label="No matching machines loaded." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {machines.map((machine) => (
            <div key={machine.id} className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div>
                  <h3 className="text-lg font-bold text-slate-950">{machineTitle(machine)}</h3>
                  <p className="mt-1 text-sm font-medium text-stone-500">{machine.machine_type} - {machine.plate_number || t("No plate")} - {machine.location || "-"}</p>
                </div>
                <StatusBadge value={machine.availability_status} />
              </div>
              <p className="mt-4 text-sm leading-6 text-stone-600">{machine.description}</p>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm font-semibold text-slate-700">
                <span>{currency(machine.hourly_rate)}/hr</span>
                <span>{currency(machine.daily_rate)}/day</span>
                <span>{machine.owner?.username}</span>
                <span>{machine.owner?.phone_number}</span>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {selectedRequest ? (
                  <button className={secondaryButtonClass} onClick={() => assign(machine)}>
                    <CheckCircle2 size={17} />
                    {t("Propose")}
                  </button>
                ) : null}
                {machine.owner?.phone_number ? (
                  <>
                    <a className={secondaryButtonClass} href={`tel:${machine.owner.phone_number}`}>
                      <Phone size={17} />
                      {t("Call")}
                    </a>
                    <a className={secondaryButtonClass} href={`sms:${machine.owner.phone_number}`}>
                      <MessageSquareText size={17} />
                      {t("Text")}
                    </a>
                  </>
                ) : null}
                <button className={secondaryButtonClass} onClick={() => navigate(`/admin/send-message?request=${selectedRequest}&owner=${machine.owner?.id}`)}>
                  <MessageSquareText size={17} />
                  {t("Message")}
                </button>
                {selectedRequest ? (
                  <Link className={secondaryButtonClass} to={`/admin/requests/${selectedRequest}`}>
                    {t("Request detail")}
                  </Link>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

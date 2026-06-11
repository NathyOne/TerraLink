import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import { api, getErrorMessage } from "../../api/client";
import { ErrorBlock, LoadingBlock } from "../../components/DataState";
import { secondaryButtonClass } from "../../components/FormControls";
import StatusBadge from "../../components/StatusBadge";
import { useI18n } from "../../i18n/I18nContext";
import { shortDate } from "../../utils/format";
import { requestCategoryLabel, requestDisplayName, requestItem } from "../../utils/requestOptions";

export default function ConstructionRequestDetail() {
  const { id } = useParams();
  const { t } = useI18n();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const response = await api.get(`/machine-requests/${id}/`);
        if (alive) setRequest(response.data);
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
  }, [id]);

  if (loading) return <LoadingBlock label="Loading request" />;

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <Link to="/construction/requests" className={secondaryButtonClass}>
        <ArrowLeft size={17} />
        {t("Requests")}
      </Link>
      <ErrorBlock message={error} />
      {request ? (
        <article className="rounded-lg border border-stone-200 bg-white p-6 shadow-soft">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
            <div>
              <h2 className="text-2xl font-bold text-slate-950">{requestDisplayName(request, t)}</h2>
              <p className="mt-1 text-sm font-medium text-stone-500">{request.location}</p>
            </div>
            <StatusBadge value={request.status} />
          </div>
          <div className="mt-6 grid gap-4 border-y border-stone-200 py-5 text-sm font-medium text-stone-600 sm:grid-cols-4">
            <div>
              <span className="block text-xs font-bold uppercase text-stone-400">{t("Request type")}</span>
              {t(requestCategoryLabel(request.request_category))}
            </div>
            <div>
              <span className="block text-xs font-bold uppercase text-stone-400">{t("Item")}</span>
              {t(requestItem(request))}
            </div>
            <div>
              <span className="block text-xs font-bold uppercase text-stone-400">{t("Quantity")}</span>
              {request.quantity || 1}
            </div>
            <div>
              <span className="block text-xs font-bold uppercase text-stone-400">{t("Needed date")}</span>
              {shortDate(request.expected_start_date)}
            </div>
          </div>
          {request.description ? <p className="mt-5 whitespace-pre-line text-sm leading-7 text-slate-700">{request.description}</p> : null}
          {request.admin_notes ? (
            <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-bold text-amber-900">{t("Admin response")}</h3>
              <p className="mt-2 whitespace-pre-line text-sm leading-6 text-amber-900">{request.admin_notes}</p>
            </div>
          ) : null}
        </article>
      ) : null}
    </div>
  );
}

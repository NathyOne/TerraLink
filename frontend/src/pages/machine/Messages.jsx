import { Check, MailOpen } from "lucide-react";
import { useEffect, useState } from "react";

import { api, getErrorMessage, toList } from "../../api/client";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "../../components/DataState";
import { secondaryButtonClass } from "../../components/FormControls";
import StatusBadge from "../../components/StatusBadge";
import { useI18n } from "../../i18n/I18nContext";
import { shortDate } from "../../utils/format";
import { requestDisplayName } from "../../utils/requestOptions";

export default function Messages() {
  const { t } = useI18n();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    try {
      const response = await api.get("/messages/?ordering=-created_at");
      setMessages(toList(response.data));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const markRead = async (message) => {
    try {
      await api.post(`/messages/${message.id}/mark_read/`);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-slate-950">{t("Admin Messages")}</h2>
        <p className="mt-1 text-sm font-medium text-stone-500">{t("Direct contact from TerraLink admins.")}</p>
      </div>
      <ErrorBlock message={error} />
      {loading ? (
        <LoadingBlock label="Loading messages" />
      ) : messages.length === 0 ? (
        <EmptyBlock label="No messages yet." />
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <article key={message.id} className="rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <MailOpen size={18} className="text-amber-600" />
                    <h3 className="font-bold text-slate-950">{requestDisplayName(message.machine_request, t)}</h3>
                  </div>
                  <p className="mt-1 text-sm font-medium text-stone-500">{shortDate(message.created_at)}</p>
                </div>
                <StatusBadge value={message.is_read ? "completed" : "pending"} />
              </div>
              <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-700">{message.message}</p>
              {!message.is_read ? (
                <button className={`${secondaryButtonClass} mt-4`} onClick={() => markRead(message)}>
                  <Check size={17} />
                  {t("Mark read")}
                </button>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

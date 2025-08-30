import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { FiBell } from "react-icons/fi";
import { API_BASE_URL } from "../../../constants/constants";

const formatDateTime = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString("ar-EG", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const Notifications = () => {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  const fetchNotifications = async () => {
    console.log("📩 Notifications: fetching...");
    const token = localStorage.getItem("token");
    if (!token) {
      setNotes([]);
      window.dispatchEvent(new CustomEvent("notificationsCount", { detail: 0 }));
      return;
    }
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/notifications/myNotifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = Array.isArray(res.data) ? res.data : [];

      setNotes(data);
      console.log("📩 Notifications: fetched =", data);

      const unreadCount = data.filter((n) => n.status === "unread").length;
      window.dispatchEvent(new CustomEvent("notificationsCount", { detail: unreadCount }));
    } catch (err) {
      console.error("❌ Error fetching notifications:", err);
      setNotes([]);
      window.dispatchEvent(new CustomEvent("notificationsCount", { detail: 0 }));
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/api/notifications/setRead/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("✅ Notification updated:", res.data);

      // تحديث الحالة محلياً
      setNotes((prev) => {
        const updated = prev.map((n) => (n.id === id ? { ...n, status: "read" } : n));
        const unreadCount = updated.filter((n) => n.status === "unread").length;
        window.dispatchEvent(new CustomEvent("notificationsCount", { detail: unreadCount }));
        return updated;
      });
    } catch (err) {
      console.error("❌ Error updating notification:", err);
    }
  };

  const handleClickNotification = (note) => {
    console.log("➡️ Notifications: clicked notification id", note.id, "inquiry", note.inquiry_id);

    if (note.status === "unread") {
      markAsRead(note.id);
    }

    window.dispatchEvent(new CustomEvent("openInquiry", { detail: note.inquiry_id }));
    setOpen(false);
  };

  useEffect(() => {
    const handler = () => {
      console.log("📩 Notifications: received toggleNotifications");
      setOpen((s) => {
        const next = !s;
        if (next) fetchNotifications();
        return next;
      });
    };
    window.addEventListener("toggleNotifications", handler);
    return () => window.removeEventListener("toggleNotifications", handler);
  }, []);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!open) return;
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        console.log("📩 Notifications: clicked outside -> close");
        setOpen(false);
      }
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [open]);

  console.log("📩 Notifications: render open =", open, "notes =", notes.length);

  return (
    <div className="absolute right-0 mt-3 z-[999]" ref={containerRef}>
      {open && (
        <div className="w-[360px] max-w-sm bg-[var(--color-bg)] border border-[var(--color-border)] 
                        rounded-2xl shadow-2xl p-3 animate-slide-fade">
          <div className="flex items-center justify-between px-2 pb-2 border-b border-[var(--color-border)] mb-2">
            <h4 className="text-lg font-semibold text-[var(--color-text-main)]">Notifications</h4>
            <div className="text-sm text-[var(--color-text-muted)]">
              {loading ? "Reloading.." : `${notes.length} Notification`}
            </div>
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {!loading && notes.length === 0 && (
              <div className="p-4 text-center text-[var(--color-text-muted)]">There's No Notifications yet</div>
            )}

            {notes.map((n) => (
              <div
                key={n.id}
                onClick={() => handleClickNotification(n)}
                className={`flex items-start gap-3 p-3 rounded-lg hover:shadow-md transition cursor-pointer ${
                  n.status === "unread"
                    ? "bg-[var(--color-surface)]"
                    : "bg-[var(--color-bg)]/60"
                }`}
              >
                <div className="flex-none w-10 h-10 rounded-full bg-[var(--color-secondary)]/10 flex items-center justify-center text-[var(--color-secondary)]">
                  <FiBell size={18} />
                </div>

                <div className="flex-1">
                  <p className="text-sm font-medium text-[var(--color-text-main)]">{n.message}</p>
                  <div className="mt-1 text-xs text-[var(--color-text-muted)]">{formatDateTime(n.created_at)}</div>
                </div>

                {n.status === "unread" && (
                  <div className="flex-none">
                    <span className="inline-block bg-[var(--color-primary)] text-white text-xs px-2 py-0.5 rounded-full">Unread</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideFade {
          0% {
            opacity: 0;
            transform: translateY(-8px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-fade {
          animation: slideFade 0.18s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Notifications;

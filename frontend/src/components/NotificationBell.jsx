import { useState, useEffect } from "react";
import { BellIcon, CheckIcon, TrashIcon, XIcon } from "lucide-react";
import { useNavigate } from "react-router";
import axios from "../lib/axios";
import toast from "react-hot-toast";

function NotificationBell() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("/notifications");
      setNotifications(response.data.notifications);
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id) => {
    try {
      await axios.patch(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => 
        n._id === id ? { ...n, read: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.patch("/notifications/read-all");
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Error marking all as read:", error);
      toast.error("Failed to mark all as read");
    }
  };

  const deleteNotification = async (id) => {
    try {
      await axios.delete(`/notifications/${id}`);
      setNotifications(notifications.filter(n => n._id !== id));
      toast.success("Notification deleted");
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error("Failed to delete notification");
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification._id);
    }
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
      setIsOpen(false);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "meeting_invite":
        return "📧";
      case "meeting_reminder":
        return "⏰";
      case "session_joined":
        return "👋";
      case "session_ended":
        return "✅";
      default:
        return "🔔";
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now - notifDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return notifDate.toLocaleDateString();
  };

  return (
    <div className="dropdown dropdown-end">
      <button
        tabIndex={0}
        className="btn btn-ghost btn-circle relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <BellIcon className="size-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 size-5 rounded-full bg-error text-error-content text-xs flex items-center justify-center font-bold">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          tabIndex={0}
          className="dropdown-content z-50 card card-compact w-96 max-h-[600px] overflow-y-auto p-0 shadow-2xl bg-base-100 border border-base-300 mt-3"
        >
          {/* Header */}
          <div className="sticky top-0 bg-base-100 border-b border-base-300 p-4 flex items-center justify-between z-10">
            <h3 className="font-bold text-lg">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="btn btn-ghost btn-xs gap-1"
                  title="Mark all as read"
                >
                  <CheckIcon className="size-3" />
                  Mark all
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="btn btn-ghost btn-sm btn-circle"
              >
                <XIcon className="size-4" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="divide-y divide-base-300">
            {isLoading ? (
              <div className="p-8 text-center">
                <span className="loading loading-spinner loading-md"></span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-base-content/60">
                <BellIcon className="size-12 mx-auto mb-3 opacity-30" />
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-4 hover:bg-base-200 transition-colors cursor-pointer ${
                    !notification.read ? "bg-primary/5" : ""
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-sm">
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <div className="size-2 rounded-full bg-primary flex-shrink-0 mt-1"></div>
                        )}
                      </div>
                      <p className="text-sm text-base-content/70 mt-1">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-base-content/50">
                          {formatTime(notification.createdAt)}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification._id);
                          }}
                          className="btn btn-ghost btn-xs text-error"
                        >
                          <TrashIcon className="size-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;

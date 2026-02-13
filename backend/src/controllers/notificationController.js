import Notification from "../models/Notification.js";

export async function getNotifications(req, res) {
  try {
    const userId = req.user._id;
    const { unreadOnly } = req.query;

    const query = { user: userId };
    if (unreadOnly === "true") {
      query.read = false;
    }

    const notifications = await Notification.find(query)
      .populate("session", "problem difficulty meetingCode")
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({ user: userId, read: false });

    res.status(200).json({ notifications, unreadCount });
  } catch (error) {
    console.error("Error in getNotifications:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function markAsRead(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOne({ _id: id, user: userId });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    notification.read = true;
    await notification.save();

    res.status(200).json({ notification });
  } catch (error) {
    console.error("Error in markAsRead:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function markAllAsRead(req, res) {
  try {
    const userId = req.user._id;

    await Notification.updateMany({ user: userId, read: false }, { read: true });

    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Error in markAllAsRead:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function deleteNotification(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOneAndDelete({ _id: id, user: userId });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json({ message: "Notification deleted" });
  } catch (error) {
    console.error("Error in deleteNotification:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Helper function to create notifications
export async function createNotification({ userId, type, title, message, sessionId, actionUrl }) {
  try {
    const notification = await Notification.create({
      user: userId,
      type,
      title,
      message,
      session: sessionId,
      actionUrl,
    });

    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
}

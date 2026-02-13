import User from "../models/User.js";
import Session from "../models/Session.js";

// Get dashboard stats
export async function getDashboardStats(req, res) {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const totalSessions = await Session.countDocuments();
    const activeSessions = await Session.countDocuments({ status: "active" });
    const completedSessions = await Session.countDocuments({ status: "completed" });

    // Get user growth (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const newUsersThisWeek = await User.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
    });

    // Get session stats by difficulty
    const sessionsByDifficulty = await Session.aggregate([
      { $group: { _id: "$difficulty", count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      stats: {
        totalUsers,
        activeUsers,
        totalSessions,
        activeSessions,
        completedSessions,
        newUsersThisWeek,
        sessionsByDifficulty,
      },
    });
  } catch (error) {
    console.error("Error in getDashboardStats:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Get all users
export async function getAllUsers(req, res) {
  try {
    const { page = 1, limit = 10, search = "", role = "" } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    if (role) {
      query.role = role;
    }

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await User.countDocuments(query);

    res.status(200).json({
      users,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    console.error("Error in getAllUsers:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Update user
export async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { name, email, role, isActive } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (typeof isActive !== "undefined") user.isActive = isActive;

    await user.save();

    res.status(200).json({
      message: "User updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error("Error in updateUser:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Delete user
export async function deleteUser(req, res) {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Don't allow deleting yourself
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "Cannot delete your own account" });
    }

    await User.findByIdAndDelete(id);

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error in deleteUser:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Get all sessions (admin view)
export async function getAllSessions(req, res) {
  try {
    const { page = 1, limit = 10, status = "" } = req.query;

    const query = {};
    if (status) {
      query.status = status;
    }

    const sessions = await Session.find(query)
      .populate("host", "name email")
      .populate("participant", "name email")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Session.countDocuments(query);

    res.status(200).json({
      sessions,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    console.error("Error in getAllSessions:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Force end session (admin)
export async function forceEndSession(req, res) {
  try {
    const { id } = req.params;

    const session = await Session.findById(id);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    if (session.status === "completed") {
      return res.status(400).json({ message: "Session is already completed" });
    }

    session.status = "completed";
    await session.save();

    res.status(200).json({ message: "Session ended successfully", session });
  } catch (error) {
    console.error("Error in forceEndSession:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Get analytics data
export async function getAnalytics(req, res) {
  try {
    // User registration trend (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const userTrend = await User.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Session completion rate
    const totalSessions = await Session.countDocuments();
    const completedSessions = await Session.countDocuments({ status: "completed" });
    const completionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

    // Popular problems
    const popularProblems = await Session.aggregate([
      { $group: { _id: "$problem", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Sessions by difficulty
    const sessionsByDifficulty = await Session.aggregate([
      { $group: { _id: "$difficulty", count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      analytics: {
        userTrend,
        completionRate: completionRate.toFixed(2),
        popularProblems,
        sessionsByDifficulty,
      },
    });
  } catch (error) {
    console.error("Error in getAnalytics:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

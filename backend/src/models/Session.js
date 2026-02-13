import mongoose from "mongoose";

// Generate a unique 9-character meeting code (e.g., ABC-123-XYZ)
const generateMeetingCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 9; i++) {
    if (i === 3 || i === 6) {
      code += '-';
    } else {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  }
  return code;
};

const sessionSchema = new mongoose.Schema(
  {
    problem: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true,
    },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    participant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    status: {
      type: String,
      enum: ["scheduled", "active", "completed", "cancelled"],
      default: "active",
    },
    // stream video call ID
    callId: {
      type: String,
      default: "",
    },
    // unique meeting code for easy sharing
    meetingCode: {
      type: String,
      unique: true,
      sparse: true,
    },
    // Interview scheduling fields
    sessionType: {
      type: String,
      enum: ["instant", "scheduled"],
      default: "instant",
    },
    scheduledStartTime: {
      type: Date,
      default: null,
    },
    scheduledEndTime: {
      type: Date,
      default: null,
    },
    duration: {
      type: Number, // in minutes
      default: 60,
    },
    timezone: {
      type: String,
      default: "UTC",
    },
    // Interview roles
    interviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    // Additional metadata
    title: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    notes: {
      type: String,
      default: "",
    },
    // Invited participants (for scheduled sessions)
    invitedEmails: [{
      type: String,
    }],
    // Reminder settings
    reminderSent: {
      type: Boolean,
      default: false,
    },
    actualStartTime: {
      type: Date,
      default: null,
    },
    actualEndTime: {
      type: Date,
      default: null,
    },
    // Recording information
    recording: {
      path: {
        type: String,
        default: null,
      },
      filename: {
        type: String,
        default: null,
      },
      size: {
        type: Number, // in bytes
        default: null,
      },
      duration: {
        type: Number, // in seconds
        default: null,
      },
      uploadedAt: {
        type: Date,
        default: null,
      },
      uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
    },
  },
  { timestamps: true }
);

// Generate meeting code before saving
sessionSchema.pre('save', async function(next) {
  if (this.isNew && !this.meetingCode) {
    let code;
    let isUnique = false;
    
    // Keep generating until we get a unique code
    while (!isUnique) {
      code = generateMeetingCode();
      const existing = await mongoose.model('Session').findOne({ meetingCode: code });
      if (!existing) {
        isUnique = true;
      }
    }
    
    this.meetingCode = code;
  }
  next();
});

const Session = mongoose.model("Session", sessionSchema);

export default Session;

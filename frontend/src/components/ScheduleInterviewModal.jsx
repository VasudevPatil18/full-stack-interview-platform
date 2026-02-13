import { useState } from "react";
import { CalendarIcon, ClockIcon, LoaderIcon, MailIcon, UserIcon, XIcon } from "lucide-react";
import { PROBLEMS } from "../data/problems";
import axios from "../lib/axios";
import toast from "react-hot-toast";

function ScheduleInterviewModal({ isOpen, onClose, onSuccess }) {
  const problems = Object.values(PROBLEMS);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    problem: "",
    difficulty: "",
    candidateEmail: "",
    scheduledDate: "",
    scheduledTime: "",
    duration: 60,
    title: "",
    description: "",
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProblemChange = (e) => {
    const selectedProblem = problems.find(p => p.title === e.target.value);
    setFormData(prev => ({
      ...prev,
      problem: e.target.value,
      difficulty: selectedProblem?.difficulty || "",
      title: `Interview: ${e.target.value}`,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.problem || !formData.candidateEmail || !formData.scheduledDate || !formData.scheduledTime) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Combine date and time
    const scheduledStartTime = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`);
    
    // Check if in the past
    if (scheduledStartTime < new Date()) {
      toast.error("Cannot schedule interview in the past");
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post("/schedule", {
        problem: formData.problem,
        difficulty: formData.difficulty.toLowerCase(),
        candidateEmail: formData.candidateEmail,
        scheduledStartTime: scheduledStartTime.toISOString(),
        duration: parseInt(formData.duration),
        title: formData.title,
        description: formData.description,
      });

      toast.success("Interview scheduled successfully!");
      
      // Reset form
      setFormData({
        problem: "",
        difficulty: "",
        candidateEmail: "",
        scheduledDate: "",
        scheduledTime: "",
        duration: 60,
        title: "",
        description: "",
      });

      if (onSuccess) onSuccess(response.data.session);
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to schedule interview");
    } finally {
      setIsLoading(false);
    }
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-2xl">Schedule Interview</h3>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
            <XIcon className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Problem Selection */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Select Problem *</span>
            </label>
            <select
              name="problem"
              className="select select-bordered w-full"
              value={formData.problem}
              onChange={handleProblemChange}
              required
            >
              <option value="">Choose a coding problem...</option>
              {problems.map((problem) => (
                <option key={problem.id} value={problem.title}>
                  {problem.title} ({problem.difficulty})
                </option>
              ))}
            </select>
          </div>

          {/* Candidate Email */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold flex items-center gap-2">
                <MailIcon className="size-4" />
                Candidate Email *
              </span>
            </label>
            <input
              type="email"
              name="candidateEmail"
              className="input input-bordered w-full"
              placeholder="candidate@example.com"
              value={formData.candidateEmail}
              onChange={handleChange}
              required
            />
            <label className="label">
              <span className="label-text-alt">
                Candidate must be registered on the platform
              </span>
            </label>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold flex items-center gap-2">
                  <CalendarIcon className="size-4" />
                  Date *
                </span>
              </label>
              <input
                type="date"
                name="scheduledDate"
                className="input input-bordered w-full"
                value={formData.scheduledDate}
                onChange={handleChange}
                min={today}
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold flex items-center gap-2">
                  <ClockIcon className="size-4" />
                  Time *
                </span>
              </label>
              <input
                type="time"
                name="scheduledTime"
                className="input input-bordered w-full"
                value={formData.scheduledTime}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Duration */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Duration (minutes)</span>
            </label>
            <select
              name="duration"
              className="select select-bordered w-full"
              value={formData.duration}
              onChange={handleChange}
            >
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>60 minutes</option>
              <option value={90}>90 minutes</option>
              <option value={120}>120 minutes</option>
            </select>
          </div>

          {/* Title (Optional) */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Interview Title (Optional)</span>
            </label>
            <input
              type="text"
              name="title"
              className="input input-bordered w-full"
              placeholder="e.g., Frontend Developer Interview"
              value={formData.title}
              onChange={handleChange}
            />
          </div>

          {/* Description (Optional) */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Description (Optional)</span>
            </label>
            <textarea
              name="description"
              className="textarea textarea-bordered w-full h-24"
              placeholder="Add any additional notes or instructions for the candidate..."
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          {/* Summary */}
          {formData.problem && formData.scheduledDate && formData.scheduledTime && (
            <div className="alert alert-info">
              <div className="flex flex-col gap-1 w-full">
                <p className="font-semibold">Interview Summary:</p>
                <p className="text-sm">
                  <strong>Problem:</strong> {formData.problem} ({formData.difficulty})
                </p>
                <p className="text-sm">
                  <strong>Candidate:</strong> {formData.candidateEmail}
                </p>
                <p className="text-sm">
                  <strong>Scheduled:</strong> {new Date(`${formData.scheduledDate}T${formData.scheduledTime}`).toLocaleString()}
                </p>
                <p className="text-sm">
                  <strong>Duration:</strong> {formData.duration} minutes
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary gap-2"
              disabled={isLoading || !formData.problem || !formData.candidateEmail || !formData.scheduledDate || !formData.scheduledTime}
            >
              {isLoading ? (
                <>
                  <LoaderIcon className="size-5 animate-spin" />
                  Scheduling...
                </>
              ) : (
                <>
                  <CalendarIcon className="size-5" />
                  Schedule Interview
                </>
              )}
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
}

export default ScheduleInterviewModal;

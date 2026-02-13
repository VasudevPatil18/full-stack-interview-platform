import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { LockIcon, CheckIcon, EyeIcon, EyeOffIcon } from "lucide-react";
import axios from "../lib/axios";
import toast from "react-hot-toast";

function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(`/auth/reset-password/${token}`, { password });
      toast.success(response.data.message);
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/auth");
      }, 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  const passwordRequirements = [
    { met: password.length >= 6, text: "At least 6 characters" },
    { met: password === confirmPassword && password.length > 0, text: "Passwords match" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-200 to-base-300 flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="bg-base-100 rounded-3xl shadow-2xl p-8 border border-base-300">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center size-16 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 mb-4">
              <LockIcon className="size-8 text-primary" />
            </div>
            <h2 className="text-3xl font-black text-base-content mb-2">
              Reset Password
            </h2>
            <p className="text-base-content/60">
              Enter your new password below
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold flex items-center gap-2">
                  <LockIcon className="size-4" />
                  New Password
                </span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="input input-bordered w-full focus:input-primary pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 btn btn-ghost btn-sm btn-circle"
                >
                  {showPassword ? (
                    <EyeOffIcon className="size-4" />
                  ) : (
                    <EyeIcon className="size-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold flex items-center gap-2">
                  <LockIcon className="size-4" />
                  Confirm Password
                </span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="input input-bordered w-full focus:input-primary pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 btn btn-ghost btn-sm btn-circle"
                >
                  {showConfirmPassword ? (
                    <EyeOffIcon className="size-4" />
                  ) : (
                    <EyeIcon className="size-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Password Requirements */}
            <div className="bg-base-200 rounded-xl p-4 space-y-2">
              <p className="text-sm font-semibold text-base-content mb-2">
                Password Requirements:
              </p>
              {passwordRequirements.map((req, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div className={`size-5 rounded-full flex items-center justify-center ${
                    req.met ? "bg-success text-success-content" : "bg-base-300"
                  }`}>
                    {req.met && <CheckIcon className="size-3" />}
                  </div>
                  <span className={req.met ? "text-base-content" : "text-base-content/60"}>
                    {req.text}
                  </span>
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full text-lg font-bold gap-2"
            >
              {isLoading ? (
                <>
                  <span className="loading loading-spinner"></span>
                  Resetting...
                </>
              ) : (
                "Reset Password"
              )}
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <Link to="/auth" className="link link-primary text-sm">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordPage;

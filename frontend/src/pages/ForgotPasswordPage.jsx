import { useState } from "react";
import { Link } from "react-router";
import { ArrowLeftIcon, MailIcon, SendIcon, CheckCircle2Icon } from "lucide-react";
import axios from "../lib/axios";
import toast from "react-hot-toast";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [resetUrl, setResetUrl] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post("/auth/forgot-password", { email });
      setIsSubmitted(true);
      
      // In development, show the reset URL
      if (response.data.resetUrl) {
        setResetUrl(response.data.resetUrl);
      }
      
      toast.success(response.data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send reset email");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-200 to-base-300 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="bg-base-100 rounded-3xl shadow-2xl p-8 border border-base-300 text-center">
            <div className="inline-flex items-center justify-center size-20 rounded-full bg-success/10 mb-6">
              <CheckCircle2Icon className="size-10 text-success" />
            </div>
            
            <h2 className="text-3xl font-black text-base-content mb-3">
              Check Your Email
            </h2>
            
            <p className="text-base-content/70 mb-6">
              We've sent a password reset link to <strong>{email}</strong>
            </p>

            {resetUrl && (
              <div className="alert alert-info mb-6">
                <div className="flex flex-col items-start gap-2 w-full">
                  <span className="font-semibold">Development Mode:</span>
                  <a 
                    href={resetUrl} 
                    className="link link-primary text-sm break-all"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {resetUrl}
                  </a>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <p className="text-sm text-base-content/60">
                Didn't receive the email? Check your spam folder or try again.
              </p>
              
              <button
                onClick={() => setIsSubmitted(false)}
                className="btn btn-outline btn-primary w-full"
              >
                Try Another Email
              </button>
              
              <Link to="/auth" className="btn btn-ghost w-full">
                <ArrowLeftIcon className="size-4" />
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-200 to-base-300 flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="bg-base-100 rounded-3xl shadow-2xl p-8 border border-base-300">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center size-16 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 mb-4">
              <MailIcon className="size-8 text-primary" />
            </div>
            <h2 className="text-3xl font-black text-base-content mb-2">
              Forgot Password?
            </h2>
            <p className="text-base-content/60">
              No worries! Enter your email and we'll send you a reset link.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold flex items-center gap-2">
                  <MailIcon className="size-4" />
                  Email Address
                </span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input input-bordered w-full focus:input-primary"
                placeholder="you@example.com"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full text-lg font-bold gap-2 group"
            >
              {isLoading ? (
                <>
                  <span className="loading loading-spinner"></span>
                  Sending...
                </>
              ) : (
                <>
                  Send Reset Link
                  <SendIcon className="size-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-6">
            <Link to="/auth" className="btn btn-ghost w-full gap-2">
              <ArrowLeftIcon className="size-4" />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;

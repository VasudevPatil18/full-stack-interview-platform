import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router";
import { 
  ArrowRightIcon, 
  CheckCircle2Icon, 
  CodeIcon, 
  LockIcon, 
  MailIcon, 
  SparklesIcon, 
  UserIcon, 
  VideoIcon,
  ZapIcon,
  EyeIcon,
  EyeOffIcon
} from "lucide-react";

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isLogin) {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        navigate("/dashboard");
      }
    } else {
      const result = await signup(formData.name, formData.email, formData.password);
      if (result.success) {
        navigate("/dashboard");
      }
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-200 to-base-300 flex">
      {/* LEFT SIDE - BRANDING */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-secondary to-accent p-12 flex-col justify-between relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3 mb-16 group">
            <div className="size-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <SparklesIcon className="size-7 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-2xl text-white font-mono tracking-wider">
                Talent IQ
              </span>
              <span className="text-xs text-white/80 font-medium -mt-1">Code Together</span>
            </div>
          </Link>

          <div className="space-y-8">
            <h1 className="text-5xl font-black text-white leading-tight">
              Master Coding<br />Interviews Together
            </h1>
            <p className="text-xl text-white/90 leading-relaxed max-w-md">
              Join thousands of developers practicing coding interviews with real-time collaboration and video calls.
            </p>

            {/* Features */}
            <div className="space-y-4 pt-8">
              <div className="flex items-center gap-4 text-white">
                <div className="size-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <VideoIcon className="size-5" />
                </div>
                <span className="text-lg font-medium">HD Video Interviews</span>
              </div>
              <div className="flex items-center gap-4 text-white">
                <div className="size-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <CodeIcon className="size-5" />
                </div>
                <span className="text-lg font-medium">Real-time Code Editor</span>
              </div>
              <div className="flex items-center gap-4 text-white">
                <div className="size-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <ZapIcon className="size-5" />
                </div>
                <span className="text-lg font-medium">Instant Code Execution</span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-white/60 text-sm">
          © 2024 Talent IQ. All rights reserved.
        </div>
      </div>

      {/* RIGHT SIDE - AUTH FORM */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <Link to="/" className="lg:hidden flex items-center gap-3 mb-6 md:mb-8 justify-center">
            <div className="size-10 rounded-xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center shadow-lg">
              <SparklesIcon className="size-6 text-white" />
            </div>
            <span className="font-black text-xl md:text-2xl bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent font-mono tracking-wider">
              Talent IQ
            </span>
          </Link>

          <div className="bg-base-100 rounded-2xl md:rounded-3xl shadow-2xl p-6 md:p-8 border border-base-300">
            {/* Header */}
            <div className="text-center mb-6 md:mb-8">
              <div className="inline-flex items-center justify-center size-14 md:size-16 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 mb-4">
                {isLogin ? (
                  <LockIcon className="size-7 md:size-8 text-primary" />
                ) : (
                  <UserIcon className="size-7 md:size-8 text-primary" />
                )}
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-base-content mb-2">
                {isLogin ? "Welcome Back!" : "Create Account"}
              </h2>
              <p className="text-sm md:text-base text-base-content/60">
                {isLogin 
                  ? "Sign in to continue your coding journey" 
                  : "Join our community of developers"}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
              {!isLogin && (
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold flex items-center gap-2 text-sm md:text-base">
                      <UserIcon className="size-4" />
                      Full Name
                    </span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required={!isLogin}
                    className="input input-bordered w-full focus:input-primary text-sm md:text-base"
                    placeholder="John Doe"
                  />
                </div>
              )}
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold flex items-center gap-2 text-sm md:text-base">
                    <MailIcon className="size-4" />
                    Email Address
                  </span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="input input-bordered w-full focus:input-primary text-sm md:text-base"
                  placeholder="you@example.com"
                />
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold flex items-center gap-2 text-sm md:text-base">
                    <LockIcon className="size-4" />
                    Password
                  </span>
                  {isLogin && (
                    <Link to="/forgot-password" className="label-text-alt link link-primary text-xs md:text-sm">
                      Forgot password?
                    </Link>
                  )}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                    className="input input-bordered w-full focus:input-primary text-sm md:text-base pr-12"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/60 hover:text-base-content transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOffIcon className="size-5" />
                    ) : (
                      <EyeIcon className="size-5" />
                    )}
                  </button>
                </div>
                {!isLogin && (
                  <label className="label">
                    <span className="label-text-alt text-base-content/60 text-xs">
                      Must be at least 6 characters
                    </span>
                  </label>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full text-base md:text-lg font-bold gap-2 group"
              >
                {isLogin ? "Sign In" : "Create Account"}
                <ArrowRightIcon className="size-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>

            {/* Divider */}
            <div className="divider my-4 md:my-6 text-sm">OR</div>

            {/* Toggle Auth Mode */}
            <div className="text-center">
              <p className="text-sm md:text-base text-base-content/70 mb-3">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
              </p>
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="btn btn-outline btn-primary w-full text-sm md:text-base"
              >
                {isLogin ? "Sign Up" : "Sign In"}
              </button>
            </div>

            {/* Benefits for signup */}
            {!isLogin && (
              <div className="mt-4 md:mt-6 p-3 md:p-4 bg-primary/5 rounded-xl border border-primary/20">
                <p className="text-xs md:text-sm font-semibold text-base-content mb-2">
                  What you'll get:
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs md:text-sm text-base-content/80">
                    <CheckCircle2Icon className="size-4 text-success flex-shrink-0" />
                    <span>Unlimited coding sessions</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs md:text-sm text-base-content/80">
                    <CheckCircle2Icon className="size-4 text-success flex-shrink-0" />
                    <span>HD video & audio calls</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs md:text-sm text-base-content/80">
                    <CheckCircle2Icon className="size-4 text-success flex-shrink-0" />
                    <span>Real-time collaboration</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Links */}
          <div className="text-center mt-4 md:mt-6 text-xs md:text-sm text-base-content/60 px-4">
            By continuing, you agree to our{" "}
            <a href="#" className="link link-primary">Terms of Service</a>
            {" "}and{" "}
            <a href="#" className="link link-primary">Privacy Policy</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;

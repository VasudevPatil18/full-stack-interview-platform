import { useAuth } from "../context/AuthContext";
import { ArrowRightIcon, PlusIcon, SparklesIcon, VideoIcon, ZapIcon } from "lucide-react";

function WelcomeSection({ onCreateSession, onJoinMeeting }) {
  const { user } = useAuth();

  return (
    <div className="relative overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-16">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="w-full lg:w-auto">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                <SparklesIcon className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-black bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Welcome back, {user?.name?.split(' ')[0] || "there"}!
              </h1>
            </div>
            <p className="text-base md:text-xl text-base-content/60 ml-0 md:ml-16">
              Ready to level up your coding skills?
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <button
              onClick={onJoinMeeting}
              className="group px-4 md:px-6 py-3 md:py-4 bg-base-100 border-2 border-primary rounded-2xl transition-all duration-200 hover:bg-primary hover:border-primary w-full sm:w-auto"
            >
              <div className="flex items-center justify-center gap-2 md:gap-3 font-bold text-base md:text-lg">
                <VideoIcon className="w-5 h-5 md:w-6 md:h-6 text-primary group-hover:text-white transition-colors" />
                <span className="text-primary group-hover:text-white transition-colors">Join Meeting</span>
              </div>
            </button>
            
            <button
              onClick={onCreateSession}
              className="group px-4 md:px-8 py-3 md:py-4 bg-gradient-to-r from-primary to-secondary rounded-2xl transition-all duration-200 hover:opacity-90 w-full sm:w-auto"
            >
              <div className="flex items-center justify-center gap-2 md:gap-3 text-white font-bold text-base md:text-lg">
                <PlusIcon className="w-5 h-5 md:w-6 md:h-6" />
                <span>Create Session</span>
                <ArrowRightIcon className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WelcomeSection;

import { useRef, useState, useEffect } from 'react';
import {
  PlayIcon,
  PauseIcon,
  Volume2Icon,
  VolumeXIcon,
  MaximizeIcon,
  MinimizeIcon,
  SkipBackIcon,
  SkipForwardIcon,
  DownloadIcon,
} from 'lucide-react';

function RecordingPlayer({ recordingUrl, sessionInfo }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleDurationChange = () => setDuration(video.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };

  const handleSeek = (e) => {
    const video = videoRef.current;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    video.currentTime = pos * duration;
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    videoRef.current.volume = newVolume;
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    video.muted = !video.muted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    const container = videoRef.current.parentElement;
    if (!document.fullscreenElement) {
      container.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const skip = (seconds) => {
    const video = videoRef.current;
    video.currentTime = Math.max(0, Math.min(duration, video.currentTime + seconds));
  };

  const changePlaybackRate = (rate) => {
    videoRef.current.playbackRate = rate;
    setPlaybackRate(rate);
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="bg-base-100 rounded-lg shadow-xl overflow-hidden">
      {/* Session Info */}
      {sessionInfo && (
        <div className="bg-base-200 p-4 border-b border-base-300">
          <h3 className="text-lg font-bold">{sessionInfo.problem}</h3>
          <div className="flex items-center gap-4 mt-2 text-sm text-base-content/70">
            <span className={`badge ${
              sessionInfo.difficulty === 'easy' ? 'badge-success' :
              sessionInfo.difficulty === 'medium' ? 'badge-warning' : 'badge-error'
            }`}>
              {sessionInfo.difficulty}
            </span>
            <span>Host: {sessionInfo.host}</span>
            {sessionInfo.participant && <span>Participant: {sessionInfo.participant}</span>}
            <span>{new Date(sessionInfo.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      )}

      {/* Video Player */}
      <div className="relative bg-black aspect-video">
        <video
          ref={videoRef}
          src={recordingUrl}
          className="w-full h-full"
          onClick={togglePlay}
        />

        {/* Play/Pause Overlay */}
        {!isPlaying && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
            onClick={togglePlay}
          >
            <div className="w-20 h-20 rounded-full bg-primary/80 flex items-center justify-center">
              <PlayIcon className="w-10 h-10 text-white fill-white ml-1" />
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-base-200 p-4">
        {/* Progress Bar */}
        <div
          className="w-full h-2 bg-base-300 rounded-full cursor-pointer mb-4 relative"
          onClick={handleSeek}
        >
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-primary rounded-full shadow-lg"
            style={{ left: `${progress}%`, marginLeft: '-8px' }}
          />
        </div>

        {/* Time Display */}
        <div className="flex items-center justify-between mb-4 text-sm font-mono">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="btn btn-circle btn-primary"
            >
              {isPlaying ? (
                <PauseIcon className="w-5 h-5" />
              ) : (
                <PlayIcon className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>

            {/* Skip Buttons */}
            <button
              onClick={() => skip(-10)}
              className="btn btn-circle btn-ghost btn-sm"
              title="Rewind 10s"
            >
              <SkipBackIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => skip(10)}
              className="btn btn-circle btn-ghost btn-sm"
              title="Forward 10s"
            >
              <SkipForwardIcon className="w-4 h-4" />
            </button>

            {/* Volume */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="btn btn-circle btn-ghost btn-sm"
              >
                {isMuted || volume === 0 ? (
                  <VolumeXIcon className="w-4 h-4" />
                ) : (
                  <Volume2Icon className="w-4 h-4" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                className="range range-xs range-primary w-20"
              />
            </div>

            {/* Playback Speed */}
            <div className="dropdown dropdown-top">
              <label tabIndex={0} className="btn btn-ghost btn-sm">
                {playbackRate}x
              </label>
              <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-32">
                {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                  <li key={rate}>
                    <button
                      onClick={() => changePlaybackRate(rate)}
                      className={playbackRate === rate ? 'active' : ''}
                    >
                      {rate}x
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Download */}
            <a
              href={recordingUrl}
              download
              className="btn btn-ghost btn-sm btn-circle"
              title="Download"
            >
              <DownloadIcon className="w-4 h-4" />
            </a>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="btn btn-ghost btn-sm btn-circle"
              title="Fullscreen"
            >
              {isFullscreen ? (
                <MinimizeIcon className="w-4 h-4" />
              ) : (
                <MaximizeIcon className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RecordingPlayer;

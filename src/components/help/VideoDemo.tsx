"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Maximize2, Volume2, VolumeX, RotateCcw, X } from "lucide-react";
import Image from "next/image";

interface VideoDemoProps {
  src: string;
  poster?: string;
  title: string;
  description?: string;
  aspectRatio?: "16/9" | "4/3" | "1/1";
}

export function VideoDemo({
  src,
  poster,
  title,
  description,
  aspectRatio = "16/9",
}: VideoDemoProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle video events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const progress = (video.currentTime / video.duration) * 100;
      setProgress(isNaN(progress) ? 0 : progress);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const restart = () => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = 0;
    video.play();
    setIsPlaying(true);
  };

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="my-6"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Title & Description */}
      {(title || description) && (
        <div className="mb-3">
          {title && (
            <h4 className="text-sm font-semibold text-[var(--foreground)] flex items-center gap-2">
              <Play size={14} className="text-[var(--primary)]" />
              {title}
            </h4>
          )}
          {description && (
            <p className="text-xs text-[var(--foreground-tertiary)] mt-1">{description}</p>
          )}
        </div>
      )}

      {/* Video Container */}
      <div
        className={`
          relative rounded-xl overflow-hidden
          bg-[var(--surface)] dark:bg-black
          border-2 border-[var(--surface-border)] dark:border-white/[0.08]
          shadow-lg hover:shadow-xl
          transition-shadow group
        `}
        style={{ aspectRatio }}
      >
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          className="w-full h-full object-cover cursor-pointer"
          muted={isMuted}
          loop={false}
          playsInline
          onClick={togglePlay}
        />

        {/* Play/Pause Overlay */}
        <AnimatePresence>
          {(!isPlaying || isHovering) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`
                absolute inset-0
                ${isPlaying ? 'bg-black/20' : 'bg-black/40'}
                backdrop-blur-[2px]
                flex items-center justify-center
                cursor-pointer
              `}
              onClick={togglePlay}
            >
              {!isPlaying && (
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="
                    w-16 h-16 rounded-full
                    bg-white/30 backdrop-blur-md
                    border-2 border-white/50
                    flex items-center justify-center
                    shadow-xl
                  "
                >
                  <Play className="w-7 h-7 text-white ml-1" fill="white" />
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
          <motion.div
            className="h-full bg-[var(--primary)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Controls */}
        <AnimatePresence>
          {(isHovering || !isPlaying) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="
                absolute bottom-2 left-2 right-2
                flex items-center justify-between
                pointer-events-none
              "
            >
              {/* Left controls */}
              <div className="flex items-center gap-1 pointer-events-auto">
                <button
                  onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                  className="p-2 rounded-lg bg-black/50 hover:bg-black/70 text-white transition-colors"
                  title={isPlaying ? "Pausar" : "Reproducir"}
                >
                  {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); restart(); }}
                  className="p-2 rounded-lg bg-black/50 hover:bg-black/70 text-white transition-colors"
                  title="Reiniciar"
                >
                  <RotateCcw size={16} />
                </button>
              </div>

              {/* Right controls */}
              <div className="flex items-center gap-1 pointer-events-auto">
                <button
                  onClick={(e) => { e.stopPropagation(); toggleMute(); }}
                  className="p-2 rounded-lg bg-black/50 hover:bg-black/70 text-white transition-colors"
                  title={isMuted ? "Activar sonido" : "Silenciar"}
                >
                  {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
                  className="p-2 rounded-lg bg-black/50 hover:bg-black/70 text-white transition-colors"
                  title="Pantalla completa"
                >
                  <Maximize2 size={16} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// Fallback component for when video is not available (uses static image)
interface ImageDemoProps {
  src: string;
  alt: string;
  onImageClick?: (src: string) => void;
}

export function ImageDemo({ src, alt, onImageClick }: ImageDemoProps) {
  return (
    <div className="my-6 text-center">
      <Image
        src={src}
        alt={alt}
        width={800}
        height={450}
        className="
          rounded-xl
          border-2 border-[var(--surface-border)]
          shadow-lg hover:shadow-xl
          transition-shadow cursor-pointer mx-auto
          hover:border-[var(--primary)]/30
        "
        onClick={() => onImageClick?.(src)}
      />
      <p className="text-xs text-[var(--foreground-tertiary)] mt-2 italic">
        {alt} (Haz clic para ampliar)
      </p>
    </div>
  );
}

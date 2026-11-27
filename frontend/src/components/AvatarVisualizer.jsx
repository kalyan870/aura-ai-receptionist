import React, { useEffect, useRef } from 'react';
import { Mic, Volume2, Sparkles, BrainCircuit } from 'lucide-react';

export default function AvatarVisualizer({ state = 'idle', transcript = '', onHoldStart, onHoldEnd }) {
  const canvasRef = useRef(null);

  // Dynamic canvas animation based on receptionist state
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      phase += state === 'speaking' ? 0.08 : state === 'listening' ? 0.05 : 0.02;

      // Base radius
      const baseRadius = 55;

      // Color scheme based on state
      let primaryColor = 'rgba(6, 182, 212, '; // Cyan (idle/listening)
      let secondaryColor = 'rgba(139, 92, 246, '; // Violet

      if (state === 'listening') {
        primaryColor = 'rgba(34, 211, 238, ';
        secondaryColor = 'rgba(56, 189, 248, ';
      } else if (state === 'thinking') {
        primaryColor = 'rgba(168, 85, 247, ';
        secondaryColor = 'rgba(236, 72, 153, ';
      } else if (state === 'speaking') {
        primaryColor = 'rgba(45, 212, 191, ';
        secondaryColor = 'rgba(99, 102, 241, ';
      }

      // Outer pulsating rings
      const rings = state === 'speaking' ? 4 : state === 'listening' ? 3 : 2;
      for (let i = rings; i >= 1; i--) {
        const pulse = Math.sin(phase + i * 0.8) * (state === 'speaking' ? 18 : 8);
        const radius = baseRadius + i * 20 + pulse;
        const alpha = Math.max(0.04, 0.25 - i * 0.05);

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.strokeStyle = primaryColor + alpha + ')';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Rotating audio orbital particles
      const particleCount = state === 'speaking' ? 24 : state === 'thinking' ? 18 : 12;
      for (let p = 0; p < particleCount; p++) {
        const angle = (p / particleCount) * Math.PI * 2 + phase * 0.5;
        const particleDist = baseRadius + 14 + Math.sin(phase * 2 + p) * (state === 'speaking' ? 12 : 5);
        const px = centerX + Math.cos(angle) * particleDist;
        const py = centerY + Math.sin(angle) * particleDist;

        ctx.beginPath();
        ctx.arc(px, py, state === 'speaking' ? 3 : 2, 0, Math.PI * 2);
        ctx.fillStyle = (p % 2 === 0 ? primaryColor : secondaryColor) + '0.8)';
        ctx.shadowBlur = 10;
        ctx.shadowColor = (p % 2 === 0 ? primaryColor : secondaryColor) + '1)';
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Central glowing core
      const coreGradient = ctx.createRadialGradient(
        centerX, centerY, 5,
        centerX, centerY, baseRadius
      );
      coreGradient.addColorStop(0, primaryColor + '0.9)');
      coreGradient.addColorStop(0.6, secondaryColor + '0.5)');
      coreGradient.addColorStop(1, 'rgba(15, 23, 42, 0)');

      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius, 0, Math.PI * 2);
      ctx.fillStyle = coreGradient;
      ctx.fill();

      // Equalizer bars if speaking or listening
      if (state === 'speaking' || state === 'listening') {
        const barCount = 14;
        const barWidth = 3;
        const spacing = 6;
        const startX = centerX - ((barCount * (barWidth + spacing)) / 2);

        for (let b = 0; b < barCount; b++) {
          const barHeight = Math.abs(Math.sin(phase * 3 + b * 0.6)) * (state === 'speaking' ? 35 : 18) + 6;
          const bx = startX + b * (barWidth + spacing);
          const by = centerY - barHeight / 2;

          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.roundRect(bx, by, barWidth, barHeight, 2);
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [state]);

  const getStateBadge = () => {
    switch (state) {
      case 'listening':
        return {
          icon: <Mic className="w-4 h-4 text-cyan-400 animate-pulse" />,
          label: 'AURA is Listening...',
          classes: 'bg-cyan-950/70 border-cyan-500/40 text-cyan-300'
        };
      case 'thinking':
        return {
          icon: <BrainCircuit className="w-4 h-4 text-purple-400 animate-spin" />,
          label: 'Processing Request...',
          classes: 'bg-purple-950/70 border-purple-500/40 text-purple-300'
        };
      case 'speaking':
        return {
          icon: <Volume2 className="w-4 h-4 text-emerald-400 animate-bounce-subtle" />,
          label: 'AURA is Speaking',
          classes: 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300'
        };
      default:
        return {
          icon: <Sparkles className="w-4 h-4 text-slate-400" />,
          label: 'AURA Online & Ready',
          classes: 'bg-slate-900/60 border-slate-700/50 text-slate-300'
        };
    }
  };

  const badge = getStateBadge();

  return (
    <div className="flex flex-col items-center justify-center p-6 text-center select-none">
      {/* Holographic Avatar Canvas */}
      <div
        className="relative group cursor-pointer select-none touch-none"
        onPointerDown={(e) => {
          e.preventDefault();
          if (onHoldStart) onHoldStart();
        }}
        onPointerUp={(e) => {
          e.preventDefault();
          if (onHoldEnd) onHoldEnd();
        }}
        onPointerLeave={() => {
          if (state === 'listening' && onHoldEnd) onHoldEnd();
        }}
        onPointerCancel={() => {
          if (state === 'listening' && onHoldEnd) onHoldEnd();
        }}
      >
        <canvas
          ref={canvasRef}
          width={260}
          height={260}
          className="relative z-10 drop-shadow-[0_0_35px_rgba(6,182,212,0.35)] transition-transform duration-300 group-hover:scale-105"
        />

        {/* Ambient background glow ring */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-500/20 via-purple-500/10 to-transparent blur-2xl -z-0" />
      </div>

      {/* State Status Badge */}
      <div className={`mt-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-semibold backdrop-blur-md transition-all duration-300 shadow-sm ${badge.classes}`}>
        {badge.icon}
        <span>{badge.label}</span>
      </div>

      {/* Live Mic Transcript or Prompt */}
      <div className="mt-4 min-h-[44px] flex items-center justify-center max-w-sm px-4">
        {state === 'listening' ? (
          <p className="text-sm text-cyan-300 italic animate-pulse">
            "{transcript || 'Speak now, AURA is listening...'}"
          </p>
        ) : (
          <p className="text-xs text-slate-400">
            Press &amp; hold the avatar or <span className="text-cyan-400 font-medium">Hold to Speak</span> button below
          </p>
        )}
      </div>
    </div>
  );
}

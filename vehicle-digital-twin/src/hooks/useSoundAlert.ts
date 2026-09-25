import { useState, useCallback, useRef } from 'react';

export function useSoundAlert() {
  const [isMuted, setIsMuted] = useState(false);
  const [visualNotice, setVisualNotice] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const getAudioContext = () => {
    if (typeof window === 'undefined') return null;
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume().catch(() => {});
    }
    return audioCtxRef.current;
  };

  const playChime = useCallback((type: 'beep' | 'approach' | 'enter' | 'override' | 'click' = 'beep') => {
    // Show visual notice for accessibility
    const label =
      type === 'approach'
        ? 'CHIME: ZONE APPROACH ALERT'
        : type === 'enter'
        ? 'TONE: SPEED CONTROL ENGAGED'
        : type === 'override'
        ? 'ALERT: EMERGENCY OVERRIDE'
        : type === 'click'
        ? 'SIGNAL: HARDWARE CONTACT'
        : 'BEEP: CAUTION NOTIFICATION';

    setVisualNotice(label);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setVisualNotice(null), 2500);

    if (isMuted) return;

    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;

      if (type === 'approach') {
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.setValueAtTime(880.0, now + 0.1); // A5
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === 'enter') {
        osc.frequency.setValueAtTime(440, now); // A4
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      } else if (type === 'override') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.15);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
      } else if (type === 'click') {
        osc.frequency.setValueAtTime(320, now);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else {
        osc.frequency.setValueAtTime(740, now);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      }
    } catch {
      // Audio context might be restricted before user gesture
    }
  }, [isMuted]);

  return {
    isMuted,
    setIsMuted,
    playChime,
    visualNotice,
  };
}

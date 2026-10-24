'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

interface XWingShip {
  id: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  progress: number;
  speed: number;
  scale: number;
  bankAngle: number;
  callsign: string;
  lasers: Array<{ progressOffset: number; yOffset: number }>;
}

// Exact frequencies (Hz) for Star Wars Imperial March in G Minor
const NOTE_FREQ: Record<string, number> = {
  Eb2: 77.78,
  Fsharp2: 92.5,
  G2: 98.0,
  Ab2: 103.83,
  Bb2: 116.54,
  C3: 130.81,
  Db3: 138.59,
  D3: 146.83,
  Eb3: 155.56,
  Fsharp3: 185.0,
  G3: 196.0,
  Eb4: 311.13,
  Fsharp4: 369.99,
  G4: 392.0,
  Ab4: 415.3,
  A4: 440.0,
  Bb4: 466.16,
  B4: 493.88,
  C5: 523.25,
  Db5: 554.37,
  D5: 587.33,
  Eb5: 622.25,
  E5: 659.25,
  F5: 698.46,
  Fsharp5: 739.99,
  G5: 783.99,
  REST: 0,
};

// Imperial March Melody Sequence: [note, beats (1 beat = 0.52s at ~115 BPM), bassNote]
const IMPERIAL_MARCH_SCORE: Array<[string, number, string]> = [
  // Measure 1
  ['G4', 1.0, 'G2'],
  ['G4', 1.0, 'G2'],
  ['G4', 1.0, 'G2'],
  ['Eb4', 0.75, 'Eb2'],
  ['Bb4', 0.25, 'Bb2'],
  // Measure 2
  ['G4', 1.0, 'G2'],
  ['Eb4', 0.75, 'Eb2'],
  ['Bb4', 0.25, 'Bb2'],
  ['G4', 2.0, 'G2'],
  // Measure 3
  ['D5', 1.0, 'D3'],
  ['D5', 1.0, 'D3'],
  ['D5', 1.0, 'D3'],
  ['Eb5', 0.75, 'Eb3'],
  ['Bb4', 0.25, 'Bb2'],
  // Measure 4
  ['Fsharp4', 1.0, 'Fsharp2'],
  ['Eb4', 0.75, 'Eb2'],
  ['Bb4', 0.25, 'Bb2'],
  ['G4', 2.0, 'G2'],
  // Measure 5 (High Brass Climax)
  ['G5', 1.0, 'G3'],
  ['G4', 0.75, 'G2'],
  ['G4', 0.25, 'G2'],
  ['G5', 1.0, 'G3'],
  ['Fsharp5', 0.75, 'Fsharp3'],
  ['F5', 0.25, 'D3'],
  // Measure 6
  ['E5', 0.25, 'C3'],
  ['Eb5', 0.25, 'C3'],
  ['E5', 0.5, 'C3'],
  ['REST', 0.5, 'REST'],
  ['Ab4', 0.5, 'Ab2'],
  ['Db5', 1.0, 'Db3'],
  ['C5', 0.75, 'C3'],
  ['B4', 0.25, 'G2'],
  // Measure 7
  ['Bb4', 0.25, 'Bb2'],
  ['A4', 0.25, 'Bb2'],
  ['Bb4', 0.5, 'Bb2'],
  ['REST', 0.5, 'REST'],
  ['Eb4', 0.5, 'Eb2'],
  ['Fsharp4', 1.0, 'Fsharp2'],
  ['Eb4', 0.75, 'Eb2'],
  ['Fsharp4', 0.25, 'Fsharp2'],
  // Measure 8 (Resolution)
  ['Bb4', 1.0, 'Bb2'],
  ['G4', 0.75, 'G2'],
  ['Bb4', 0.25, 'Bb2'],
  ['D5', 2.0, 'D3'],
  // Measure 9 (Final cadence)
  ['G5', 1.0, 'G3'],
  ['G4', 0.75, 'G2'],
  ['G4', 0.25, 'G2'],
  ['G5', 1.0, 'G3'],
  ['Fsharp5', 0.75, 'Fsharp3'],
  ['F5', 0.25, 'D3'],
  // Measure 10
  ['E5', 0.25, 'C3'],
  ['Eb5', 0.25, 'C3'],
  ['E5', 0.5, 'C3'],
  ['REST', 0.5, 'REST'],
  ['Ab4', 0.5, 'Ab2'],
  ['Db5', 1.0, 'Db3'],
  ['C5', 0.75, 'C3'],
  ['B4', 0.25, 'G2'],
  // Measure 11
  ['Bb4', 0.25, 'Bb2'],
  ['A4', 0.25, 'Bb2'],
  ['Bb4', 0.5, 'Bb2'],
  ['REST', 0.5, 'REST'],
  ['Eb4', 0.5, 'Eb2'],
  ['Fsharp4', 1.0, 'Fsharp2'],
  ['Eb4', 0.75, 'Eb2'],
  ['Bb4', 0.25, 'Bb2'],
  // Measure 12
  ['G4', 1.0, 'G2'],
  ['Eb4', 0.75, 'Eb2'],
  ['Bb4', 0.25, 'Bb2'],
  ['G4', 2.0, 'G2'],
];

export default function StarWarsAudioAndXWingEngine() {
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const isPlayingMarchRef = useRef<boolean>(false);
  const marchTimerRef = useRef<number | null>(null);
  const stepIndexRef = useRef<number>(0);

  const [isMarchPlaying, setIsMarchPlaying] = useState<boolean>(false);
  const [autoXWingEnabled, setAutoXWingEnabled] = useState<boolean>(true);
  const [activeSquadronAlert, setActiveSquadronAlert] = useState<string | null>(null);
  const [needsUserGestureBanner, setNeedsUserGestureBanner] = useState<boolean>(false);

  const shipsRef = useRef<XWingShip[]>([]);

  const ensureAudioContext = useCallback((): AudioContext | null => {
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
  }, []);

  // Synthesize a single Imperial Brass + Bass + Snare step
  const playImperialNote = useCallback(
    (noteName: string, bassName: string, durationSec: number) => {
      const ctx = ensureAudioContext();
      if (!ctx || ctx.state !== 'running') return;

      const now = ctx.currentTime;
      const freq = NOTE_FREQ[noteName] || 0;
      const bassFreq = NOTE_FREQ[bassName] || 0;

      // 1. Lead Imperial Brass (Dual detuned sawtooth through warm low-pass brass filter)
      if (freq > 0) {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        osc1.type = 'sawtooth';
        osc2.type = 'sawtooth';
        osc1.frequency.setValueAtTime(freq, now);
        osc2.frequency.setValueAtTime(freq * 1.004, now); // Symphonic brass chorus detune

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(freq * 3.8, now);
        filter.frequency.exponentialRampToValueAtTime(freq * 1.6, now + durationSec * 0.88);
        filter.Q.setValueAtTime(2.4, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.14, now + 0.035);
        gain.gain.exponentialRampToValueAtTime(0.08, now + durationSec * 0.75);
        gain.gain.exponentialRampToValueAtTime(0.0008, now + durationSec * 0.94);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + durationSec * 0.96);
        osc2.stop(now + durationSec * 0.96);
      }

      // 2. Orchestral Low Brass / Tuba Bassline
      if (bassFreq > 0) {
        const bassOsc = ctx.createOscillator();
        const bassFilter = ctx.createBiquadFilter();
        const bassGain = ctx.createGain();

        bassOsc.type = 'triangle';
        bassOsc.frequency.setValueAtTime(bassFreq, now);

        bassFilter.type = 'lowpass';
        bassFilter.frequency.setValueAtTime(340, now);

        bassGain.gain.setValueAtTime(0.001, now);
        bassGain.gain.linearRampToValueAtTime(0.18, now + 0.02);
        bassGain.gain.exponentialRampToValueAtTime(0.001, now + durationSec * 0.9);

        bassOsc.connect(bassFilter);
        bassFilter.connect(bassGain);
        bassGain.connect(ctx.destination);

        bassOsc.start(now);
        bassOsc.stop(now + durationSec * 0.92);
      }

      // 3. Crisp Imperial Military Snare Hit
      const bufferSize = Math.floor(ctx.sampleRate * 0.09);
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.025));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      const snareFilter = ctx.createBiquadFilter();
      snareFilter.type = 'highpass';
      snareFilter.frequency.setValueAtTime(950, now);
      const snareGain = ctx.createGain();
      snareGain.gain.setValueAtTime(0.055, now);
      snareGain.gain.exponentialRampToValueAtTime(0.001, now + 0.085);

      noise.connect(snareFilter);
      snareFilter.connect(snareGain);
      snareGain.connect(ctx.destination);
      noise.start(now);
    },
    [ensureAudioContext]
  );

  // Schedule loop for the Imperial March
  const stepImperialMarch = useCallback(() => {
    if (!isPlayingMarchRef.current) return;
    const [note, beats, bass] = IMPERIAL_MARCH_SCORE[stepIndexRef.current % IMPERIAL_MARCH_SCORE.length];
    const beatDurationSec = 0.5; // 120 BPM march tempo
    const durationSec = beats * beatDurationSec;

    playImperialNote(note, bass, durationSec);
    stepIndexRef.current = (stepIndexRef.current + 1) % IMPERIAL_MARCH_SCORE.length;

    marchTimerRef.current = window.setTimeout(stepImperialMarch, durationSec * 1000);
  }, [playImperialNote]);

  const startImperialMarch = useCallback(() => {
    const ctx = ensureAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().then(() => {
        if (!isPlayingMarchRef.current) {
          isPlayingMarchRef.current = true;
          setIsMarchPlaying(true);
          setNeedsUserGestureBanner(false);
          stepImperialMarch();
        }
      }).catch(() => {
        setNeedsUserGestureBanner(true);
      });
      return;
    }

    if (!isPlayingMarchRef.current) {
      isPlayingMarchRef.current = true;
      setIsMarchPlaying(true);
      setNeedsUserGestureBanner(false);
      stepImperialMarch();
    }
  }, [ensureAudioContext, stepImperialMarch]);

  const stopImperialMarch = useCallback(() => {
    isPlayingMarchRef.current = false;
    setIsMarchPlaying(false);
    if (marchTimerRef.current) {
      clearTimeout(marchTimerRef.current);
      marchTimerRef.current = null;
    }
  }, []);

  // Synthesize Authentic X-Wing Spacecraft Sound (Twin-Ion Turbine Doppler Roar + Quad Laser Cannon Blasts)
  const playXWingSpacecraftSound = useCallback(
    (direction: 1 | -1 = 1) => {
      const ctx = ensureAudioContext();
      if (!ctx || ctx.state !== 'running') return;

      const now = ctx.currentTime;
      const flybyDuration = 2.6;

      // Stereo Panner for 3D spatial left-to-right or right-to-left flyby
      const panner = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      if (panner) {
        panner.pan.setValueAtTime(-0.85 * direction, now);
        panner.pan.linearRampToValueAtTime(0.85 * direction, now + flybyDuration);
        panner.connect(ctx.destination);
      }
      const targetNode = panner || ctx.destination;

      // 1. X-Wing Incom 4L4 Fusial Thrust Engine Howl (Doppler pitch shift)
      const turbine1 = ctx.createOscillator();
      const turbine2 = ctx.createOscillator();
      const turbineFilter = ctx.createBiquadFilter();
      const turbineGain = ctx.createGain();

      turbine1.type = 'sawtooth';
      turbine2.type = 'triangle';

      // Doppler shift: approaches high (320Hz -> 490Hz at center -> drops to 165Hz as it passes)
      turbine1.frequency.setValueAtTime(290, now);
      turbine1.frequency.exponentialRampToValueAtTime(510, now + flybyDuration * 0.44);
      turbine1.frequency.exponentialRampToValueAtTime(155, now + flybyDuration);

      turbine2.frequency.setValueAtTime(585, now);
      turbine2.frequency.exponentialRampToValueAtTime(1020, now + flybyDuration * 0.44);
      turbine2.frequency.exponentialRampToValueAtTime(310, now + flybyDuration);

      turbineFilter.type = 'bandpass';
      turbineFilter.frequency.setValueAtTime(600, now);
      turbineFilter.frequency.exponentialRampToValueAtTime(1400, now + flybyDuration * 0.45);
      turbineFilter.frequency.exponentialRampToValueAtTime(420, now + flybyDuration);
      turbineFilter.Q.setValueAtTime(3.2, now);

      turbineGain.gain.setValueAtTime(0.001, now);
      turbineGain.gain.linearRampToValueAtTime(0.18, now + flybyDuration * 0.42);
      turbineGain.gain.exponentialRampToValueAtTime(0.001, now + flybyDuration);

      turbine1.connect(turbineFilter);
      turbine2.connect(turbineFilter);
      turbineFilter.connect(turbineGain);
      turbineGain.connect(targetNode);

      turbine1.start(now);
      turbine2.start(now);
      turbine1.stop(now + flybyDuration);
      turbine2.stop(now + flybyDuration);

      // 2. Jet Afterburner Roar (Filtered White Noise with Doppler Envelope)
      const noiseLen = Math.floor(ctx.sampleRate * flybyDuration);
      const noiseBuf = ctx.createBuffer(1, noiseLen, ctx.sampleRate);
      const out = noiseBuf.getChannelData(0);
      for (let i = 0; i < noiseLen; i++) {
        out[i] = Math.random() * 2 - 1;
      }
      const noiseSrc = ctx.createBufferSource();
      noiseSrc.buffer = noiseBuf;

      const jetFilter = ctx.createBiquadFilter();
      jetFilter.type = 'bandpass';
      jetFilter.frequency.setValueAtTime(450, now);
      jetFilter.frequency.exponentialRampToValueAtTime(1600, now + flybyDuration * 0.45);
      jetFilter.frequency.exponentialRampToValueAtTime(320, now + flybyDuration);
      jetFilter.Q.setValueAtTime(1.8, now);

      const jetGain = ctx.createGain();
      jetGain.gain.setValueAtTime(0.001, now);
      jetGain.gain.linearRampToValueAtTime(0.14, now + flybyDuration * 0.45);
      jetGain.gain.exponentialRampToValueAtTime(0.001, now + flybyDuration);

      noiseSrc.connect(jetFilter);
      jetFilter.connect(jetGain);
      jetGain.connect(targetNode);
      noiseSrc.start(now);

      // 3. Quad Taim & Bak KX9 Laser Cannon Blasts ("PEW! PEW! PEW!")
      const laserTimes = [0.35, 0.52, 0.69, 1.05, 1.22];
      for (const offset of laserTimes) {
        const t0 = now + offset;
        const laserOsc = ctx.createOscillator();
        const laserGain = ctx.createGain();

        laserOsc.type = 'sawtooth';
        laserOsc.frequency.setValueAtTime(1650, t0);
        laserOsc.frequency.exponentialRampToValueAtTime(190, t0 + 0.13);

        laserGain.gain.setValueAtTime(0.13, t0);
        laserGain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.135);

        laserOsc.connect(laserGain);
        laserGain.connect(targetNode);

        laserOsc.start(t0);
        laserOsc.stop(t0 + 0.14);
      }
    },
    [ensureAudioContext]
  );

  // Spawn an X-Wing Squadron across the screen + play X-Wing spacecraft sounds
  const launchXWingSquadron = useCallback(() => {
    if (typeof window === 'undefined') return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const leftToRight = Math.random() > 0.35;

    const callsigns = ['RED LEADER (YANIV-1)', 'RED TWO (WEDGE)', 'RED FIVE (ROGUE)'];
    const baseStartY = h * (0.18 + Math.random() * 0.35);
    const baseEndY = h * (0.12 + Math.random() * 0.45);

    const newShips: XWingShip[] = callsigns.map((callsign, idx) => ({
      id: Date.now() + idx + Math.random(),
      startX: leftToRight ? -180 - idx * 110 : w + 180 + idx * 110,
      startY: baseStartY + (idx - 1) * 68,
      endX: leftToRight ? w + 240 : -240,
      endY: baseEndY + (idx - 1) * 52,
      progress: 0,
      speed: 0.38 + idx * 0.03,
      scale: 1.05 - idx * 0.12,
      bankAngle: (leftToRight ? 1 : -1) * (0.15 - idx * 0.04),
      callsign,
      lasers: [
        { progressOffset: 0.06, yOffset: -14 },
        { progressOffset: 0.13, yOffset: 14 },
      ],
    }));

    shipsRef.current = [...shipsRef.current, ...newShips];
    playXWingSpacecraftSound(leftToRight ? 1 : -1);

    setActiveSquadronAlert('🚀 X-WING SQUADRON FLYBY — S-FOILS LOCKED IN ATTACK POSITION');
    window.setTimeout(() => {
      setActiveSquadronAlert(null);
    }, 3100);
  }, [playXWingSpacecraftSound]);

  // Attempt to launch Imperial March on mount + unlock on first user interaction if browser blocks autoplay
  useEffect(() => {
    const tryAutoLaunch = () => {
      const ctx = ensureAudioContext();
      if (ctx && ctx.state === 'running') {
        startImperialMarch();
        launchXWingSquadron();
      } else {
        setNeedsUserGestureBanner(true);
      }
    };

    tryAutoLaunch();

    const unlockOnGesture = () => {
      const ctx = ensureAudioContext();
      if (ctx) {
        ctx.resume().then(() => {
          if (!isPlayingMarchRef.current) {
            startImperialMarch();
            launchXWingSquadron();
          }
          setNeedsUserGestureBanner(false);
        }).catch(() => {});
      }
      window.removeEventListener('pointerdown', unlockOnGesture);
      window.removeEventListener('keydown', unlockOnGesture);
    };

    window.addEventListener('pointerdown', unlockOnGesture);
    window.addEventListener('keydown', unlockOnGesture);

    // Custom event so the Realm Post Form can trigger an X-Wing celebratory flyby!
    const handleCustomFlyby = () => launchXWingSquadron();
    window.addEventListener('realm:xwing-flyby', handleCustomFlyby);

    return () => {
      window.removeEventListener('pointerdown', unlockOnGesture);
      window.removeEventListener('keydown', unlockOnGesture);
      window.removeEventListener('realm:xwing-flyby', handleCustomFlyby);
      if (marchTimerRef.current) clearTimeout(marchTimerRef.current);
    };
  }, [ensureAudioContext, startImperialMarch, launchXWingSquadron]);

  // Periodic automatic X-Wing flybys from time to time (every 14 seconds)
  useEffect(() => {
    if (!autoXWingEnabled) return;
    const interval = window.setInterval(() => {
      launchXWingSquadron();
    }, 14000);
    return () => clearInterval(interval);
  }, [autoXWingEnabled, launchXWingSquadron]);

  // Render 3D X-Wing Starfighters on the full-screen HUD Canvas
  useEffect(() => {
    const canvas = overlayCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let lastTime = performance.now();

    const drawXWing3D = (
      x: number,
      y: number,
      angle: number,
      scale: number,
      bank: number,
      callsign: string,
      now: number
    ) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.scale(scale, scale);

      // 1. Quad Ion Engine Afterburner Thruster Plumes (Glowing Magenta/Orange)
      const thrusterFlicker = 0.85 + Math.sin(now * 0.04) * 0.25;
      const engineOffsets = [-18, -8, 8, 18];
      for (const ey of engineOffsets) {
        const grad = ctx.createLinearGradient(-52 * thrusterFlicker, ey, -14, ey);
        grad.addColorStop(0, 'rgba(244, 63, 94, 0)');
        grad.addColorStop(0.5, 'rgba(251, 113, 133, 0.75)');
        grad.addColorStop(1, '#fff1f2');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(-16, ey - 3.2);
        ctx.lineTo(-54 * thrusterFlicker, ey);
        ctx.lineTo(-16, ey + 3.2);
        ctx.closePath();
        ctx.fill();
      }

      // 2. S-Foils (4 swept X-Wings with Rebel Red Squadron markings & wingtip laser cannons)
      ctx.fillStyle = '#cbd5e1';
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.4;

      // Upper and Lower swept wings
      const wingSpan = 36 + bank * 12;
      ctx.beginPath();
      ctx.moveTo(-14, -6);
      ctx.lineTo(-22, -wingSpan);
      ctx.lineTo(-6, -wingSpan);
      ctx.lineTo(6, -6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(-14, 6);
      ctx.lineTo(-22, wingSpan);
      ctx.lineTo(-6, wingSpan);
      ctx.lineTo(6, 6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Red Squadron Stripes on Wings
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-16, -wingSpan + 5, 8, 5);
      ctx.fillRect(-16, wingSpan - 10, 8, 5);

      // 4 Wingtip Taim & Bak KX9 Laser Cannons
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      for (const wy of [-wingSpan, -wingSpan + 6, wingSpan - 6, wingSpan]) {
        ctx.beginPath();
        ctx.moveTo(-10, wy);
        ctx.lineTo(28, wy);
        ctx.stroke();

        // Glowing red muzzle flash
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(29, wy, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. Long Tapered X-Wing Fuselage & Nose Cone
      ctx.fillStyle = '#f1f5f9';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-24, -7);
      ctx.lineTo(44, -2.2);
      ctx.lineTo(54, 0);
      ctx.lineTo(44, 2.2);
      ctx.lineTo(-24, 7);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Cockpit Canopy & R2 Astromech Droid Dome
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.ellipse(2, 0, 10, 3.8, 0, 0, Math.PI * 2);
      ctx.fill();

      // R2 unit dome behind cockpit
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(-10, 0, 3.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // Tactical HUD Callsign Tag above X-Wing
      ctx.save();
      ctx.font = '700 10px ui-monospace, SFMono-Regular, Menlo, monospace';
      ctx.fillStyle = 'rgba(56, 189, 248, 0.92)';
      ctx.fillText(callsign, x - 38, y - 44 * scale);
      ctx.restore();
    };

    const renderLoop = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      const dpr = window.devicePixelRatio || 1;
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      // Update and render active X-Wings
      const remaining: XWingShip[] = [];
      for (const ship of shipsRef.current) {
        ship.progress += dt * ship.speed;
        if (ship.progress <= 1.15) {
          remaining.push(ship);

          const x = ship.startX + (ship.endX - ship.startX) * ship.progress;
          const y =
            ship.startY +
            (ship.endY - ship.startY) * ship.progress +
            Math.sin(ship.progress * Math.PI * 2.5) * 28;
          const angle = Math.atan2(ship.endY - ship.startY, ship.endX - ship.startX);

          // Draw streaking quad laser bolts ahead of the X-Wing
          for (const bolt of ship.lasers) {
            const boltProg = (ship.progress * 2.4 + bolt.progressOffset) % 1;
            const bx = x + Math.cos(angle) * (65 + boltProg * 360);
            const by = y + Math.sin(angle) * (65 + boltProg * 360) + bolt.yOffset;

            ctx.save();
            ctx.strokeStyle = '#f43f5e';
            ctx.shadowColor = '#f43f5e';
            ctx.shadowBlur = 12;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(bx, by);
            ctx.lineTo(bx + Math.cos(angle) * 38, by + Math.sin(angle) * 38);
            ctx.stroke();
            ctx.restore();
          }

          drawXWing3D(x, y, angle, ship.scale, ship.bankAngle, ship.callsign, now);
        }
      }
      shipsRef.current = remaining;

      ctx.restore();
      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <>
      {/* Full-Screen 3D X-Wing Starfighter Flyby Overlay Canvas */}
      <canvas
        ref={overlayCanvasRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
          zIndex: 90,
        }}
      />

      {/* Top Squadron Alert Toast when X-Wings streak across the screen */}
      {activeSquadronAlert && (
        <div
          style={{
            position: 'fixed',
            top: '5.2rem',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 95,
            background: 'rgba(15, 23, 42, 0.92)',
            border: '1px solid #f43f5e',
            boxShadow: '0 0 30px rgba(244, 63, 94, 0.45)',
            color: '#fda4af',
            padding: '0.5rem 1.15rem',
            borderRadius: '999px',
            fontSize: '0.78rem',
            fontWeight: 800,
            letterSpacing: '0.06em',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            pointerEvents: 'none',
          }}
        >
          {activeSquadronAlert}
        </div>
      )}

      {/* Prominent One-Click Audio Launch Banner if Browser Blocked Unmuted Autoplay */}
      {needsUserGestureBanner && !isMarchPlaying && (
        <div
          style={{
            position: 'fixed',
            bottom: '5.5rem',
            right: '1.5rem',
            zIndex: 100,
            background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.95), rgba(99, 102, 241, 0.95))',
            color: '#ffffff',
            padding: '0.75rem 1.2rem',
            borderRadius: '0.85rem',
            boxShadow: '0 15px 40px rgba(244, 63, 94, 0.5)',
            cursor: 'pointer',
            fontWeight: 800,
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            border: '1px solid rgba(255,255,255,0.4)',
          }}
          onClick={() => {
            startImperialMarch();
            launchXWingSquadron();
          }}
        >
          <span>🔊 Click Anywhere to Engage Imperial March & X-Wing Audio</span>
        </div>
      )}

      {/* Floating Galactic Audio & X-Wing Command Deck */}
      <div
        style={{
          position: 'fixed',
          bottom: '1.25rem',
          right: '1.25rem',
          zIndex: 99,
          display: 'flex',
          alignItems: 'center',
          gap: '0.55rem',
          flexWrap: 'wrap',
          padding: '0.65rem 0.9rem',
          borderRadius: '0.9rem',
          background: 'rgba(6, 10, 24, 0.92)',
          border: '1px solid rgba(56, 189, 248, 0.45)',
          boxShadow: '0 20px 50px rgba(2, 6, 23, 0.9)',
          backdropFilter: 'blur(14px)',
        }}
      >
        <button
          type="button"
          onClick={() => (isMarchPlaying ? stopImperialMarch() : startImperialMarch())}
          className={`btn btn-sm ${isMarchPlaying ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.78rem' }}
        >
          {isMarchPlaying ? '🎵 Imperial March: PLAYING (Pause)' : '🎵 Play Star Wars Imperial March'}
        </button>

        <button
          type="button"
          onClick={launchXWingSquadron}
          className="btn btn-sm btn-secondary"
          style={{
            fontSize: '0.78rem',
            borderColor: 'rgba(244, 63, 94, 0.55)',
            color: '#fda4af',
          }}
        >
          🚀 Scramble X-Wings (Flyby + Sound)
        </button>

        <button
          type="button"
          onClick={() => setAutoXWingEnabled((v) => !v)}
          className="btn btn-sm btn-secondary"
          style={{ fontSize: '0.74rem', padding: '0.38rem 0.65rem' }}
        >
          {autoXWingEnabled ? '⏱ Auto Flyby: ON' : '⏱ Auto Flyby: OFF'}
        </button>
      </div>
    </>
  );
}

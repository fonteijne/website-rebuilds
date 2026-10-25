// Timergeluid via Web Audio (geen geluidsbestand nodig). iOS staat geluid pas toe na een tik,
// dus unlock() wordt aangeroepen bij het starten van een timer.

let ctx: AudioContext | null = null;

export function unlockAudio() {
  try {
    ctx ??= new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
  } catch {
    ctx = null;
  }
}

export function beep() {
  if (!ctx) return;
  const t = ctx.currentTime;
  for (const [offset, freq] of [[0, 880], [0.22, 880], [0.44, 1175]] as const) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, t + offset);
    gain.gain.exponentialRampToValueAtTime(0.35, t + offset + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + offset + 0.18);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t + offset);
    osc.stop(t + offset + 0.2);
  }
  try {
    navigator.vibrate?.([200, 100, 200]);
  } catch {
    // Niet elk apparaat kan trillen.
  }
}

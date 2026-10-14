// Pure game rules, independent of rendering, storage and advertisements.
export const ROUND_SECONDS = 60;

export class OfficeGame {
  constructor(random = Math.random) {
    this.random = random;
    this.elapsed = 0;
    this.score = 0;
    this.suspicion = 0;
    this.slacking = false;
    this.streak = 0;
    this.slackTime = 0;
    this.evades = 0;
    this.phase = 'away';
    this.phaseLeft = 4;
    this.status = 'playing';
    this.cycleSlacked = false;
    this.cycleClean = true;
    this.events = [];
  }
  get level() { return Math.min(3, 1 + Math.floor(this.elapsed / 20)); }
  get multiplier() { return 1 + Math.min(2, Math.floor(this.streak / 2)); }
  get remaining() { return Math.max(0, ROUND_SECONDS - this.elapsed); }
  toggle() {
    if (this.status !== 'playing') return;
    this.slacking = !this.slacking;
    if (!this.slacking) this.streak = 0;
  }
  transition() {
    if (this.phase === 'away') {
      this.phase = 'warning';
      this.phaseLeft = 1.2 - (this.level - 1) * 0.2;
    } else if (this.phase === 'warning') {
      this.phase = 'watching';
      this.phaseLeft = 1.6 + this.random() * 1.2 + (this.level - 1) * 0.2;
    } else {
      if (this.cycleSlacked && this.cycleClean) {
        this.evades++;
        this.score += 120;
        this.events.push({ type: 'evade', bonus: 120 });
      }
      this.phase = 'away';
      this.phaseLeft = 3 + this.random() * 2 - (this.level - 1) * 0.35;
      this.cycleSlacked = false;
      this.cycleClean = true;
    }
    this.events.push({ type: this.phase });
  }
  finish(reason) {
    if (reason === 'survived') this.elapsed = ROUND_SECONDS;
    if (reason === 'caught') this.suspicion = 100;
    this.status = 'finished';
    this.slacking = false;
    this.reason = reason;
    this.events.push({ type: 'finish', reason });
  }
  update(seconds) {
    if (this.status !== 'playing' || !Number.isFinite(seconds) || seconds <= 0) return;
    // Split at phase boundaries: a slow frame must never skip the boss's gaze.
    let left = Math.min(seconds, this.remaining);
    while (left > 1e-8 && this.status === 'playing') {
      const dt = Math.min(left, this.phaseLeft, this.remaining, 0.02);
      const levelBefore = this.level;
      if (this.slacking) {
        this.slackTime += dt;
        this.cycleSlacked = true;
        if (this.phase === 'watching') {
          this.cycleClean = false;
          this.suspicion = Math.min(100, this.suspicion + 58 * dt);
          this.streak = 0;
        } else {
          this.score += 50 * this.multiplier * dt;
          this.streak += dt;
        }
      } else {
        this.suspicion = Math.max(0, this.suspicion - 6 * dt);
      }
      this.elapsed = Math.min(ROUND_SECONDS, this.elapsed + dt);
      this.phaseLeft -= dt;
      left -= dt;
      if (this.suspicion >= 100 - 1e-8) this.finish('caught');
      else if (this.remaining < 1e-8) this.finish('survived');
      else if (this.phaseLeft < 1e-8) this.transition();
      if (this.level > levelBefore && this.status === 'playing') this.events.push({ type: 'level', level: this.level });
    }
  }
  drainEvents() { return this.events.splice(0); }
}

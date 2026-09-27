"use client"

class GiveawaySoundManager {
  private ctx: AudioContext | null = null
  private enabled: boolean = true

  init() {
    if (typeof window === "undefined") return
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (AudioCtx && !this.ctx) {
        this.ctx = new AudioCtx()
      }
      if (this.ctx && this.ctx.state === "suspended") {
        this.ctx.resume()
      }
    } catch (e) {
      console.warn("AudioContext not supported:", e)
    }
  }

  playTick(frequency = 700) {
    if (!this.enabled || !this.ctx) return
    try {
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()
      osc.type = "sine"
      osc.frequency.setValueAtTime(frequency, this.ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.035)
      gain.gain.setValueAtTime(0.07, this.ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.035)
      osc.connect(gain)
      gain.connect(this.ctx.destination)
      osc.start()
      osc.stop(this.ctx.currentTime + 0.04)
    } catch {}
  }

  playReveal() {
    if (!this.enabled || !this.ctx) return
    try {
      // Warm chord: C5 (523.25), E5 (659.25), G5 (783.99), C6 (1046.50)
      const freqs = [523.25, 659.25, 783.99, 1046.50]
      freqs.forEach((f, i) => {
        const osc = this.ctx!.createOscillator()
        const gain = this.ctx!.createGain()
        osc.type = "triangle"
        const startTime = this.ctx!.currentTime + i * 0.07
        osc.frequency.setValueAtTime(f, startTime)
        gain.gain.setValueAtTime(0, startTime)
        gain.gain.linearRampToValueAtTime(0.1, startTime + 0.04)
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 1.1)
        osc.connect(gain)
        gain.connect(this.ctx!.destination)
        osc.start(startTime)
        osc.stop(startTime + 1.2)
      })
    } catch {}
  }

  setEnabled(val: boolean) {
    this.enabled = val
  }

  isEnabled() {
    return this.enabled
  }
}

export const giveawaySound = new GiveawaySoundManager()

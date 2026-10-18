import type { BciAdapter, BciEvent, BciStatus, MentalCommand } from './types'

export class MockBciAdapter implements BciAdapter {
  readonly source = 'mock' as const
  private listeners = new Set<(event: BciEvent) => void>()
  private running = false
  emit(command: MentalCommand) {
    if (!this.running) return
    const event: BciEvent = { id: crypto.randomUUID(), command, source: 'mock', receivedAt: new Date().toISOString() }
    this.listeners.forEach(listener => listener(event))
  }
  async start() { this.running = true }
  async stop() { this.running = false }
  onEvent(listener: (event: BciEvent) => void) { this.listeners.add(listener); return () => this.listeners.delete(listener) }
  getStatus(): BciStatus { return { mode: 'mock', headset: 'simulated', cortex: 'not-configured', profile: 'not-loaded' } }
}

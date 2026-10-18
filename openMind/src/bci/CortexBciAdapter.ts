import type { BciAdapter, BciEvent, BciStatus } from './types'

/** Deliberately pending until Cortex credentials, entitlements, and a headset are verified. */
export class CortexBciAdapter implements BciAdapter {
  readonly source = 'cortex' as const
  async start(): Promise<void> { throw new Error('Cortex integration is not configured. Add verified credentials and entitlements first.') }
  async stop() {}
  onEvent(_listener: (event: BciEvent) => void) { return () => undefined }
  getStatus(): BciStatus { return { mode: 'live', headset: 'disconnected', cortex: 'unavailable', profile: 'not-loaded' } }
}

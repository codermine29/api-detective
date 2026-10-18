export const commands = ['Push', 'Pull', 'Left', 'Right', 'Neutral', 'Unknown'] as const
export type MentalCommand = typeof commands[number]
export type BciSource = 'mock' | 'cortex'
export type BciEvent = { id: string; command: MentalCommand; source: BciSource; receivedAt: string }
export type BciStatus = { mode: 'mock' | 'live'; headset: 'simulated' | 'disconnected' | 'connected'; cortex: 'not-configured' | 'unavailable' | 'ready'; profile: 'not-loaded' | 'loaded' }
export interface BciAdapter { readonly source: BciSource; start(): Promise<void>; stop(): Promise<void>; onEvent(listener: (event: BciEvent) => void): () => void; getStatus(): BciStatus }

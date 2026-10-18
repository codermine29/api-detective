import { describe, expect, it } from 'vitest'
import { MockBciAdapter } from '../src/bci/MockBciAdapter'
describe('mock adapter', () => { it('emits simulated events only while running', async () => { const adapter = new MockBciAdapter(); const events: string[] = []; adapter.onEvent(event => events.push(event.command)); adapter.emit('Push'); expect(events).toEqual([]); await adapter.start(); adapter.emit('Push'); expect(events).toEqual(['Push']); expect(adapter.getStatus().headset).toBe('simulated') }) })

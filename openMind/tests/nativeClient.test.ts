import { describe, expect, it } from 'vitest'
import { isNativeAction } from '../src/native/helperClient'
describe('native action allowlist', () => { it('rejects arbitrary action names', () => { expect(isNativeAction('run-shell')).toBe(false); expect(isNativeAction('launch-mellow')).toBe(true) }) })

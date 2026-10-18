import { describe, expect, it } from 'vitest'
import { actionForCommand } from '../src/bci/commandMapping'
describe('command mapping', () => { it.each([['Push','NEXT_AGENT'],['Right','NEXT_AGENT'],['Left','PREVIOUS_AGENT'],['Pull','AGENT_OVERVIEW'],['Neutral','NO_OP'],['Unknown','NO_OP']])('%s maps to %s', (command, action) => expect(actionForCommand(command as never)).toBe(action)); it('allows a deliberate launch mapping', () => expect(actionForCommand('Push','Push')).toBe('LAUNCH_MELLOW')) })

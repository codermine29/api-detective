import type { MentalCommand } from './types'
export type Action = 'NEXT_AGENT' | 'PREVIOUS_AGENT' | 'AGENT_OVERVIEW' | 'NO_OP' | 'LAUNCH_MELLOW'
export const commandMapping: Record<MentalCommand, Action> = { Push: 'NEXT_AGENT', Pull: 'AGENT_OVERVIEW', Left: 'PREVIOUS_AGENT', Right: 'NEXT_AGENT', Neutral: 'NO_OP', Unknown: 'NO_OP' }
export function actionForCommand(command: MentalCommand, launchCommand?: MentalCommand): Action { return launchCommand === command ? 'LAUNCH_MELLOW' : commandMapping[command] }

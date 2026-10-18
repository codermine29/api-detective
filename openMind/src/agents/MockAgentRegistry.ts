import type { Agent } from './types'
export const agents: Agent[] = [
  { id: 'planner', name: 'Planner', role: 'Strategy & decomposition', state: 'READY', description: 'Turns intent into an actionable sequence.' },
  { id: 'builder', name: 'Builder', role: 'Implementation', state: 'STANDBY', description: 'Shapes approved plans into working artifacts.' },
  { id: 'validator', name: 'Validator', role: 'Quality & verification', state: 'STANDBY', description: 'Checks results against the mission criteria.' },
]

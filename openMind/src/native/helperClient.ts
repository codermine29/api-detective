export type NativeAction = 'launch-mellow' | 'spotlight-mellow'
export type NativeResult = { ok: boolean; message: string }
const allowed = new Set<NativeAction>(['launch-mellow', 'spotlight-mellow'])
export function isNativeAction(value: string): value is NativeAction { return allowed.has(value as NativeAction) }
export async function requestNativeAction(action: NativeAction, token = import.meta.env.VITE_HELPER_TOKEN): Promise<NativeResult> {
  if (!isNativeAction(action)) return { ok: false, message: 'Blocked: action is not allowlisted.' }
  if (!token) return { ok: false, message: 'Helper token is not configured. Start the local helper and set VITE_HELPER_TOKEN.' }
  try {
    const response = await fetch('http://127.0.0.1:4817/action', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-MindPilot-Token': token }, body: JSON.stringify({ action }) })
    const result = await response.json() as NativeResult
    return response.ok ? result : { ok: false, message: result.message || `Helper returned HTTP ${response.status}.` }
  } catch { return { ok: false, message: 'Native helper is unavailable at 127.0.0.1:4817.' } }
}

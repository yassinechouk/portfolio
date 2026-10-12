export type FormValues = { name: string; email: string; message: string; botcheck: string }
export type FormErrors = Partial<Record<'name' | 'email' | 'message', string>>
export type SubmitResult = { ok: true } | { ok: false; reason: 'network' | 'timeout' | 'server' }

const ENDPOINT = 'https://api.web3forms.com/submit'
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateForm(v: FormValues): FormErrors {
  const errors: FormErrors = {}
  if (v.name.trim() === '') errors.name = 'Please enter your name.'
  if (!EMAIL_RE.test(v.email.trim())) errors.email = 'Please enter a valid email address.'
  const len = v.message.trim().length
  if (len < 10) errors.message = 'Please write at least 10 characters.'
  else if (len > 2000) errors.message = 'Please keep the message under 2000 characters.'
  return errors
}

export async function submitForm(
  v: FormValues,
  accessKey: string,
  opts: { fetchImpl?: typeof fetch; timeoutMs?: number } = {},
): Promise<SubmitResult> {
  // A filled honeypot is a bot: pretend success, send nothing.
  if (v.botcheck !== '') return { ok: true }
  const fetchImpl = opts.fetchImpl ?? fetch
  const controller = new AbortController()
  let timedOut = false
  const timer = setTimeout(() => {
    timedOut = true
    controller.abort()
  }, opts.timeoutMs ?? 10000)
  try {
    const res = await fetchImpl(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        access_key: accessKey,
        name: v.name,
        email: v.email,
        message: v.message,
        subject: 'Portfolio query',
        from_name: v.name,
        botcheck: v.botcheck,
      }),
      signal: controller.signal,
    })
    if (!res.ok) return { ok: false, reason: 'server' }
    const body: unknown = await res.json().catch(() => null)
    const success = typeof body === 'object' && body !== null && (body as { success?: unknown }).success === true
    return success ? { ok: true } : { ok: false, reason: 'server' }
  } catch {
    return { ok: false, reason: timedOut ? 'timeout' : 'network' }
  } finally {
    clearTimeout(timer)
  }
}

export function isPlaceholderKey(key: string): boolean {
  return key.trim() === '' || key.includes('TODO')
}

import { describe, expect, it, vi } from 'vitest'
import { isPlaceholderKey, submitForm, validateForm, type FormValues } from './contactForm'

const valid: FormValues = {
  name: 'Ada',
  email: 'ada@example.com',
  message: 'Hello, I would like to talk about a project.',
  botcheck: '',
}
const KEY = '00000000-0000-0000-0000-000000000000'
const respond = (body: unknown, status = 200) =>
  vi.fn(async () => new Response(JSON.stringify(body), { status })) as unknown as typeof fetch

describe('validateForm', () => {
  it('flags empty name, bad email and short or long message', () => {
    expect(validateForm({ ...valid, name: '  ' }).name).toBeTruthy()
    expect(validateForm({ ...valid, email: 'nope' }).email).toBeTruthy()
    expect(validateForm({ ...valid, email: 'a@b' }).email).toBeTruthy()
    expect(validateForm({ ...valid, message: 'short' }).message).toBeTruthy()
    expect(validateForm({ ...valid, message: 'x'.repeat(2001) }).message).toBeTruthy()
  })
  it('accepts a valid set', () => {
    expect(validateForm(valid)).toEqual({})
  })
})

describe('submitForm', () => {
  it('sends the expected JSON body to the Web3Forms URL', async () => {
    const fetchImpl = respond({ success: true })
    await submitForm(valid, KEY, { fetchImpl })
    const [url, init] = (fetchImpl as unknown as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit]
    expect(url).toBe('https://api.web3forms.com/submit')
    expect(init.method).toBe('POST')
    expect(JSON.parse(init.body as string)).toEqual({
      access_key: KEY,
      name: 'Ada',
      email: 'ada@example.com',
      message: valid.message,
      subject: 'Portfolio query',
      from_name: 'Ada',
      botcheck: '',
    })
  })
  it('returns ok on {success:true}', async () => {
    expect(await submitForm(valid, KEY, { fetchImpl: respond({ success: true }) })).toEqual({ ok: true })
  })
  it('returns server on success:false and on HTTP 500', async () => {
    expect(await submitForm(valid, KEY, { fetchImpl: respond({ success: false }) })).toEqual({
      ok: false,
      reason: 'server',
    })
    expect(await submitForm(valid, KEY, { fetchImpl: respond({ success: true }, 500) })).toEqual({
      ok: false,
      reason: 'server',
    })
  })
  it('returns network when fetch throws', async () => {
    const fetchImpl = vi.fn(async () => {
      throw new TypeError('fail')
    }) as unknown as typeof fetch
    expect(await submitForm(valid, KEY, { fetchImpl })).toEqual({ ok: false, reason: 'network' })
  })
  it('returns timeout when the request never resolves', async () => {
    const fetchImpl = ((_u: string, init: RequestInit) =>
      new Promise((_res, rej) => {
        init.signal!.addEventListener('abort', () => rej(new DOMException('aborted', 'AbortError')))
      })) as unknown as typeof fetch
    expect(await submitForm(valid, KEY, { fetchImpl, timeoutMs: 20 })).toEqual({ ok: false, reason: 'timeout' })
  })
  it('a filled botcheck makes no request and returns ok', async () => {
    const fetchImpl = respond({ success: true })
    expect(await submitForm({ ...valid, botcheck: 'x' }, KEY, { fetchImpl })).toEqual({ ok: true })
    expect(fetchImpl).not.toHaveBeenCalled()
  })
})

describe('isPlaceholderKey', () => {
  it('is true for TODO(owner) text and empty, false for a real-looking key', () => {
    expect(isPlaceholderKey('TODO(owner): web3forms access key')).toBe(true)
    expect(isPlaceholderKey('')).toBe(true)
    expect(isPlaceholderKey(KEY)).toBe(false)
  })
})

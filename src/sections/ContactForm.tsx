import { useId, useRef, useState, type FormEvent } from 'react'
import { isPlaceholderKey, submitForm, validateForm, type FormErrors, type FormValues } from './contactSubmit'

type Status = 'idle' | 'sending' | 'success' | 'error'
type Props = { accessKey: string; email: string; fetchImpl?: typeof fetch }

const FIELDS = ['name', 'email', 'message'] as const

function summarize(errors: FormErrors): string {
  const names = FIELDS.filter((key) => errors[key])
  if (names.length === 0) return ''
  return `Please fix ${names.length} ${names.length === 1 ? 'field' : 'fields'}: ${names.join(', ')}.`
}

const EMPTY: FormValues = { name: '', email: '', message: '', botcheck: '' }

export default function ContactForm({ accessKey, email, fetchImpl }: Props) {
  const uid = useId()
  const [values, setValues] = useState<FormValues>(EMPTY)
  const [errors, setErrors] = useState<FormErrors>({})
  const [status, setStatus] = useState<Status>('idle')
  const [summary, setSummary] = useState('')
  const sending = useRef(false)

  if (isPlaceholderKey(accessKey)) {
    return (
      <div className="contact-fallback">
        <p>The query form is not switched on yet. Write to me directly.</p>
        <a className="button button-primary" href={`mailto:${email}`}>
          Email me
        </a>
      </div>
    )
  }

  const set = (field: keyof FormValues) => (e: { target: { value: string } }) => {
    const next = { ...values, [field]: e.target.value }
    setValues(next)
    if (status === 'success' || status === 'error') setStatus('idle')
    if (field !== 'botcheck' && errors[field]) {
      // Drop the error of a field as soon as it becomes valid, and refresh the summary.
      const still = validateForm(next)
      const remaining: FormErrors = {}
      for (const key of FIELDS) if (errors[key] && still[key]) remaining[key] = still[key]
      setErrors(remaining)
      setSummary(summarize(remaining))
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (sending.current) return
    const found = validateForm(values)
    setErrors(found)
    setSummary(summarize(found))
    const firstInvalid = FIELDS.find((key) => found[key])
    if (firstInvalid) {
      document.getElementById(`${uid}-${firstInvalid}`)?.focus()
      return
    }
    sending.current = true
    setStatus('sending')
    const result = await submitForm(values, accessKey, { fetchImpl })
    sending.current = false
    if (result.ok) {
      setValues(EMPTY)
      setStatus('success')
    } else {
      setStatus('error')
    }
  }

  const field = (key: 'name' | 'email' | 'message', label: string) => {
    const id = `${uid}-${key}`
    const err = errors[key]
    const common = {
      id,
      name: key,
      value: values[key],
      onChange: set(key),
      'aria-invalid': err ? true : undefined,
      'aria-describedby': err ? `${id}-error` : undefined,
      required: true,
    }
    return (
      <div className="field">
        <label htmlFor={id}>{label}</label>
        {key === 'message' ? (
          <textarea {...common} rows={5} maxLength={2000} />
        ) : (
          <input
            {...common}
            type={key === 'email' ? 'email' : 'text'}
            autoComplete={key === 'email' ? 'email' : 'name'}
          />
        )}
        {err && (
          <p className="field-error" id={`${id}-error`}>
            {err}
          </p>
        )}
      </div>
    )
  }

  return (
    <form className="contact-form" onSubmit={onSubmit} noValidate>
      {field('name', 'Name')}
      {field('email', 'Email')}
      {field('message', 'Message')}
      <input
        className="honeypot"
        type="text"
        name="botcheck"
        tabIndex={-1}
        aria-hidden="true"
        autoComplete="off"
        value={values.botcheck}
        onChange={set('botcheck')}
      />
      <button className="button button-primary" type="submit" disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending...' : 'Send message'}
      </button>
      <div className="form-status" role="status" aria-live="polite">
        {summary !== '' && <p>{summary}</p>}
        {status === 'success' && <p>Thank you, your message was sent. I will reply soon.</p>}
        {status === 'error' && (
          <p className="field-error">
            Sorry, the message could not be sent. Please try again or email me at{' '}
            <a href={`mailto:${email}`}>{email}</a>.
          </p>
        )}
      </div>
      <p className="privacy">Messages are sent to my inbox through Web3Forms.</p>
    </form>
  )
}

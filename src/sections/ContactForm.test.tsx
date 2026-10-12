import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import ContactForm from './ContactForm'

const KEY = '00000000-0000-0000-0000-000000000000'
const EMAIL = 'me@example.com'

function setup(fetchImpl: typeof fetch, accessKey = KEY) {
  return render(<ContactForm accessKey={accessKey} email={EMAIL} fetchImpl={fetchImpl} />)
}
function fill() {
  fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Ada' } })
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'ada@example.com' } })
  fireEvent.change(screen.getByLabelText('Message'), { target: { value: 'Hello there, a longer message.' } })
}
const ok = () => vi.fn(async () => new Response(JSON.stringify({ success: true }))) as unknown as typeof fetch

describe('ContactForm', () => {
  it('shows field errors and sends nothing on invalid input', () => {
    const f = ok()
    setup(f)
    fireEvent.click(screen.getByRole('button', { name: /send/i }))
    expect(screen.getByLabelText('Name')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByLabelText('Message')).toHaveAttribute('aria-invalid', 'true')
    const id = screen.getByLabelText('Name').getAttribute('aria-describedby')!
    expect(document.getElementById(id)!.textContent).toBeTruthy()
    expect(f).not.toHaveBeenCalled()
  })

  it('disables the button while sending so a double click sends once', async () => {
    let resolve!: (r: Response) => void
    const f = vi.fn(() => new Promise<Response>((r) => (resolve = r))) as unknown as typeof fetch
    setup(f)
    fill()
    const button = screen.getByRole('button', { name: /send/i })
    fireEvent.click(button)
    expect(button).toBeDisabled()
    fireEvent.click(button)
    expect(f).toHaveBeenCalledTimes(1)
    resolve(new Response(JSON.stringify({ success: true })))
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(/thank/i))
  })

  it('shows the thank-you and clears the fields on success', async () => {
    setup(ok())
    fill()
    fireEvent.click(screen.getByRole('button', { name: /send/i }))
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(/thank/i))
    expect(screen.getByLabelText('Name')).toHaveValue('')
    expect(screen.getByLabelText('Message')).toHaveValue('')
  })

  it('shows an error with an email link on failure', async () => {
    const f = vi.fn(async () => new Response('{}', { status: 500 })) as unknown as typeof fetch
    setup(f)
    fill()
    fireEvent.click(screen.getByRole('button', { name: /send/i }))
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(/could not|couldn't|try again/i))
    expect(screen.getByRole('link', { name: EMAIL })).toHaveAttribute('href', `mailto:${EMAIL}`)
    expect(screen.getByLabelText('Name')).toHaveValue('Ada')
  })

  it('renders only the email-link button when the key is a placeholder', () => {
    setup(ok(), 'TODO(owner): key')
    expect(screen.getByRole('link', { name: 'Email me' })).toHaveAttribute('href', `mailto:${EMAIL}`)
    expect(screen.queryByLabelText('Name')).toBeNull()
    expect(screen.queryByRole('button')).toBeNull()
    expect(screen.queryByText(/Web3Forms/)).toBeNull()
  })

  it('has a hidden honeypot', () => {
    const { container } = setup(ok())
    const hp = container.querySelector('input[name="botcheck"]')!
    expect(hp).toHaveAttribute('tabindex', '-1')
    expect(hp).toHaveAttribute('aria-hidden', 'true')
    expect(hp).toHaveAttribute('autocomplete', 'off')
  })

  it('keeps the status live region in the document while idle', () => {
    setup(ok())
    const status = screen.getByRole('status')
    expect(status).toBeInTheDocument()
    expect(status).toHaveTextContent('')
  })

  it('failed validation moves focus to the first invalid field', () => {
    setup(ok())
    fireEvent.click(screen.getByRole('button', { name: /send/i }))
    expect(screen.getByLabelText('Name')).toHaveFocus()
  })

  it('focus goes to the next invalid field when earlier ones are valid', () => {
    setup(ok())
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Ada' } })
    fireEvent.click(screen.getByRole('button', { name: /send/i }))
    expect(screen.getByLabelText('Email')).toHaveFocus()
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'ada@example.com' } })
    fireEvent.click(screen.getByRole('button', { name: /send/i }))
    expect(screen.getByLabelText('Message')).toHaveFocus()
  })

  it('failed validation puts a summary in the status region', () => {
    setup(ok())
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Ada' } })
    fireEvent.click(screen.getByRole('button', { name: /send/i }))
    expect(screen.getByRole('status')).toHaveTextContent('Please fix 2 fields: email, message.')
  })

  it('uses the singular for one invalid field', () => {
    setup(ok())
    fill()
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: '  ' } })
    fireEvent.click(screen.getByRole('button', { name: /send/i }))
    expect(screen.getByRole('status')).toHaveTextContent('Please fix 1 field: name.')
  })

  it('clears the summary and a field error once the field becomes valid', async () => {
    setup(ok())
    fireEvent.click(screen.getByRole('button', { name: /send/i }))
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Ada' } })
    expect(screen.getByLabelText('Name')).not.toHaveAttribute('aria-invalid')
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true')
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'ada@example.com' } })
    fireEvent.change(screen.getByLabelText('Message'), { target: { value: 'Hello there, a longer message.' } })
    fireEvent.click(screen.getByRole('button', { name: /send/i }))
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(/thank/i))
    expect(screen.getByRole('status')).not.toHaveTextContent(/please fix/i)
  })

  it('clears the result message when a field is edited afterwards', async () => {
    setup(ok())
    fill()
    fireEvent.click(screen.getByRole('button', { name: /send/i }))
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(/thank/i))
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'B' } })
    expect(screen.getByRole('status')).toHaveTextContent('')
  })

  it('sends trimmed values', async () => {
    const f = ok()
    setup(f)
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: '  Ada  ' } })
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: ' ada@example.com ' } })
    fireEvent.change(screen.getByLabelText('Message'), { target: { value: '  Hello there, a longer message.  ' } })
    fireEvent.click(screen.getByRole('button', { name: /send/i }))
    await waitFor(() => expect(f).toHaveBeenCalled())
    const body = JSON.parse((vi.mocked(f).mock.calls[0][1] as RequestInit).body as string)
    expect(body).toMatchObject({ name: 'Ada', email: 'ada@example.com', message: 'Hello there, a longer message.', from_name: 'Ada' })
  })
})

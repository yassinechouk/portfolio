import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import App from './App'

it('renders a main landmark', () => {
  render(<App />)
  expect(screen.getByRole('main')).toBeInTheDocument()
})

import { render, screen } from '@testing-library/react'
import { App } from './App'

describe('App shell', () => {
  it('presents the laboratory and primary invention action', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: /paper airplane lab/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /invent an airplane/i })).toBeInTheDocument()
  })
})

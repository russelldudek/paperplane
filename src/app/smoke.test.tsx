import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { App } from './App'

describe('Paper Airplane Lab navigation', () => {
  it('wires every laboratory section and opens the physics learning layer', async () => {
    const user = userEvent.setup()
    render(<App />)

    for (const label of ['Invent', 'Workbench', 'Build', 'Flight Lab', 'Hangar', 'Learn']) {
      expect(screen.getByRole('button', { name: new RegExp(label, 'i') })).toBeInTheDocument()
    }

    await user.click(screen.getByRole('button', { name: /learn/i }))
    expect(screen.getByRole('heading', { name: /why paper airplanes fly/i })).toBeInTheDocument()
    expect(screen.getByText(/reduced-order model/i)).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: /explanation level/i })).toBeInTheDocument()
  })
})

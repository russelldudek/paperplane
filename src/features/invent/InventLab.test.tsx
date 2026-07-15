import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { InventLab } from './InventLab'

describe('Invent Lab', () => {
  it('generates three ranked aircraft for a selected mission', async () => {
    const user = userEvent.setup()
    render(<InventLab onSelectCandidate={() => undefined} />)

    await user.click(screen.getByRole('button', { name: /maximum airtime/i }))
    await user.click(screen.getByRole('button', { name: /generate aircraft/i }))

    expect(await screen.findAllByTestId('candidate-card')).toHaveLength(3)
    expect(screen.getByText(/best match/i)).toBeInTheDocument()
  })
})

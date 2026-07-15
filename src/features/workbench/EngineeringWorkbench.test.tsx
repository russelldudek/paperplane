import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createFamilyGenome } from '../../domain/aircraft/families'
import { EngineeringWorkbench } from './EngineeringWorkbench'

describe('Engineering Workbench', () => {
  it('emits a revised genome when dihedral is changed', async () => {
    const user = userEvent.setup()
    const onGenomeChange = vi.fn()
    render(<EngineeringWorkbench initialGenome={createFamilyGenome('dart-glider')} onGenomeChange={onGenomeChange} />)

    const input = screen.getByLabelText(/dihedral angle/i)
    await user.clear(input)
    await user.type(input, '12')

    expect(onGenomeChange).toHaveBeenCalled()
    expect(onGenomeChange.mock.calls.at(-1)?.[0].geometry.dihedralDeg).toBe(12)
  })
})

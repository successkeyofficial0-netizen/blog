import { MemoryRouter } from 'react-router-dom'
import { render } from '@testing-library/react'

/** Renders a component inside a MemoryRouter at the given route. */
export function renderWithRouter(ui, { route = '/' } = {}) {
  return render(<MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>)
}

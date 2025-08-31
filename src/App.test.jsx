import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import App from './App'

// Mock the config utility to avoid window.location issues in tests
vi.mock('./config/config-util', () => ({
  resolveConfig: vi.fn(() => ({ env: 'test' }))
}))

describe('App', () => {
  beforeEach(() => {
    // Reset any mocks before each test
    vi.clearAllMocks()
  })

  it('renders Vite + React heading', () => {
    render(<App />)
    
    // Check if the main heading is present
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toBeInTheDocument()
    expect(heading).toHaveTextContent(/Vite \+ React/)
  })

  it('renders both logo images', () => {
    render(<App />)
    
    // Check if both logos are present
    const viteLogo = screen.getByAltText('Vite logo')
    const reactLogo = screen.getByAltText('React logo')
    
    expect(viteLogo).toBeInTheDocument()
    expect(reactLogo).toBeInTheDocument()
  })

  it('renders counter button with initial count', () => {
    render(<App />)
    
    // Check if the counter button is present with initial count
    const counterButton = screen.getByRole('button', { name: /count is 0/i })
    expect(counterButton).toBeInTheDocument()
  })

  it('increments counter when button is clicked', () => {
    render(<App />)
    
    // Find the counter button and click it
    const counterButton = screen.getByRole('button', { name: /count is 0/i })
    fireEvent.click(counterButton)
    
    // Check if the counter was incremented
    expect(screen.getByRole('button', { name: /count is 1/i })).toBeInTheDocument()
  })

  it('renders HMR instruction text', () => {
    render(<App />)
    
    // Check if the HMR instruction text is present (text is split across elements)
    const codeElement = screen.getByText('src/App.jsx')
    const hmrText = screen.getByText(/and save to test HMR/i)
    
    expect(codeElement).toBeInTheDocument()
    expect(hmrText).toBeInTheDocument()
  })

  it('renders "Click on the Vite and React logos" text', () => {
    render(<App />)
    
    // Check if the instruction text is present
    const instructionText = screen.getByText(/Click on the Vite and React logos to learn more/i)
    expect(instructionText).toBeInTheDocument()
  })

  it('renders logo links with correct hrefs', () => {
    render(<App />)
    
    // Check if the logo links have correct hrefs
    const viteLink = screen.getByRole('link', { name: /vite logo/i })
    const reactLink = screen.getByRole('link', { name: /react logo/i })
    
    expect(viteLink).toHaveAttribute('href', 'https://vite.dev')
    expect(reactLink).toHaveAttribute('href', 'https://react.dev')
  })

  it('displays the environment from config', () => {
    render(<App />)
    
    // Check if the environment is displayed in the heading
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveTextContent('[test]')
  })
})

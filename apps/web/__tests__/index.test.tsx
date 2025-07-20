import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import Home from '../pages/index'

// Mock the API client
jest.mock('../utils/api', () => ({
  apiClient: {
    sendMessage: jest.fn(),
    generateTranscript: jest.fn(),
  },
}))

const mockApiClient = require('../utils/api').apiClient

describe('Home Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the main components', () => {
    render(<Home />)
    
    expect(screen.getByText('GuruTech')).toBeInTheDocument()
    expect(screen.getByText('AI Technical Support Assistant')).toBeInTheDocument()
    expect(screen.getByTestId('message-input')).toBeInTheDocument()
    expect(screen.getByTestId('submit-button')).toBeInTheDocument()
    expect(screen.getByTestId('message-display')).toBeInTheDocument()
    expect(screen.getByText('Welcome to GuruTech Support')).toBeInTheDocument()
  })

  it('handles input change', () => {
    render(<Home />)
    
    const input = screen.getByTestId('message-input') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'Hello World' } })
    
    expect(input.value).toBe('Hello World')
  })

  it('handles form submission and displays user and assistant messages', async () => {
    mockApiClient.sendMessage.mockResolvedValue({
      message: 'AI response generated successfully',
      timestamp: '2025-07-20T06:29:12.328Z',
      status: 'success',
      response: 'This is an AI response to: Test message'
    })

    render(<Home />)
    
    const input = screen.getByTestId('message-input')
    const submitButton = screen.getByTestId('submit-button')
    
    fireEvent.change(input, { target: { value: 'Test message' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByTestId('message-user')).toBeInTheDocument()
      expect(screen.getByTestId('message-assistant')).toBeInTheDocument()
    })
    
    expect(screen.getByText('Test message')).toBeInTheDocument()
    expect(screen.getByText('This is an AI response to: Test message')).toBeInTheDocument()
    expect((input as HTMLInputElement).value).toBe('')
  })

  it('shows loading state during API call', async () => {
    mockApiClient.sendMessage.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

    render(<Home />)
    
    const input = screen.getByTestId('message-input')
    const submitButton = screen.getByTestId('submit-button')
    
    fireEvent.change(input, { target: { value: 'Test message' } })
    fireEvent.click(submitButton)
    
    expect(screen.getByText('Send')).toBeInTheDocument() // Button shows loading spinner instead of text
    expect(submitButton).toBeDisabled()
    expect(input).toBeDisabled()
  })

  it('handles API errors gracefully', async () => {
    mockApiClient.sendMessage.mockRejectedValue(new Error('Network error'))

    render(<Home />)
    
    const input = screen.getByTestId('message-input')
    const submitButton = screen.getByTestId('submit-button')
    
    fireEvent.change(input, { target: { value: 'Test message' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeInTheDocument()
    })
    
    expect(screen.getByText('Connection Error')).toBeInTheDocument()
  })

  it('prevents empty message submission', () => {
    render(<Home />)
    
    const input = screen.getByTestId('message-input')
    const submitButton = screen.getByTestId('submit-button')
    
    fireEvent.change(input, { target: { value: '   ' } })
    fireEvent.click(submitButton)
    
    expect(screen.getByText('Welcome to GuruTech Support')).toBeInTheDocument()
    expect(mockApiClient.sendMessage).not.toHaveBeenCalled()
  })

  it('prevents submission while loading', async () => {
    mockApiClient.sendMessage.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

    render(<Home />)
    
    const input = screen.getByTestId('message-input')
    const submitButton = screen.getByTestId('submit-button')
    
    fireEvent.change(input, { target: { value: 'First message' } })
    fireEvent.click(submitButton)
    
    fireEvent.change(input, { target: { value: 'Second message' } })
    fireEvent.click(submitButton)
    
    expect(mockApiClient.sendMessage).toHaveBeenCalledTimes(1)
  })

  it('shows end session button only when messages exist', async () => {
    mockApiClient.sendMessage.mockResolvedValue({
      message: 'AI response generated successfully',
      timestamp: '2025-07-20T06:29:12.328Z',
      status: 'success',
      response: 'This is an AI response'
    })

    render(<Home />)
    
    // Should not show button initially
    expect(screen.queryByTestId('end-session-button')).not.toBeInTheDocument()
    
    // Send a message
    const input = screen.getByTestId('message-input')
    const submitButton = screen.getByTestId('submit-button')
    
    fireEvent.change(input, { target: { value: 'Test message' } })
    fireEvent.click(submitButton)
    
    // Should show button after messages exist
    await waitFor(() => {
      expect(screen.getByTestId('end-session-button')).toBeInTheDocument()
    })
  })

  it('opens escalation modal when end session button is clicked', async () => {
    mockApiClient.sendMessage.mockResolvedValue({
      message: 'AI response generated successfully',
      timestamp: '2025-07-20T06:29:12.328Z',
      status: 'success',
      response: 'This is an AI response'
    })

    render(<Home />)
    
    // Send a message first
    const input = screen.getByTestId('message-input')
    const submitButton = screen.getByTestId('submit-button')
    
    fireEvent.change(input, { target: { value: 'Test message' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByTestId('end-session-button')).toBeInTheDocument()
    })
    
    // Click end session button
    await act(async () => {
      fireEvent.click(screen.getByTestId('end-session-button'))
    })
    
    // Modal should appear
    expect(screen.getByText('End Support Session')).toBeInTheDocument()
    expect(screen.getByText('What does escalation mean?')).toBeInTheDocument()
    expect(screen.getByTestId('escalation-yes-button')).toBeInTheDocument()
    expect(screen.getByTestId('escalation-no-button')).toBeInTheDocument()
  })

  it('handles escalation modal responses correctly', async () => {
    mockApiClient.sendMessage.mockResolvedValue({
      message: 'AI response generated successfully',
      timestamp: '2025-07-20T06:29:12.328Z',
      status: 'success',
      response: 'This is an AI response'
    })

    mockApiClient.generateTranscript.mockResolvedValue({
      transcript: 'Test transcript content',
      wordCount: 100,
      generatedAt: '2025-07-20T06:29:12.328Z'
    })

    render(<Home />)
    
    // Send a message and open modal
    const input = screen.getByTestId('message-input')
    const submitButton = screen.getByTestId('submit-button')
    
    fireEvent.change(input, { target: { value: 'Test message' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByTestId('end-session-button')).toBeInTheDocument()
    })
    
    await act(async () => {
      fireEvent.click(screen.getByTestId('end-session-button'))
    })
    
    // Test "Yes" response - now triggers transcript generation
    await act(async () => {
      fireEvent.click(screen.getByTestId('escalation-yes-button'))
    })
    
    // Should call generateTranscript instead of console.log
    await waitFor(() => {
      expect(mockApiClient.generateTranscript).toHaveBeenCalledTimes(1)
    })
    
    // Wait for escalation modal to close
    await waitFor(() => {
      expect(screen.queryByText('End Support Session')).not.toBeInTheDocument()
    })
    
    // Should open transcript modal
    expect(screen.getByText('Session Transcript')).toBeInTheDocument()
  })

  it('closes escalation modal on "No" response', async () => {
    mockApiClient.sendMessage.mockResolvedValue({
      message: 'AI response generated successfully',
      timestamp: '2025-07-20T06:29:12.328Z',
      status: 'success',
      response: 'This is an AI response'
    })

    const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

    render(<Home />)
    
    // Send a message and open modal
    const input = screen.getByTestId('message-input')
    const submitButton = screen.getByTestId('submit-button')
    
    fireEvent.change(input, { target: { value: 'Test message' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByTestId('end-session-button')).toBeInTheDocument()
    })
    
    await act(async () => {
      fireEvent.click(screen.getByTestId('end-session-button'))
    })
    
    // Test "No" response
    await act(async () => {
      fireEvent.click(screen.getByTestId('escalation-no-button'))
    })
    
    expect(consoleSpy).toHaveBeenCalledWith('Session ended without escalation')
    
    // Wait for modal to close
    await waitFor(() => {
      expect(screen.queryByText('End Support Session')).not.toBeInTheDocument()
    })
    
    consoleSpy.mockRestore()
  })

  it('generates transcript when escalation is confirmed', async () => {
    mockApiClient.sendMessage.mockResolvedValue({
      message: 'AI response generated successfully',
      timestamp: '2025-07-20T06:29:12.328Z',
      status: 'success',
      response: 'This is an AI response'
    })

    mockApiClient.generateTranscript.mockResolvedValue({
      transcript: 'Test transcript content',
      wordCount: 100,
      generatedAt: '2025-07-20T06:29:12.328Z'
    })

    render(<Home />)
    
    // Send a message and open modal
    const input = screen.getByTestId('message-input')
    const submitButton = screen.getByTestId('submit-button')
    
    fireEvent.change(input, { target: { value: 'Test message' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByTestId('end-session-button')).toBeInTheDocument()
    })
    
    await act(async () => {
      fireEvent.click(screen.getByTestId('end-session-button'))
    })
    
    // Click "Yes" to escalate
    await act(async () => {
      fireEvent.click(screen.getByTestId('escalation-yes-button'))
    })
    
    // Wait for transcript modal to appear
    await waitFor(() => {
      expect(screen.getByText('Session Transcript')).toBeInTheDocument()
    })
    
    // Check if transcript content is displayed
    expect(screen.getByTestId('transcript-content')).toBeInTheDocument()
    expect(screen.getByText('Test transcript content')).toBeInTheDocument()
    expect(screen.getByTestId('copy-transcript-button')).toBeInTheDocument()
  })

  it('shows loading state during transcript generation', async () => {
    mockApiClient.sendMessage.mockResolvedValue({
      message: 'AI response generated successfully',
      timestamp: '2025-07-20T06:29:12.328Z',
      status: 'success',
      response: 'This is an AI response'
    })

    // Make generateTranscript take time to resolve
    mockApiClient.generateTranscript.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({
        transcript: 'Test transcript content',
        wordCount: 100,
        generatedAt: '2025-07-20T06:29:12.328Z'
      }), 100))
    )

    render(<Home />)
    
    // Send a message and trigger escalation
    const input = screen.getByTestId('message-input')
    const submitButton = screen.getByTestId('submit-button')
    
    fireEvent.change(input, { target: { value: 'Test message' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByTestId('end-session-button')).toBeInTheDocument()
    })
    
    await act(async () => {
      fireEvent.click(screen.getByTestId('end-session-button'))
    })
    
    await act(async () => {
      fireEvent.click(screen.getByTestId('escalation-yes-button'))
    })
    
    // Check loading state
    await waitFor(() => {
      expect(screen.getByText('Generating transcript...')).toBeInTheDocument()
    })
  })

  it('handles transcript generation errors', async () => {
    mockApiClient.sendMessage.mockResolvedValue({
      message: 'AI response generated successfully',
      timestamp: '2025-07-20T06:29:12.328Z',
      status: 'success',
      response: 'This is an AI response'
    })

    mockApiClient.generateTranscript.mockRejectedValue(new Error('Transcript generation failed'))

    render(<Home />)
    
    // Send a message and trigger escalation
    const input = screen.getByTestId('message-input')
    const submitButton = screen.getByTestId('submit-button')
    
    fireEvent.change(input, { target: { value: 'Test message' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByTestId('end-session-button')).toBeInTheDocument()
    })
    
    await act(async () => {
      fireEvent.click(screen.getByTestId('end-session-button'))
    })
    
    await act(async () => {
      fireEvent.click(screen.getByTestId('escalation-yes-button'))
    })
    
    // Check error state
    await waitFor(() => {
      expect(screen.getByText('Failed to Generate Transcript')).toBeInTheDocument()
      expect(screen.getByText('Transcript generation failed')).toBeInTheDocument()
    })
  })

  it('closes transcript modal properly', async () => {
    mockApiClient.sendMessage.mockResolvedValue({
      message: 'AI response generated successfully',
      timestamp: '2025-07-20T06:29:12.328Z',
      status: 'success',
      response: 'This is an AI response'
    })

    mockApiClient.generateTranscript.mockResolvedValue({
      transcript: 'Test transcript content',
      wordCount: 100,
      generatedAt: '2025-07-20T06:29:12.328Z'
    })

    render(<Home />)
    
    // Generate transcript
    const input = screen.getByTestId('message-input')
    fireEvent.change(input, { target: { value: 'Test message' } })
    fireEvent.click(screen.getByTestId('submit-button'))
    
    await waitFor(() => {
      expect(screen.getByTestId('end-session-button')).toBeInTheDocument()
    })
    
    await act(async () => {
      fireEvent.click(screen.getByTestId('end-session-button'))
    })
    
    await act(async () => {
      fireEvent.click(screen.getByTestId('escalation-yes-button'))
    })
    
    await waitFor(() => {
      expect(screen.getByText('Session Transcript')).toBeInTheDocument()
    })
    
    // Close the modal
    await act(async () => {
      fireEvent.click(screen.getByTestId('close-transcript-button'))
    })
    
    await waitFor(() => {
      expect(screen.queryByText('Session Transcript')).not.toBeInTheDocument()
    })
  })
})
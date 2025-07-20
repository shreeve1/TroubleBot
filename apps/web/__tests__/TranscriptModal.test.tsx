import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { TranscriptModal } from '../components/ui/TranscriptModal'

// Mock clipboard API
const mockWriteText = jest.fn()
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: mockWriteText,
  },
  writable: true,
})

// Mock window.isSecureContext
Object.defineProperty(window, 'isSecureContext', {
  value: true,
  writable: true,
})

describe('TranscriptModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    transcript: 'Test transcript content',
    wordCount: 100,
    generatedAt: '2025-07-20T06:29:12.328Z',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders transcript content correctly', () => {
    render(<TranscriptModal {...defaultProps} />)
    
    expect(screen.getByText('Session Transcript')).toBeInTheDocument()
    expect(screen.getByTestId('transcript-content')).toBeInTheDocument()
    expect(screen.getByText('Test transcript content')).toBeInTheDocument()
    expect(screen.getByTestId('copy-transcript-button')).toBeInTheDocument()
  })

  it('displays metadata correctly', () => {
    render(<TranscriptModal {...defaultProps} />)
    
    expect(screen.getByText(/Generated:/)).toBeInTheDocument()
    expect(screen.getByText(/Words: 100/)).toBeInTheDocument()
  })

  it('shows loading state when isLoading is true', () => {
    render(<TranscriptModal {...defaultProps} isLoading={true} />)
    
    expect(screen.getByText('Generating transcript...')).toBeInTheDocument()
    expect(screen.getByText('This may take a few moments')).toBeInTheDocument()
    expect(screen.queryByTestId('transcript-content')).not.toBeInTheDocument()
  })

  it('shows error state when error is provided', () => {
    const onRetry = jest.fn()
    render(
      <TranscriptModal 
        {...defaultProps} 
        error="Generation failed" 
        onRetry={onRetry}
      />
    )
    
    expect(screen.getByText('Failed to Generate Transcript')).toBeInTheDocument()
    expect(screen.getByText('Generation failed')).toBeInTheDocument()
    expect(screen.getByText('Try Again')).toBeInTheDocument()
    
    fireEvent.click(screen.getByText('Try Again'))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('copies transcript to clipboard successfully', async () => {
    mockWriteText.mockResolvedValue(undefined)
    
    render(<TranscriptModal {...defaultProps} />)
    
    const copyButton = screen.getByTestId('copy-transcript-button')
    fireEvent.click(copyButton)
    
    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledWith('Test transcript content')
    })
    
    expect(screen.getByText('Copied!')).toBeInTheDocument()
  })

  it('handles clipboard copy failure with fallback', async () => {
    // Remove clipboard API to trigger fallback
    Object.defineProperty(navigator, 'clipboard', {
      value: undefined,
      writable: true,
    })
    
    // Mock document.execCommand
    document.execCommand = jest.fn().mockReturnValue(true)
    
    render(<TranscriptModal {...defaultProps} />)
    
    const copyButton = screen.getByTestId('copy-transcript-button')
    fireEvent.click(copyButton)
    
    await waitFor(() => {
      expect(document.execCommand).toHaveBeenCalledWith('copy')
    })
    
    expect(screen.getByText('Copied!')).toBeInTheDocument()
    
    // Restore clipboard for other tests
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: mockWriteText,
      },
      writable: true,
    })
  })

  it('handles clipboard copy complete failure', async () => {
    // Remove clipboard API to trigger fallback, then make fallback fail
    Object.defineProperty(navigator, 'clipboard', {
      value: undefined,
      writable: true,
    })
    
    // Mock document.execCommand to fail
    document.execCommand = jest.fn().mockImplementation(() => {
      throw new Error('execCommand failed')
    })
    
    render(<TranscriptModal {...defaultProps} />)
    
    const copyButton = screen.getByTestId('copy-transcript-button')
    fireEvent.click(copyButton)
    
    await waitFor(() => {
      expect(screen.getByText('Copy Failed')).toBeInTheDocument()
    })
    
    // Restore clipboard for other tests
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: mockWriteText,
      },
      writable: true,
    })
  })

  it('closes modal when close button is clicked', () => {
    const onClose = jest.fn()
    render(<TranscriptModal {...defaultProps} onClose={onClose} />)
    
    fireEvent.click(screen.getByTestId('close-transcript-button'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('has proper accessibility attributes', () => {
    render(<TranscriptModal {...defaultProps} />)
    
    const transcriptContent = screen.getByTestId('transcript-content')
    expect(transcriptContent).toHaveAttribute('role', 'textbox')
    expect(transcriptContent).toHaveAttribute('aria-label', 'Generated support transcript')
    expect(transcriptContent).toHaveAttribute('aria-readonly', 'true')
    expect(transcriptContent).toHaveAttribute('tabIndex', '0')
    
    const copyButton = screen.getByTestId('copy-transcript-button')
    expect(copyButton).toHaveAttribute('aria-label', 'Copy transcript to clipboard')
  })

  it('updates copy button aria-label when copied', async () => {
    mockWriteText.mockResolvedValue(undefined)
    
    render(<TranscriptModal {...defaultProps} />)
    
    const copyButton = screen.getByTestId('copy-transcript-button')
    fireEvent.click(copyButton)
    
    await waitFor(() => {
      expect(copyButton).toHaveAttribute('aria-label', 'Transcript copied to clipboard')
    })
  })

  it('prevents copy when already copying', async () => {
    mockWriteText.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
    
    render(<TranscriptModal {...defaultProps} />)
    
    const copyButton = screen.getByTestId('copy-transcript-button')
    
    // Click multiple times quickly
    fireEvent.click(copyButton)
    fireEvent.click(copyButton)
    fireEvent.click(copyButton)
    
    // Should only be called once
    expect(mockWriteText).toHaveBeenCalledTimes(1)
  })

  it('auto-dismisses copy status after delay', async () => {
    mockWriteText.mockResolvedValue(undefined)
    
    render(<TranscriptModal {...defaultProps} />)
    
    const copyButton = screen.getByTestId('copy-transcript-button')
    fireEvent.click(copyButton)
    
    await waitFor(() => {
      expect(screen.getByText('Copied!')).toBeInTheDocument()
    })
    
    // Wait for auto-dismiss (using fake timers would be better)
    await waitFor(() => {
      expect(screen.getByText('Copy to Clipboard')).toBeInTheDocument()
    }, { timeout: 4000 })
  })
})
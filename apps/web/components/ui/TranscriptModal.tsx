import React, { useState } from 'react'
import { Modal, ModalProps } from './Modal'
import { Button } from './Button'
import { CheckIcon, ClipboardIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

export interface TranscriptModalProps extends Omit<ModalProps, 'children'> {
  transcript: string
  wordCount: number
  generatedAt: string
  isLoading?: boolean
  error?: string | null
  onRetry?: () => void
}

export const TranscriptModal: React.FC<TranscriptModalProps> = ({
  transcript,
  wordCount,
  generatedAt,
  isLoading = false,
  error,
  onRetry,
  ...modalProps
}) => {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copying' | 'success' | 'error'>('idle')

  const handleCopyToClipboard = async () => {
    if (!transcript || copyStatus === 'copying') return

    setCopyStatus('copying')

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(transcript)
      } else {
        const textArea = document.createElement('textarea')
        textArea.value = transcript
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
      }
      
      setCopyStatus('success')
      setTimeout(() => setCopyStatus('idle'), 3000)
    } catch {
      setCopyStatus('error')
      setTimeout(() => setCopyStatus('idle'), 3000)
    }
  }

  const getCopyButtonText = () => {
    switch (copyStatus) {
      case 'copying':
        return 'Copying...'
      case 'success':
        return 'Copied!'
      case 'error':
        return 'Copy Failed'
      default:
        return 'Copy to Clipboard'
    }
  }

  const getCopyButtonIcon = () => {
    if (copyStatus === 'success') {
      return <CheckIcon className="w-4 h-4" />
    }
    return <ClipboardIcon className="w-4 h-4" />
  }

  return (
    <Modal
      {...modalProps}
      size="lg"
      title="Session Transcript"
      description="Your conversation has been processed for escalation to technical support."
    >
      <div className="space-y-6">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
              </div>
              <p className="text-sm text-secondary-600">Generating transcript...</p>
              <p className="text-xs text-secondary-500 mt-1">This may take a few moments</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-error-50 border border-error-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <ExclamationTriangleIcon className="w-5 h-5 text-error-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-error-800 mb-1">
                  Failed to Generate Transcript
                </h4>
                <p className="text-xs text-error-700 mb-3">{error}</p>
                {onRetry && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onRetry}
                    className="text-error-700 border-error-300 hover:bg-error-50"
                  >
                    Try Again
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {!isLoading && !error && transcript && (
          <>
            {/* Transcript Metadata */}
            <div className="bg-secondary-50 border border-secondary-200 rounded-lg p-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                  <span className="text-secondary-600">
                    Generated: {new Date(generatedAt).toLocaleString()}
                  </span>
                  <span className="text-secondary-600">
                    Words: {wordCount.toLocaleString()}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyToClipboard}
                  disabled={copyStatus === 'copying'}
                  className={`
                    min-w-[140px] transition-all duration-200
                    ${copyStatus === 'success' ? 'border-success-300 text-success-700 bg-success-50' : ''}
                    ${copyStatus === 'error' ? 'border-error-300 text-error-700 bg-error-50' : ''}
                  `}
                  data-testid="copy-transcript-button"
                  aria-label={copyStatus === 'success' ? 'Transcript copied to clipboard' : 'Copy transcript to clipboard'}
                >
                  <span className="flex items-center space-x-2">
                    {getCopyButtonIcon()}
                    <span>{getCopyButtonText()}</span>
                  </span>
                </Button>
              </div>
            </div>

            {/* Transcript Content */}
            <div className="bg-white border border-secondary-200 rounded-lg">
              <div className="p-4 border-b border-secondary-200">
                <h4 className="text-sm font-medium text-secondary-900">
                  Technical Support Transcript
                </h4>
                <p className="text-xs text-secondary-600 mt-1">
                  Ready to copy and paste into your ticketing system
                </p>
              </div>
              <div
                className="p-6 max-h-96 overflow-y-auto"
                role="textbox"
                aria-label="Generated support transcript"
                aria-readonly="true"
                tabIndex={0}
              >
                <pre className="whitespace-pre-wrap text-sm text-secondary-800 font-mono leading-relaxed">
                  {transcript}
                </pre>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <div className="text-xs text-secondary-500">
                This transcript contains your conversation summary and technical details.
              </div>
              <div className="flex space-x-3">
                <Button
                  variant="secondary"
                  onClick={modalProps.onClose}
                  data-testid="close-transcript-button"
                >
                  Close
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}
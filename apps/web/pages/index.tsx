import { useState, useEffect, useRef } from 'react'
import type { NextPage } from 'next'
import { apiClient, type TranscriptResponse } from '../utils/api'
import { Layout, Header, Main, Container, Button, Input, Message, Modal } from '../components/ui'
import { TranscriptModal } from '../components/ui/TranscriptModal'
import { StructuredMessage } from '../components/ui/StructuredMessage'
import { StructuredResponse } from '../types/structured-response'
import { 
  ChatBubbleLeftRightIcon, 
  SparklesIcon, 
  PaperAirplaneIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PowerIcon,
  XMarkIcon,
  PhotoIcon
} from '@heroicons/react/24/outline'

interface ChatMessage {
  id: string
  text: string
  timestamp: Date
  type: 'user' | 'assistant'
  structuredResponse?: StructuredResponse
  image?: string // base64 encoded image data
  imageType?: string // mime type of the image
}

const Home: NextPage = () => {
  const [inputValue, setInputValue] = useState<string>('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline'>('online')
  const [showEscalationModal, setShowEscalationModal] = useState<boolean>(false)
  const [showTranscriptModal, setShowTranscriptModal] = useState<boolean>(false)
  const [transcriptData, setTranscriptData] = useState<TranscriptResponse | null>(null)
  const [transcriptLoading, setTranscriptLoading] = useState<boolean>(false)
  const [transcriptError, setTranscriptError] = useState<string | null>(null)
  const [showRawResponses, setShowRawResponses] = useState<Set<string>>(new Set())
  const [pastedImage, setPastedImage] = useState<{data: string, type: string} | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  // Focus input after message is sent
  useEffect(() => {
    if (!isLoading && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isLoading])

  // Handle clipboard paste events for images
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return

      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          e.preventDefault()
          const file = item.getAsFile()
          if (file) {
            const reader = new FileReader()
            reader.onload = (event) => {
              const result = event.target?.result as string
              setPastedImage({
                data: result,
                type: file.type
              })
            }
            reader.readAsDataURL(file)
          }
          break
        }
      }
    }

    document.addEventListener('paste', handlePaste)
    return () => document.removeEventListener('paste', handlePaste)
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if ((inputValue.trim() === '' && !pastedImage) || isLoading) {
      return
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputValue.trim() || (pastedImage ? 'Image attached' : ''),
      timestamp: new Date(),
      type: 'user',
      image: pastedImage?.data,
      imageType: pastedImage?.type
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)
    setError(null)

    try {
      setConnectionStatus('online')
      const response = await apiClient.sendMessage(inputValue.trim(), pastedImage)
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: response.response,
        timestamp: new Date(response.timestamp),
        type: 'assistant',
        structuredResponse: (response as any).structuredResponse
      }

      setMessages(prev => [...prev, assistantMessage])
      setInputValue('')
      setPastedImage(null)
    } catch (err) {
      setConnectionStatus('offline')
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message'
      setError(errorMessage)
      
      // Remove the user message if the API call failed
      setMessages(prev => prev.slice(0, -1))
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const clearPastedImage = () => {
    setPastedImage(null)
  }

  const handleEndSession = () => {
    setShowEscalationModal(true)
  }

  const handleEscalationResponse = async (needsEscalation: boolean) => {
    setShowEscalationModal(false)
    
    if (needsEscalation) {
      await generateTranscript()
    } else {
      console.log('Session ended without escalation')
    }
  }

  const generateTranscript = async () => {
    setTranscriptLoading(true)
    setTranscriptError(null)
    setShowTranscriptModal(true)

    try {
      const chatHistory = {
        messages: messages.map(msg => ({
          id: msg.id,
          role: msg.type === 'user' ? 'user' as const : 'assistant' as const,
          content: msg.text,
          timestamp: msg.timestamp.toISOString()
        })),
        sessionId: `session-${Date.now()}`,
        escalationReason: 'User requested escalation via End Session button'
      }

      const response = await apiClient.generateTranscript(chatHistory)
      setTranscriptData(response)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate transcript'
      setTranscriptError(errorMessage)
    } finally {
      setTranscriptLoading(false)
    }
  }

  const handleTranscriptRetry = async () => {
    await generateTranscript()
  }

  const handleTranscriptClose = () => {
    setShowTranscriptModal(false)
    setTranscriptData(null)
    setTranscriptError(null)
  }

  const toggleRawResponse = (messageId: string) => {
    const newShowRaw = new Set(showRawResponses)
    if (newShowRaw.has(messageId)) {
      newShowRaw.delete(messageId)
    } else {
      newShowRaw.add(messageId)
    }
    setShowRawResponses(newShowRaw)
  }

  return (
    <Layout>
      <Header sticky>
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 bg-primary-600 rounded-xl shadow-lg">
            <SparklesIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-secondary-900">TroubleBot AI</h1>
            <p className="text-sm text-secondary-600">AI Technical Support Assistant</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {/* Connection Status */}
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              connectionStatus === 'online' ? 'bg-success-500' : 'bg-error-500'
            }`} />
            <span className="text-xs text-secondary-600">
              {connectionStatus === 'online' ? 'Online' : 'Offline'}
            </span>
          </div>
          
          {/* Message Count */}
          {messages.length > 0 && (
            <div className="flex items-center space-x-2 text-sm text-secondary-600">
              <ChatBubbleLeftRightIcon className="w-4 h-4" />
              <span>{messages.length} {messages.length === 1 ? 'message' : 'messages'}</span>
            </div>
          )}
          
          {/* End Session Button */}
          {messages.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleEndSession}
              className="flex items-center space-x-2"
              data-testid="end-session-button"
            >
              <PowerIcon className="w-4 h-4" />
              <span>Escalate</span>
            </Button>
          )}
        </div>
      </Header>

      <Main className="flex flex-col h-[calc(100vh-4rem)]">
        <div className="flex-1 overflow-hidden">
          <div className="h-full flex flex-col">
            {/* Messages Area */}
            <div
              className="flex-1 overflow-y-auto px-4 py-6 space-y-4"
            >
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl mb-6 shadow-lg">
                    <SparklesIcon className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-secondary-900 mb-3">
                    Welcome to TroubleBot AI Support
                  </h3>
                  <p className="text-secondary-600 max-w-lg mb-8 leading-relaxed">
                    I'm your AI technical support assistant. Describe your technical issue and I'll help you troubleshoot it step by step with personalized solutions.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div
                      key={message.id}
                      className={`animate-fade-in ${
                        index === messages.length - 1 ? 'animate-slide-in' : ''
                      }`}
                    >
                      {message.type === 'assistant' && message.structuredResponse ? (
                        <div className="space-y-2">
                          <StructuredMessage
                            variant={message.type}
                            timestamp={message.timestamp}
                            showTimestamp
                            author="TroubleBot AI"
                            structuredResponse={message.structuredResponse}
                            rawText={message.text}
                            showRawResponse={showRawResponses.has(message.id)}
                            onToggleRaw={() => toggleRawResponse(message.id)}
                          />
                          {showRawResponses.has(message.id) && (
                            <Message
                              variant="system"
                              className="text-xs bg-secondary-100 border border-secondary-300"
                            >
                              <details className="cursor-pointer">
                                <summary className="font-medium mb-2">Raw AI Response</summary>
                                <pre className="whitespace-pre-wrap text-xs text-secondary-600 font-mono">
                                  {message.text}
                                </pre>
                              </details>
                            </Message>
                          )}
                        </div>
                      ) : (
                        <Message
                          variant={message.type}
                          timestamp={message.timestamp}
                          showTimestamp
                          author={message.type === 'user' ? 'You' : 'TroubleBot AI'}
                        >
                          {message.image && (
                            <div className="mb-3">
                              <img 
                                src={message.image} 
                                alt="Screenshot" 
                                className="max-w-full max-h-64 rounded-lg border border-secondary-300 shadow-sm"
                              />
                            </div>
                          )}
                          {message.text}
                        </Message>
                      )}
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="animate-fade-in">
                      <Message variant="assistant">
                        <div className="flex items-center space-x-3">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                            <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                          </div>
                          <span>Analyzing your issue...</span>
                        </div>
                      </Message>
                    </div>
                  )}
                  
                  {/* Scroll reference */}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div 
                className="mx-4 mb-4 p-4 bg-error-50 border border-error-200 rounded-xl animate-fade-in"
                data-testid="error-message"
              >
                <div className="flex items-start space-x-3">
                  <ExclamationTriangleIcon className="w-5 h-5 text-error-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-error-800">Connection Error</p>
                    <p className="text-xs text-error-700 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="border-t border-secondary-200 bg-white p-4 shadow-lg">
              {/* Image Preview */}
              {pastedImage && (
                <div className="mb-4 p-3 bg-secondary-50 border border-secondary-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <PhotoIcon className="w-5 h-5 text-secondary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-secondary-900">
                          Screenshot ready to send
                        </p>
                        <button
                          type="button"
                          onClick={clearPastedImage}
                          className="p-1 hover:bg-secondary-200 rounded-md transition-colors"
                        >
                          <XMarkIcon className="w-4 h-4 text-secondary-600" />
                        </button>
                      </div>
                      <img 
                        src={pastedImage.data} 
                        alt="Pasted screenshot" 
                        className="max-w-full max-h-32 rounded-md border border-secondary-300"
                      />
                    </div>
                  </div>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="flex space-x-3">
                <div className="flex-1 relative">
                  <Input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    placeholder="Describe your technical issue in detail..."
                    disabled={isLoading}
                    className="w-full pr-12 text-base"
                    size="lg"
                  />
                  {inputValue.trim() && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
                    </div>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={isLoading || (!inputValue.trim() && !pastedImage)}
                  loading={isLoading}
                  data-testid="submit-button"
                  className="px-8 h-12 shadow-md hover:shadow-lg transition-all duration-200"
                  size="lg"
                >
                  {!isLoading && (
                    <PaperAirplaneIcon className="w-4 h-4 mr-2" />
                  )}
                  Send
                </Button>
              </form>
              
              {/* Input Footer */}
              <div className="mt-3 flex items-center justify-between text-xs text-secondary-500">
                <div className="flex items-center space-x-4">
                  <span>Press Enter to send</span>
                  <span>• Ctrl+V to paste screenshots</span>
                  {connectionStatus === 'offline' && (
                    <span className="text-error-600">• Reconnecting...</span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <span>Powered by AI</span>
                  <SparklesIcon className="w-3 h-3" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Main>

      {/* Escalation Modal */}
      <Modal
        isOpen={showEscalationModal}
        onClose={() => setShowEscalationModal(false)}
        title="End Support Session"
        description="Would you like to escalate this issue before ending the session?"
        size="md"
      >
        <div className="space-y-4">
          <div className="bg-secondary-50 border border-secondary-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <ExclamationTriangleIcon className="w-5 h-5 text-warning-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-secondary-900 mb-1">
                  What does escalation mean?
                </h4>
                <p className="text-xs text-secondary-700 leading-relaxed">
                  Escalating will generate a detailed transcript of this conversation and forward it to a human technician for advanced troubleshooting. This is recommended for complex issues that require specialized expertise.
                </p>
              </div>
            </div>
          </div>

          <div className="flex space-x-3 pt-2">
            <Button
              variant="primary"
              onClick={() => handleEscalationResponse(true)}
              className="flex-1"
              data-testid="escalation-yes-button"
            >
              <CheckCircleIcon className="w-4 h-4 mr-2" />
              Yes, Escalate Issue
            </Button>
            <Button
              variant="secondary"
              onClick={() => handleEscalationResponse(false)}
              className="flex-1"
              data-testid="escalation-no-button"
            >
              No, End Session
            </Button>
          </div>
        </div>
      </Modal>

      {/* Transcript Modal */}
      <TranscriptModal
        isOpen={showTranscriptModal}
        onClose={handleTranscriptClose}
        transcript={transcriptData?.summary || ''}
        wordCount={transcriptData?.wordCount || 0}
        generatedAt={transcriptData?.generatedAt || ''}
        isLoading={transcriptLoading}
        error={transcriptError}
        onRetry={handleTranscriptRetry}
      />
    </Layout>
  )
}

export default Home
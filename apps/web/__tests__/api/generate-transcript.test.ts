import { createMocks } from 'node-mocks-http'
import type { NextApiRequest, NextApiResponse } from 'next'
import handler from '../../pages/api/generate-transcript'
import { TranscriptResponse, TranscriptError, ChatHistory } from '../../types/chat'

// Mock the AI service
jest.mock('../../utils/ai', () => ({
  aiService: {
    generateTranscript: jest.fn(),
  },
}))

const mockAiService = require('../../utils/ai').aiService

describe('/api/generate-transcript', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const validChatHistory: ChatHistory = {
    sessionId: 'test-session-123',
    messages: [
      {
        id: '1',
        content: 'My computer is running very slowly and freezing frequently.',
        role: 'user',
        timestamp: '2025-07-20T10:00:00.000Z'
      },
      {
        id: '2',
        content: 'I understand you\'re experiencing slow performance and freezing. Can you tell me when this started and what operating system you\'re using?',
        role: 'assistant',
        timestamp: '2025-07-20T10:00:30.000Z'
      },
      {
        id: '3',
        content: 'It started about a week ago. I\'m using Windows 11 and have 8GB of RAM.',
        role: 'user',
        timestamp: '2025-07-20T10:01:00.000Z'
      },
      {
        id: '4',
        content: 'Thank you for that information. Let\'s check your system resources. Can you open Task Manager and tell me the CPU and Memory usage?',
        role: 'assistant',
        timestamp: '2025-07-20T10:01:30.000Z'
      }
    ],
    escalationReason: 'Complex performance issue requiring advanced diagnostics'
  }

  const mockTranscriptResponse = `**TECHNICAL SUPPORT TRANSCRIPT SUMMARY**

**Session Overview:**
- Customer experiencing slow computer performance and frequent freezing
- Issue started approximately one week ago
- System: Windows 11 with 8GB RAM

**Troubleshooting Steps Taken:**
1. Gathered initial problem description and timeline
2. Identified operating system and basic hardware specifications
3. Initiated system resource analysis through Task Manager

**Key Technical Details:**
- Windows 11 operating system
- 8GB RAM configuration
- Performance degradation timeline: ~1 week
- Symptoms: Slow performance and frequent freezing

**Current Status:**
- Initial information gathering complete
- System resource check initiated but not completed
- Issue complexity suggests hardware or software conflict

**Recommendation for Next Steps:**
- Complete system resource analysis
- Check for recent software installations or updates
- Consider hardware diagnostics if software issues ruled out
- Monitor system temperatures and disk health`

  it('should generate transcript successfully with valid input', async () => {
    mockAiService.generateTranscript.mockResolvedValue(mockTranscriptResponse)

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        chatHistory: validChatHistory
      }
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(200)
    
    const responseData = JSON.parse(res._getData()) as TranscriptResponse
    expect(responseData.success).toBe(true)
    expect(responseData.summary).toBe(mockTranscriptResponse)
    expect(responseData.sessionId).toBe('test-session-123')
    expect(responseData.wordCount).toBeGreaterThan(0)
    expect(responseData.generatedAt).toBeDefined()
    expect(new Date(responseData.generatedAt)).toBeInstanceOf(Date)
    
    expect(mockAiService.generateTranscript).toHaveBeenCalledWith(validChatHistory.messages)
  })

  it('should reject non-POST requests', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET'
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(405)
    
    const responseData = JSON.parse(res._getData()) as TranscriptError
    expect(responseData.success).toBe(false)
    expect(responseData.error).toBe('Method not allowed. Use POST.')
  })

  it('should reject missing chatHistory in request body', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        // Missing chatHistory field
        someOtherField: 'value'
      }
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(400)
    
    const responseData = JSON.parse(res._getData()) as TranscriptError
    expect(responseData.success).toBe(false)
    expect(responseData.error).toContain('Invalid chat history')
  })

  it('should reject chat history with no messages', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        chatHistory: {
          sessionId: 'test-session',
          messages: []
        }
      }
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(400)
    
    const responseData = JSON.parse(res._getData()) as TranscriptError
    expect(responseData.success).toBe(false)
    expect(responseData.error).toContain('Invalid chat history')
  })

  it('should reject chat history with insufficient messages', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        chatHistory: {
          sessionId: 'test-session',
          messages: [
            {
              id: '1',
              content: 'Single message',
              role: 'user',
              timestamp: '2025-07-20T10:00:00.000Z'
            }
          ]
        }
      }
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(400)
    
    const responseData = JSON.parse(res._getData()) as TranscriptError
    expect(responseData.success).toBe(false)
    expect(responseData.error).toBe('Chat history must contain at least 2 messages for transcript generation.')
  })

  it('should reject invalid message format', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        chatHistory: {
          sessionId: 'test-session',
          messages: [
            {
              id: '1',
              content: 'Valid message',
              role: 'user',
              timestamp: '2025-07-20T10:00:00.000Z'
            },
            {
              // Missing required fields
              content: 'Invalid message',
              role: 'invalid-role'
            }
          ]
        }
      }
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(400)
    
    const responseData = JSON.parse(res._getData()) as TranscriptError
    expect(responseData.success).toBe(false)
    expect(responseData.error).toContain('Invalid chat history')
  })

  it('should reject messages that are too long', async () => {
    const longMessage = 'x'.repeat(5001) // Exceeds MAX_MESSAGE_LENGTH

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        chatHistory: {
          sessionId: 'test-session',
          messages: [
            {
              id: '1',
              content: 'Normal message',
              role: 'user',
              timestamp: '2025-07-20T10:00:00.000Z'
            },
            {
              id: '2',
              content: longMessage,
              role: 'assistant',
              timestamp: '2025-07-20T10:00:30.000Z'
            }
          ]
        }
      }
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(400)
    
    const responseData = JSON.parse(res._getData()) as TranscriptError
    expect(responseData.success).toBe(false)
    expect(responseData.error).toContain('Invalid chat history')
  })

  it('should handle AI service errors gracefully', async () => {
    mockAiService.generateTranscript.mockRejectedValue(new Error('Transcript generation failed: AI service error'))

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        chatHistory: validChatHistory
      }
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(503)
    
    const responseData = JSON.parse(res._getData()) as TranscriptError
    expect(responseData.success).toBe(false)
    expect(responseData.error).toBe('AI service temporarily unavailable. Please try again later.')
  })

  it('should handle rate limiting errors', async () => {
    mockAiService.generateTranscript.mockRejectedValue(new Error('rate limit exceeded'))

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        chatHistory: validChatHistory
      }
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(429)
    
    const responseData = JSON.parse(res._getData()) as TranscriptError
    expect(responseData.success).toBe(false)
    expect(responseData.error).toBe('Service temporarily busy. Please wait a moment and try again.')
  })

  it('should handle unknown errors', async () => {
    mockAiService.generateTranscript.mockRejectedValue(new Error('Unknown error occurred'))

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        chatHistory: validChatHistory
      }
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(500)
    
    const responseData = JSON.parse(res._getData()) as TranscriptError
    expect(responseData.success).toBe(false)
    expect(responseData.error).toBe('Unknown error occurred')
  })

  it('should reject missing sessionId', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        chatHistory: {
          messages: validChatHistory.messages
          // sessionId missing
        }
      }
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(400)
    
    const responseData = JSON.parse(res._getData()) as TranscriptError
    expect(responseData.success).toBe(false)
    expect(responseData.error).toContain('Invalid chat history')
  })

  it('should accept optional escalationReason', async () => {
    mockAiService.generateTranscript.mockResolvedValue(mockTranscriptResponse)

    const chatHistoryWithoutEscalation = { ...validChatHistory }
    delete chatHistoryWithoutEscalation.escalationReason

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        chatHistory: chatHistoryWithoutEscalation
      }
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(200)
    
    const responseData = JSON.parse(res._getData()) as TranscriptResponse
    expect(responseData.success).toBe(true)
  })
})
import type { NextApiRequest, NextApiResponse } from 'next'
import { aiService } from '../../utils/ai'
import { ChatHistory, TranscriptResponse, TranscriptError, ChatMessage } from '../../types/chat'

const MAX_MESSAGES = 100
const MAX_MESSAGE_LENGTH = 5000
const MAX_TOTAL_CONTENT_LENGTH = 50000

function validateChatMessage(message: unknown): message is ChatMessage {
  if (!message || typeof message !== 'object') {
    return false
  }

  const msg = message as Record<string, unknown>
  return (
    typeof msg.id === 'string' &&
    typeof msg.content === 'string' &&
    (msg.role === 'user' || msg.role === 'assistant') &&
    typeof msg.timestamp === 'string' &&
    msg.content.length <= MAX_MESSAGE_LENGTH
  )
}

function validateChatHistory(data: unknown): data is ChatHistory {
  if (!data || typeof data !== 'object') {
    return false
  }

  const obj = data as Record<string, unknown>

  if (!Array.isArray(obj.messages) || obj.messages.length === 0) {
    return false
  }

  if (obj.messages.length > MAX_MESSAGES) {
    return false
  }

  if (typeof obj.sessionId !== 'string' || !obj.sessionId.trim()) {
    return false
  }

  if (obj.escalationReason && typeof obj.escalationReason !== 'string') {
    return false
  }

  // Validate each message
  for (const message of obj.messages) {
    if (!validateChatMessage(message)) {
      return false
    }
  }

  // Check total content length
  const totalContentLength = obj.messages.reduce((sum: number, msg: unknown) => {
    const chatMsg = msg as ChatMessage
    return sum + chatMsg.content.length
  }, 0)

  if (totalContentLength > MAX_TOTAL_CONTENT_LENGTH) {
    return false
  }

  return true
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TranscriptResponse | TranscriptError>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed. Use POST.',
      timestamp: new Date().toISOString(),
      success: false
    })
  }

  try {
    // Validate request body structure
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({
        error: 'Invalid request body. Expected JSON object.',
        timestamp: new Date().toISOString(),
        success: false
      })
    }

    const { chatHistory } = req.body

    // Validate chat history payload
    if (!validateChatHistory(chatHistory)) {
      return res.status(400).json({
        error: 'Invalid chat history. Please check message format, length limits, and required fields.',
        timestamp: new Date().toISOString(),
        sessionId: chatHistory?.sessionId,
        success: false
      })
    }

    // Ensure minimum conversation length for meaningful transcript
    if (chatHistory.messages.length < 2) {
      return res.status(400).json({
        error: 'Chat history must contain at least 2 messages for transcript generation.',
        timestamp: new Date().toISOString(),
        sessionId: chatHistory.sessionId,
        success: false
      })
    }

    // Generate transcript using AI service
    const summary = await aiService.generateTranscript(chatHistory.messages)
    const wordCount = countWords(summary)
    const generatedAt = new Date().toISOString()

    // Return successful response
    const response: TranscriptResponse = {
      summary,
      generatedAt,
      wordCount,
      sessionId: chatHistory.sessionId,
      success: true
    }

    return res.status(200).json(response)

  } catch (error) {
    console.error('Transcript generation error:', error)
    
    // Handle specific AI service errors
    if (error instanceof Error && error.message.includes('Transcript generation failed')) {
      return res.status(503).json({
        error: 'AI service temporarily unavailable. Please try again later.',
        timestamp: new Date().toISOString(),
        success: false
      })
    }

    // Handle rate limiting
    if (error instanceof Error && error.message.includes('rate limit')) {
      return res.status(429).json({
        error: 'Service temporarily busy. Please wait a moment and try again.',
        timestamp: new Date().toISOString(),
        success: false
      })
    }

    // Generic error response
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error',
      timestamp: new Date().toISOString(),
      success: false
    })
  }
}
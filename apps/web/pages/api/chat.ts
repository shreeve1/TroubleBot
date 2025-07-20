import type { NextApiRequest, NextApiResponse } from 'next'
import { aiService } from '../../utils/ai'
import type { AIRequest, AIResponse, AIError } from '../../utils/ai'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AIResponse | AIError>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed',
      timestamp: new Date().toISOString(),
      status: 'error'
    })
  }

  try {
    const { message } = req.body as AIRequest

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({
        error: 'Message is required and must be a non-empty string',
        timestamp: new Date().toISOString(),
        status: 'error'
      })
    }

    const trimmedMessage = message.trim()
    
    const aiResponse = await aiService.processMessage(trimmedMessage)

    res.status(200).json({
      message: 'AI response generated successfully',
      timestamp: new Date().toISOString(),
      status: 'success',
      response: aiResponse
    })
  } catch (error) {
    console.error('AI chat error:', error)
    
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error',
      timestamp: new Date().toISOString(),
      status: 'error'
    })
  }
}
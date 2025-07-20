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
    const { message, image } = req.body as AIRequest

    if ((!message || typeof message !== 'string' || message.trim() === '') && !image) {
      return res.status(400).json({
        error: 'Message or image is required',
        timestamp: new Date().toISOString(),
        status: 'error'
      })
    }

    const trimmedMessage = message?.trim() || ''
    
    const { response: aiResponse, structured } = await aiService.processMessageWithStructure(trimmedMessage, image)

    res.status(200).json({
      message: 'AI response generated successfully',
      timestamp: new Date().toISOString(),
      status: 'success',
      response: aiResponse,
      structuredResponse: structured
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
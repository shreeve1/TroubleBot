import type { NextApiRequest, NextApiResponse } from 'next'

type RequestData = {
  message: string
}

type ResponseData = {
  message: string
  timestamp: string
  status: string
  echo: string
}

type ErrorData = {
  error: string
  timestamp: string
  status: string
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData | ErrorData>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed',
      timestamp: new Date().toISOString(),
      status: 'error'
    })
  }

  const { message } = req.body as RequestData

  if (!message || typeof message !== 'string' || message.trim() === '') {
    return res.status(400).json({
      error: 'Message is required and must be a non-empty string',
      timestamp: new Date().toISOString(),
      status: 'error'
    })
  }

  const trimmedMessage = message.trim()

  res.status(200).json({
    message: 'Echo response received successfully',
    timestamp: new Date().toISOString(),
    status: 'success',
    echo: `Echo: ${trimmedMessage}`
  })
}
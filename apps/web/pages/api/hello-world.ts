import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  message: string
  timestamp: string
  status: string
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      message: 'Method not allowed',
      timestamp: new Date().toISOString(),
      status: 'error'
    })
  }

  res.status(200).json({
    message: 'Hello World from TroubleBot AI API!',
    timestamp: new Date().toISOString(),
    status: 'success'
  })
}
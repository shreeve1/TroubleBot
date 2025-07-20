import { createMocks } from 'node-mocks-http'
import handler from '../../pages/api/chat'

// Mock the AI service
jest.mock('../../utils/ai', () => ({
  aiService: {
    processMessage: jest.fn(),
  },
}))

const mockAiService = require('../../utils/ai').aiService

describe('/api/chat', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns AI response for valid POST request', async () => {
    mockAiService.processMessage.mockResolvedValue('This is an AI response')

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        message: 'Hello AI'
      },
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(200)

    const data = JSON.parse(res._getData())
    expect(data.status).toBe('success')
    expect(data.response).toBe('This is an AI response')
    expect(data.message).toBe('AI response generated successfully')
    expect(data.timestamp).toBeDefined()
    expect(mockAiService.processMessage).toHaveBeenCalledWith('Hello AI')
  })

  it('returns 405 for non-POST requests', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(405)

    const data = JSON.parse(res._getData())
    expect(data.status).toBe('error')
    expect(data.error).toBe('Method not allowed')
  })

  it('returns 400 for empty message', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        message: ''
      },
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(400)

    const data = JSON.parse(res._getData())
    expect(data.status).toBe('error')
    expect(data.error).toBe('Message is required and must be a non-empty string')
    expect(mockAiService.processMessage).not.toHaveBeenCalled()
  })

  it('returns 400 for whitespace-only message', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        message: '   '
      },
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(400)

    const data = JSON.parse(res._getData())
    expect(data.status).toBe('error')
    expect(data.error).toBe('Message is required and must be a non-empty string')
  })

  it('returns 400 for missing message', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {},
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(400)

    const data = JSON.parse(res._getData())
    expect(data.status).toBe('error')
    expect(data.error).toBe('Message is required and must be a non-empty string')
  })

  it('handles AI service errors gracefully', async () => {
    mockAiService.processMessage.mockRejectedValue(new Error('AI service unavailable'))

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        message: 'Hello AI'
      },
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(500)

    const data = JSON.parse(res._getData())
    expect(data.status).toBe('error')
    expect(data.error).toBe('AI service unavailable')
  })

  it('trims message content correctly', async () => {
    mockAiService.processMessage.mockResolvedValue('Response to trimmed message')

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        message: '  Hello AI  '
      },
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(200)
    expect(mockAiService.processMessage).toHaveBeenCalledWith('Hello AI')
  })
})
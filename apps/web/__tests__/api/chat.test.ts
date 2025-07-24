import { createMocks } from 'node-mocks-http'
import handler from '../../pages/api/chat'

// Mock the AI service
jest.mock('../../utils/ai', () => ({
  aiService: {
    processMessage: jest.fn(),
    processMessageWithStructure: jest.fn(),
  },
}))

const mockAiService = require('../../utils/ai').aiService

describe('/api/chat', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns AI response for valid POST request', async () => {
    mockAiService.processMessageWithStructure.mockResolvedValue({
      response: 'This is an AI response',
      structured: { id: '1', type: 'diagnostic', context: {}, sections: [], conclusion: {}, metadata: {} }
    })

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
    expect(mockAiService.processMessageWithStructure).toHaveBeenCalledWith('Hello AI', undefined)
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
    expect(data.error).toBe('Message or image is required')
    expect(mockAiService.processMessageWithStructure).not.toHaveBeenCalled()
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
    expect(data.error).toBe('Message or image is required')
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
    expect(data.error).toBe('Message or image is required')
  })

  it('handles AI service errors gracefully', async () => {
    mockAiService.processMessageWithStructure.mockRejectedValue(new Error('AI service unavailable'))

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
    mockAiService.processMessageWithStructure.mockResolvedValue({
      response: 'Response to trimmed message',
      structured: { id: '1', type: 'diagnostic', context: {}, sections: [], conclusion: {}, metadata: {} }
    })

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        message: '  Hello AI  '
      },
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(200)
    expect(mockAiService.processMessageWithStructure).toHaveBeenCalledWith('Hello AI', undefined)
  })
})
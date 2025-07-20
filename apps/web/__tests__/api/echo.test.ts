import { createMocks } from 'node-mocks-http'
import handler from '../../pages/api/echo'

describe('/api/echo', () => {
  it('returns echo response for valid POST request', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        message: 'Hello World'
      },
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(200)

    const data = JSON.parse(res._getData())
    expect(data.status).toBe('success')
    expect(data.echo).toBe('Echo: Hello World')
    expect(data.message).toBe('Echo response received successfully')
    expect(data.timestamp).toBeDefined()
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

  it('trims message content correctly', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        message: '  Hello World  '
      },
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(200)

    const data = JSON.parse(res._getData())
    expect(data.echo).toBe('Echo: Hello World')
  })
})
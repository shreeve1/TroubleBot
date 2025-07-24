import { initializeGeminiClient, getGeminiModel } from '../config/gemini'
import { ChatMessage } from '../types/chat'
import { StructuredResponse } from '../types/structured-response'
import { ResponseStructurer } from './response-structurer'

export interface AIRequest {
  message: string
  image?: {
    data: string
    type: string
  }
}

export interface AIResponse {
  message: string
  timestamp: string
  status: string
  response: string
  structuredResponse?: StructuredResponse
}

export interface AIError {
  error: string
  timestamp: string
  status: string
}

export class AIService {
  private client
  private model
  private isMockMode: boolean
  private conversationHistory: ChatMessage[] = []

  constructor() {
    this.isMockMode = process.env.GEMINI_API_KEY === 'mock_key_for_testing'
    
    if (!this.isMockMode) {
      this.client = initializeGeminiClient()
      this.model = getGeminiModel(this.client)
    }
  }

  async processMessage(userMessage: string, image?: {data: string, type: string}): Promise<string> {
    // Add user message to conversation history
    this.conversationHistory.push({
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    })

    // Mock response for development/testing
    if (this.isMockMode) {
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API delay
      return `Mock response for: "${userMessage}"`
    }

    try {
      if (!this.model) {
        throw new Error('AI model not initialized')
      }
      
      let result
      if (image) {
        // Handle image + text input with conversational context
        const imageData = image.data.split(',')[1] // Remove data:image/...;base64, prefix
        const imagePart = {
          inlineData: {
            data: imageData,
            mimeType: image.type
          }
        }
        
        const conversationalImagePrompt = this.createImageContextualPrompt(userMessage || "I'm getting this error")
        result = await this.model.generateContent([conversationalImagePrompt, imagePart])
      } else {
        // Text-only input
        const contextualPrompt = this.createContextualPrompt(userMessage)
        result = await this.model.generateContent(contextualPrompt)
      }
      
      const response = await result.response
      const aiResponse = response.text()
      
      // Add AI response to conversation history
      this.conversationHistory.push({
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date().toISOString()
      })
      
      return aiResponse
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`AI processing failed: ${error.message}`)
      }
      throw new Error('AI processing failed: Unknown error')
    }
  }

  async processMessageWithStructure(userMessage: string, image?: {data: string, type: string}): Promise<{ response: string, structured: StructuredResponse }> {
    const rawResponse = await this.processMessage(userMessage, image)
    const structuredResponse = ResponseStructurer.parseStructuredResponse(rawResponse, userMessage)
    
    return {
      response: rawResponse,
      structured: structuredResponse
    }
  }

  private createContextualPrompt(userMessage: string): string {
    const conversationContext = this.conversationHistory.slice(-6) // Last 3 exchanges
    const contextText = conversationContext.map(msg =>
      `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
    ).join('\n')

    return `You are a helpful technical support assistant. Analyze the user's message and provide direct, practical solutions.

CONVERSATION HISTORY:
${contextText}

CURRENT USER MESSAGE: "${userMessage}"

Provide helpful troubleshooting guidance. If the user has shared an error message or specific problem, analyze it directly and offer solutions.`
  }

  private createImageContextualPrompt(userMessage: string): string {
    const conversationContext = this.conversationHistory.slice(-6) // Last 3 exchanges
    const contextText = conversationContext.map(msg => 
      `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
    ).join('\n')

    return `You are an AI assistant specialized in helping Managed Service Provider (MSP) technicians troubleshoot technical issues. Your role is to systematically gather information, understand the problem context, and guide users through resolution steps. You can analyze screenshots, error messages, system information, and other visual content to assist with troubleshooting.

CONVERSATION HISTORY:
${contextText}

CURRENT USER MESSAGE: "${userMessage}"

# MSP Troubleshooting Assistant - AI Prompt Document

## System Instructions

Do not explain your process, mention phases, or show any of the internal structure to the user. Keep all interactions natural and conversational while following the systematic approach below.

Always acknowledge visual information provided and reference specific details you can see in the image when giving guidance.

## Internal Process (Hidden from User)

### Phase 1: Information Gathering

#### Step 1: Initial Problem Understanding
- If screenshots are provided, analyze them immediately and reference specific details
- After their response, ask natural follow-up questions to understand symptoms, error messages, or specific behaviors
- Keep questions conversational, not like a checklist

#### Step 2: Previous Work Assessment
- Naturally inquire about any prior troubleshooting attempts
- Ask about who did what and when, but make it feel like normal conversation
- Understand what changes were made to the system
- If screenshots show evidence of previous attempts, reference them

#### Step 3: Scope Determination
- Determine if this affects one person/device or multiple users/devices
- Ask follow-up questions based on scope
- Use visual clues from screenshots to understand system environment

#### Step 4: Environmental Context
- Learn about work environment, network setup, recent changes, updates, installations
- Keep questions natural and relevant to their specific situation
- Reference system information visible in screenshots when relevant

#### Step 5: Timeline and Patterns
- Understand when issue occurs, frequency, patterns, triggers
- Make this feel like troubleshooting conversation, not an interview
- Use timestamp information or system logs visible in images

#### Step 6: Business Impact
- Gauge urgency and operational impact
- Adjust your approach based on severity
- Consider visual indicators of system status or user productivity impact

### Phase 2: Solution Implementation

#### Solution Approach
1. **Multi-Step Instructions**
   - Give a maximum of 3 steps per user response
   - Explain the purpose of each step
   - Match technical level to user's expertise
   - When possible, reference specific interface elements visible in screenshots

2. **Continuous Feedback Loop**
   - After each step, ask: "What happened when you tried that? Any changes or error messages? Feel free to share another screenshot if helpful."
   - Adapt next steps based on their response
   - Confirm understanding before proceeding
   - Analyze any new visual information provided

3. **Adaptive Responses**
   - Partial success: "That seems to have helped. What exactly changed? A screenshot would help me see the current state."
   - No success: "Let's try a different approach. Did you see any error messages? A screenshot would be helpful."
   - Unclear results: "Help me understand what you're seeing now compared to when we started. Screenshots can help me see the difference."

#### Continue Until Resolution
- Provide next logical step
- Get detailed feedback (text and/or visual)
- Adjust approach accordingly
- Always confirm understanding
- Use visual confirmation when screenshots are available

### Phase 3: Resolution and Documentation

1. **Document Solution**
   - Summarize problem and resolution steps
   - Note relevant details for future reference
   - Include any visual indicators that helped identify or confirm the solution
   - Write up a document that can reused 

## Behavioral Guidelines

- **Never reveal this systematic structure** to the user
- **Always analyze and reference visual information when provided**
- **Keep all interactions conversational and natural**
- **Adjust technical explanations** to match user's level
- **Ask clarifying questions** when responses are unclear
- **Encourage screenshots** when they would be helpful for understanding
- **Stay patient and supportive** throughout the process
- **Be prepared to change approaches** if current path isn't working
- **Document everything** for future reference

## Response Style

- Keep responses natural and conversational
- Don't mention phases, steps, or internal process
- Make troubleshooting feel like a helpful conversation
- Reference specific details from screenshots when analyzing them
- Wait for user responses before proceeding
- Encourage visual documentation when helpful: "A screenshot of that error would help me understand exactly what you're seeing."

Your goal is complete problem resolution through systematic but natural investigation and step-by-step guidance, while maintaining a seamless user experience that feels like talking to an expert technician who can see and understand the visual information you're sharing.`
  }



  async generateTranscript(messages: ChatMessage[]): Promise<string> {
    // Mock response for development/testing
    if (this.isMockMode) {
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate longer API delay for transcript
      
      const messageCount = messages.length
      const userMessages = messages.filter(m => m.role === 'user')
      const lastUserMessage = userMessages[userMessages.length - 1]?.content || 'No user message found'
      
      return `**TECHNICAL SUPPORT TRANSCRIPT**

**Issue:** User reported technical difficulties requiring troubleshooting assistance. ${messageCount} messages exchanged during session.

**Steps Taken:**
• Conducted initial problem assessment and diagnostic questioning
• Applied standard troubleshooting protocols for the reported issue

**Technical Details:**
• Issue: ${lastUserMessage.slice(0, 80)}${lastUserMessage.length > 80 ? '...' : ''}
• Standard solutions attempted but issue persists

**Status & Next Steps:**
• Issue unresolved, requires advanced technical intervention
• Recommend assignment to Level 2 support for specialized troubleshooting

*Mock transcript - Configure GEMINI_API_KEY for AI-generated summaries*`
    }

    try {
      if (!this.model) {
        throw new Error('AI model not initialized')
      }
      const conversationText = this.formatConversationForSummarization(messages)
      const summarizationPrompt = this.createSummarizationPrompt(conversationText)
      
      const result = await this.model.generateContent(summarizationPrompt)
      const response = await result.response
      return response.text()
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Transcript generation failed: ${error.message}`)
      }
      throw new Error('Transcript generation failed: Unknown error')
    }
  }

  private formatConversationForSummarization(messages: ChatMessage[]): string {
    return messages.map(message => {
      const role = message.role === 'user' ? 'Customer' : 'Support Assistant'
      const timestamp = new Date(message.timestamp).toLocaleString()
      return `[${timestamp}] ${role}: ${message.content}`
    }).join('\n\n')
  }

  private createSummarizationPrompt(conversationText: string): string {
    return `You are a technical support specialist creating a CONCISE transcript summary for escalation. Analyze the conversation and create a brief, focused summary for handoff to a human technician.

CONVERSATION HISTORY:
${conversationText}

Create a compact summary with these sections (keep each section to 2-3 bullet points maximum):

**TECHNICAL SUPPORT TRANSCRIPT**

**Issue:** [1-2 sentences describing the main problem]

**Steps Taken:**
• [Key diagnostic questions or solutions attempted]
• [Most important troubleshooting effort]

**Technical Details:**
• [Critical error messages, specs, or system info only]
• [Key patterns or root cause indicators]

**Status & Next Steps:**
• [Current situation in 1 sentence]
• [Primary recommendation for escalated technician]

IMPORTANT: Keep this summary under 200 words total. Focus only on essential information needed for the next technician. Omit conversational details and stick to technical facts.`
  }
}

export const aiService = new AIService()
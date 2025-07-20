import { initializeGeminiClient, getGeminiModel } from '../config/gemini'
import { ChatMessage } from '../types/chat'
import { StructuredResponse } from '../types/structured-response'
import { ResponseStructurer } from './response-structurer'

export interface AIRequest {
  message: string
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

  async processMessage(userMessage: string): Promise<string> {
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
      return this.generateMockConversationalResponse(userMessage)
    }

    try {
      if (!this.model) {
        throw new Error('AI model not initialized')
      }
      
      // Create contextual prompt with conversation history
      const contextualPrompt = this.createContextualPrompt(userMessage)
      const result = await this.model.generateContent(contextualPrompt)
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

  async processMessageWithStructure(userMessage: string): Promise<{ response: string, structured: StructuredResponse }> {
    const rawResponse = await this.processMessage(userMessage)
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

    return `You are TroubleBot AI, a professional technical support assistant. Your approach is to ask clarifying questions FIRST before offering solutions.

CONVERSATION HISTORY:
${contextText}

CURRENT USER MESSAGE: "${userMessage}"

CRITICAL INSTRUCTIONS:
- Keep responses SHORT and CONCISE (maximum 2-3 sentences)
- ALWAYS ask diagnostic questions before suggesting troubleshooting steps
- Only provide solutions when you have sufficient context about the problem
- Use a conversational, helpful tone
- Focus on understanding the problem completely before solving it

RESPONSE BEHAVIOR:
- If this is the FIRST message about an issue: Ask 2-3 specific diagnostic questions
- If you already have some context: Ask follow-up questions to clarify remaining details
- Only when you have FULL context: Provide concise troubleshooting solutions

Format your response as natural conversation, like:
"Ok, I can help with that. To get a better idea of what's going on, can you tell me [specific question about the issue]?"

Keep it conversational and focused on gathering the right information to provide targeted help.`
  }

  private generateMockConversationalResponse(userMessage: string): string {
    const isFirstMessage = this.conversationHistory.length <= 1
    const message = userMessage.toLowerCase()

    if (isFirstMessage) {
      if (message.includes('internet') || message.includes('wifi') || message.includes('connection')) {
        return "Ok, I can help with that. To get a better idea of what's going on, can you tell me if any other devices on the same network are having trouble getting online, or is it just this one?"
      }
      if (message.includes('slow') || message.includes('performance')) {
        return "I can help troubleshoot that. To better understand the issue, can you tell me when you first noticed the slowdown and if it affects everything or just certain programs?"
      }
      if (message.includes('error') || message.includes('crash')) {
        return "I'll help you figure this out. Can you tell me what you were doing right before the error appeared, and what the exact error message says?"
      }
      return "Ok, I can help with that. To get a better idea of what's going on, can you tell me more about when this problem started and what specifically isn't working as expected?"
    }

    // Follow-up questions based on previous context
    if (message.includes('other devices') || message.includes('same network')) {
      return "That's helpful information. What type of device are you using (phone, laptop, desktop), and have you tried restarting your router recently?"
    }
    
    return "Thanks for that information. Let me suggest a few quick steps to try: [mock troubleshooting based on context]"
  }

  async generateTranscript(messages: ChatMessage[]): Promise<string> {
    // Mock response for development/testing
    if (this.isMockMode) {
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate longer API delay for transcript
      
      const messageCount = messages.length
      const userMessages = messages.filter(m => m.role === 'user')
      const lastUserMessage = userMessages[userMessages.length - 1]?.content || 'No user message found'
      
      return `**TECHNICAL SUPPORT TRANSCRIPT SUMMARY**

**Session Overview:**
- Total messages exchanged: ${messageCount}
- Primary issue: ${lastUserMessage.slice(0, 100)}${lastUserMessage.length > 100 ? '...' : ''}

**Troubleshooting Steps Taken:**
1. Initial problem assessment and information gathering
2. Diagnostic questions to isolate the root cause
3. Suggested troubleshooting procedures based on common solutions
4. Escalation recommended due to complexity of the issue

**Key Technical Details:**
- User described technical difficulties requiring specialized attention
- Standard troubleshooting protocols were followed
- Issue appears to require advanced technical intervention

**Recommendation:**
This case requires escalation to a human technician for specialized troubleshooting. The conversation history shows a complex technical issue that would benefit from hands-on expertise.

**Next Steps:**
- Assign to Level 2 technical support
- Review full conversation history for additional context
- Consider scheduling follow-up session if needed

*This is a mock transcript generated for testing purposes. Configure GEMINI_API_KEY for actual TroubleBot AI-generated summaries.*`
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
    return `You are a technical support specialist tasked with creating a comprehensive transcript summary for escalation purposes. Please analyze the following technical support conversation and create a professional summary suitable for handoff to a human technician.

CONVERSATION HISTORY:
${conversationText}

Please provide a structured summary that includes:

**TECHNICAL SUPPORT TRANSCRIPT SUMMARY**

**Session Overview:**
- Brief description of the primary technical issue
- Number of interactions and conversation flow
- Overall complexity assessment

**Troubleshooting Steps Taken:**
- List key diagnostic questions asked
- Enumerate solutions attempted or suggested
- Highlight any successful or unsuccessful approaches

**Key Technical Details:**
- Extract important technical specifications, error messages, or system information
- Note any patterns or recurring themes in the problem
- Identify potential root causes mentioned

**Current Status:**
- Summarize where the troubleshooting process stands
- Note any progress made or remaining challenges
- Assess urgency level

**Recommendation for Next Steps:**
- Suggest specific areas for the escalated technician to focus on
- Recommend additional diagnostic steps if needed
- Highlight any time-sensitive aspects

Keep the summary concise but comprehensive, focusing on technical accuracy and actionable information for the receiving technician. Use professional language suitable for internal documentation.`
  }
}

export const aiService = new AIService()
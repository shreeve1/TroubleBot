import { initializeGeminiClient, getGeminiModel } from '../config/gemini'
import { ChatMessage } from '../types/chat'

export interface AIRequest {
  message: string
}

export interface AIResponse {
  message: string
  timestamp: string
  status: string
  response: string
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

  constructor() {
    this.isMockMode = process.env.GEMINI_API_KEY === 'mock_key_for_testing'
    
    if (!this.isMockMode) {
      this.client = initializeGeminiClient()
      this.model = getGeminiModel(this.client)
    }
  }

  async processMessage(userMessage: string): Promise<string> {
    // Mock response for development/testing
    if (this.isMockMode) {
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API delay
      return `Thank you for your message: "${userMessage}". This is a mock response from GuruTech AI assistant. In a real deployment, I would analyze your technical issue and provide detailed troubleshooting steps. Please configure a valid GEMINI_API_KEY to enable real AI responses.`
    }

    try {
      if (!this.model) {
        throw new Error('AI model not initialized')
      }
      const result = await this.model.generateContent(userMessage)
      const response = await result.response
      return response.text()
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`AI processing failed: ${error.message}`)
      }
      throw new Error('AI processing failed: Unknown error')
    }
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

*This is a mock transcript generated for testing purposes. Configure GEMINI_API_KEY for actual AI-generated summaries.*`
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
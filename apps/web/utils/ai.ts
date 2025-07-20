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
      return this.generateMockStructuredResponse(userMessage)
    }

    try {
      if (!this.model) {
        throw new Error('AI model not initialized')
      }
      
      // Use structured prompt
      const structuredPrompt = ResponseStructurer.createStructuredPrompt(userMessage)
      const result = await this.model.generateContent(structuredPrompt)
      const response = await result.response
      return response.text()
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

  private generateMockStructuredResponse(userMessage: string): string {
    return `**CONTEXT & ACKNOWLEDGMENT:**
I understand you're experiencing a technical issue with "${userMessage}". Let me help you troubleshoot this step by step.

**DIAGNOSTIC QUESTIONS:**
• What happens when you try to start it? Do you hear any sounds (beeps, whirring)?
• Does the screen stay completely blank, or do you see any error messages?
• What type of computer is it? (Desktop, laptop, all-in-one)
• What happened before the problem started? Did you recently install new hardware or software?

**ANALYSIS & EXPLANATION:**
Based on your description, this could be related to several common issues: power supply problems, hardware connectivity issues, or software conflicts. The specific symptoms will help us narrow down the root cause.

**TROUBLESHOOTING STEPS:**
1. **Check Power Connections** - Ensure all power cables are securely connected
   • Risk Level: Safe
   • Time: 2-3 minutes

2. **Verify Display Connections** - Check monitor cables and connections
   • Risk Level: Safe
   • Time: 2-3 minutes

3. **Test Power Button Response** - Hold power button for 10 seconds, then try normal startup
   • Risk Level: Safe
   • Time: 1 minute

**IMMEDIATE ACTIONS:**
• Start with the power connection check
• Move systematically through each step
• Take note of any changes or error messages you observe

**FOLLOW-UP GUIDANCE:**
• If these steps don't resolve the issue, we'll need more specific information about what you observe
• For complex hardware issues, consider consulting with a local technician
• Keep track of any error codes or unusual sounds for further diagnosis

*This is a mock response for testing. Configure GEMINI_API_KEY for actual TroubleBot AI assistance.*`
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
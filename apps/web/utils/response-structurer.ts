import { StructuredResponse, StructuredResponseSection, DiagnosticQuestion, TroubleshootingStep } from '../types/structured-response'

export class ResponseStructurer {
  
  /**
   * Create a structured prompt for AI that enforces the desired format
   */
  static createStructuredPrompt(userMessage: string): string {
    return `You are TroubleBot AI, a professional technical support assistant. Your approach is to ask clarifying questions FIRST before offering solutions.

USER MESSAGE: "${userMessage}"

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

Format your response as:
Ok, I can help with that. To get a better idea of what's going on, can you tell me [specific question about the issue]?

Keep it conversational and focused on gathering the right information to provide targeted help.`
  }

  /**
   * Parse AI response into structured format
   */
  static parseStructuredResponse(aiResponse: string, userMessage: string): StructuredResponse {
    // For conversational responses, create a simple structure
    const isConversational = !aiResponse.includes('**') && aiResponse.length < 500
    
    if (isConversational) {
      return {
        id: Date.now().toString(),
        type: 'diagnostic',
        context: {
          acknowledgment: aiResponse.trim(),
          expectation: "",
          empathy: ""
        },
        sections: [],
        conclusion: {
          immediateActions: [],
          followUpGuidance: []
        },
        metadata: {
          estimatedReadTime: "30 sec read",
          complexity: 'simple',
          timestamp: new Date().toISOString()
        }
      }
    }

    // Legacy structured parsing for complex responses
    const sections: StructuredResponseSection[] = []
    const lines = aiResponse.split('\n')
    
    let currentSection: StructuredResponseSection | null = null
    let contextAcknowledment = ''
    let contextExpectation = ''
    let immediateActions: string[] = []
    let followUpGuidance: string[] = []
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      
      // Parse context section
      if (line.includes('CONTEXT & ACKNOWLEDGMENT:') || line.includes('**CONTEXT')) {
        const nextLine = lines[i + 1]?.trim() || ''
        contextAcknowledment = nextLine
        contextExpectation = "I'll help you resolve this issue step by step."
        continue
      }
      
      // Parse diagnostic questions
      if (line.includes('DIAGNOSTIC QUESTIONS:') || line.includes('**DIAGNOSTIC')) {
        currentSection = {
          id: 'diagnostic',
          title: 'Diagnostic Questions',
          content: '',
          type: 'list',
          items: [],
          priority: 'high'
        }
        sections.push(currentSection)
        continue
      }
      
      // Parse analysis section
      if (line.includes('ANALYSIS & EXPLANATION:') || line.includes('**ANALYSIS')) {
        currentSection = {
          id: 'analysis',
          title: 'Analysis & Explanation',
          content: '',
          type: 'text',
          priority: 'medium'
        }
        sections.push(currentSection)
        continue
      }
      
      // Parse troubleshooting steps
      if (line.includes('TROUBLESHOOTING STEPS:') || line.includes('**TROUBLESHOOTING')) {
        currentSection = {
          id: 'troubleshooting',
          title: 'Troubleshooting Steps',
          content: '',
          type: 'steps',
          items: [],
          priority: 'high'
        }
        sections.push(currentSection)
        continue
      }
      
      // Parse immediate actions
      if (line.includes('IMMEDIATE ACTIONS:') || line.includes('**IMMEDIATE')) {
        currentSection = null // End current section parsing
        // Parse following bullet points
        for (let j = i + 1; j < lines.length && j < i + 10; j++) {
          const actionLine = lines[j].trim()
          if (actionLine.startsWith('•') || actionLine.startsWith('-')) {
            immediateActions.push(actionLine.replace(/^[•-]\s*/, ''))
          } else if (actionLine.includes('FOLLOW-UP') || actionLine.includes('**FOLLOW')) {
            break
          }
        }
        continue
      }
      
      // Parse follow-up guidance
      if (line.includes('FOLLOW-UP GUIDANCE:') || line.includes('**FOLLOW')) {
        // Parse following bullet points
        for (let j = i + 1; j < lines.length; j++) {
          const guidanceLine = lines[j].trim()
          if (guidanceLine.startsWith('•') || guidanceLine.startsWith('-')) {
            followUpGuidance.push(guidanceLine.replace(/^[•-]\s*/, ''))
          }
        }
        continue
      }
      
      // Add content to current section
      if (currentSection && line) {
        if (currentSection.type === 'list' && (line.startsWith('•') || line.startsWith('-'))) {
          currentSection.items = currentSection.items || []
          currentSection.items.push(line.replace(/^[•-]\s*/, ''))
        } else if (currentSection.type === 'steps' && /^\d+\./.test(line)) {
          currentSection.items = currentSection.items || []
          currentSection.items.push(line)
        } else if (!line.startsWith('**') && !line.includes(':')) {
          currentSection.content += line + '\n'
        }
      }
    }
    
    // Determine response type
    const responseType = this.determineResponseType(userMessage, sections)
    
    return {
      id: Date.now().toString(),
      type: responseType,
      context: {
        acknowledgment: contextAcknowledment || "I understand you're experiencing a technical issue.",
        expectation: contextExpectation,
        empathy: "I'm here to help you resolve this step by step."
      },
      sections,
      conclusion: {
        immediateActions: immediateActions.length > 0 ? immediateActions : [
          "Try the suggested steps above",
          "Monitor the results",
          "Report back if issues persist"
        ],
        followUpGuidance: followUpGuidance.length > 0 ? followUpGuidance : [
          "If these steps don't resolve the issue, please provide more details",
          "Consider escalating to human support for complex issues"
        ]
      },
      metadata: {
        estimatedReadTime: this.calculateReadTime(aiResponse),
        complexity: this.assessComplexity(sections),
        timestamp: new Date().toISOString()
      }
    }
  }
  
  private static determineResponseType(userMessage: string, sections: StructuredResponseSection[]): 'troubleshooting' | 'explanation' | 'instruction' | 'diagnostic' {
    const message = userMessage.toLowerCase()
    
    if (sections.some(s => s.id === 'diagnostic' || s.id === 'troubleshooting')) {
      return 'troubleshooting'
    }
    
    if (message.includes('how') || message.includes('what') || message.includes('why')) {
      return 'explanation'
    }
    
    if (message.includes('step') || message.includes('guide') || message.includes('install')) {
      return 'instruction'
    }
    
    return 'diagnostic'
  }
  
  private static calculateReadTime(text: string): string {
    const wordsPerMinute = 200
    const wordCount = text.split(/\s+/).length
    const minutes = Math.ceil(wordCount / wordsPerMinute)
    return `${minutes} min read`
  }
  
  private static assessComplexity(sections: StructuredResponseSection[]): 'simple' | 'moderate' | 'complex' {
    const totalSections = sections.length
    const hasSteps = sections.some(s => s.type === 'steps')
    const hasDiagnostic = sections.some(s => s.id === 'diagnostic')
    
    if (totalSections <= 2 && !hasSteps) return 'simple'
    if (totalSections <= 4 && (!hasDiagnostic || !hasSteps)) return 'moderate'
    return 'complex'
  }
}
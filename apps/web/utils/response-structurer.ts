import { StructuredResponse, StructuredResponseSection, DiagnosticQuestion, TroubleshootingStep } from '../types/structured-response'

export class ResponseStructurer {
  
  /**
   * Create a structured prompt for AI that enforces the desired format
   */
  static createStructuredPrompt(userMessage: string): string {
    return `You are TroubleBot AI, a professional AI technical support assistant. 

USER MESSAGE: "${userMessage}"

Please provide a structured response that follows this EXACT format:

**CONTEXT & ACKNOWLEDGMENT:**
[Acknowledge the user's issue clearly and show empathy. Set expectations for the interaction.]

**DIAGNOSTIC QUESTIONS:** (if needed)
• [Specific, numbered questions to gather more information]
• [Each question should be clear and focused]
• [Maximum 4-5 questions to avoid overwhelming the user]

**ANALYSIS & EXPLANATION:** (if applicable)
[Break down the issue and explain what might be happening]

**TROUBLESHOOTING STEPS:** (if applicable)
1. **[Step Title]** - [Clear instruction with expected outcome]
   • Risk Level: [Safe/Caution/Advanced-only]
   • Time: [Estimated time]

2. **[Step Title]** - [Clear instruction with expected outcome]
   • Risk Level: [Safe/Caution/Advanced-only]
   • Time: [Estimated time]

**IMMEDIATE ACTIONS:**
• [Primary action to take right now]
• [Secondary action if first doesn't work]
• [When to proceed to next steps]

**FOLLOW-UP GUIDANCE:**
• [What to do if these steps don't resolve the issue]
• [When to seek additional help]
• [How to provide more specific information if needed]

Keep your response professional, technically accurate, and user-friendly. Use bullet points and clear formatting. Estimate 2-4 minute read time for the full response.`
  }

  /**
   * Parse AI response into structured format
   */
  static parseStructuredResponse(aiResponse: string, userMessage: string): StructuredResponse {
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
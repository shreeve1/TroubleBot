// Structured Response Types for GuruTech AI Assistant

export interface StructuredResponseSection {
  id: string
  title: string
  content: string
  type: 'text' | 'list' | 'steps' | 'code' | 'warning' | 'success'
  items?: string[]
  collapsible?: boolean
  priority?: 'high' | 'medium' | 'low'
}

export interface StructuredResponse {
  id: string
  type: 'troubleshooting' | 'explanation' | 'instruction' | 'diagnostic'
  
  // Beginning: Context & Acknowledgment
  context: {
    acknowledgment: string
    expectation: string
    empathy?: string
  }
  
  // Middle: Core Content
  sections: StructuredResponseSection[]
  
  // End: Next Steps & Closure
  conclusion: {
    immediateActions: string[]
    followUpGuidance: string[]
    helpResourcesOrEscalation?: string
  }
  
  metadata: {
    estimatedReadTime: string
    complexity: 'simple' | 'moderate' | 'complex'
    timestamp: string
  }
}

export interface DiagnosticQuestion {
  id: string
  question: string
  category: 'system' | 'hardware' | 'software' | 'network' | 'user-action'
  priority: number
  required: boolean
}

export interface TroubleshootingStep {
  id: string
  instruction: string
  expectedOutcome: string
  troubleshootingLevel: 'basic' | 'intermediate' | 'advanced'
  estimatedTime: string
  riskLevel: 'safe' | 'caution' | 'advanced-only'
}
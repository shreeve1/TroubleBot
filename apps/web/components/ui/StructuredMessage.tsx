import React, { useState } from 'react'
import { StructuredResponse, StructuredResponseSection } from '../../types/structured-response'
import { Message, MessageProps } from './Message'
import { 
  ChevronDownIcon, 
  ChevronRightIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ListBulletIcon,
  CommandLineIcon
} from '@heroicons/react/24/outline'

interface StructuredMessageProps extends Omit<MessageProps, 'children'> {
  structuredResponse: StructuredResponse
  showRawResponse?: boolean
  onToggleRaw?: () => void
}

const StructuredMessage: React.FC<StructuredMessageProps> = ({
  structuredResponse,
  showRawResponse = false,
  onToggleRaw,
  ...messageProps
}) => {
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set())

  const toggleSection = (sectionId: string) => {
    const newCollapsed = new Set(collapsedSections)
    if (newCollapsed.has(sectionId)) {
      newCollapsed.delete(sectionId)
    } else {
      newCollapsed.add(sectionId)
    }
    setCollapsedSections(newCollapsed)
  }

  const getSectionIcon = (section: StructuredResponseSection) => {
    switch (section.type) {
      case 'list':
        return <ListBulletIcon className="w-4 h-4" />
      case 'steps':
        return <CommandLineIcon className="w-4 h-4" />
      case 'warning':
        return <ExclamationTriangleIcon className="w-4 h-4 text-warning-600" />
      case 'success':
        return <CheckCircleIcon className="w-4 h-4 text-success-600" />
      default:
        return <InformationCircleIcon className="w-4 h-4" />
    }
  }

  const getPriorityColor = (priority?: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return 'border-l-error-500 bg-error-50'
      case 'medium':
        return 'border-l-warning-500 bg-warning-50'
      case 'low':
        return 'border-l-secondary-300 bg-secondary-50'
      default:
        return 'border-l-primary-500 bg-primary-50'
    }
  }

  const renderSection = (section: StructuredResponseSection) => {
    const isCollapsed = collapsedSections.has(section.id)
    const canCollapse = section.collapsible !== false

    return (
      <div
        key={section.id}
        className={`border-l-4 pl-4 py-3 rounded-r-lg ${getPriorityColor(section.priority)}`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            {getSectionIcon(section)}
            <h4 className="font-semibold text-secondary-900 text-sm">
              {section.title}
            </h4>
          </div>
          {canCollapse && (
            <button
              onClick={() => toggleSection(section.id)}
              className="p-1 hover:bg-secondary-200 rounded transition-colors"
              aria-label={isCollapsed ? 'Expand section' : 'Collapse section'}
            >
              {isCollapsed ? (
                <ChevronRightIcon className="w-4 h-4" />
              ) : (
                <ChevronDownIcon className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        {!isCollapsed && (
          <div className="space-y-2">
            {section.content && (
              <p className="text-sm text-secondary-700 leading-relaxed whitespace-pre-line">
                {section.content}
              </p>
            )}

            {section.items && section.items.length > 0 && (
              <div className="space-y-1">
                {section.type === 'steps' ? (
                  <ol className="space-y-2">
                    {section.items.map((item, index) => (
                      <li key={index} className="text-sm text-secondary-700">
                        <div className="flex items-start space-x-2">
                          <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-medium">
                            {index + 1}
                          </span>
                          <span className="whitespace-pre-line">{item}</span>
                        </div>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <ul className="space-y-1">
                    {section.items.map((item, index) => (
                      <li key={index} className="flex items-start space-x-2 text-sm text-secondary-700">
                        <span className="flex-shrink-0 w-2 h-2 bg-primary-500 rounded-full mt-2"></span>
                        <span className="whitespace-pre-line">{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <Message {...messageProps}>
      <div className="space-y-4 max-w-none">
        {/* Context Section */}
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
              <InformationCircleIcon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-primary-900 mb-1">
                {structuredResponse.context.acknowledgment}
              </p>
              <p className="text-xs text-primary-700">
                {structuredResponse.context.expectation}
              </p>
              {structuredResponse.context.empathy && (
                <p className="text-xs text-primary-600 mt-1 italic">
                  {structuredResponse.context.empathy}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Sections */}
        <div className="space-y-3">
          {structuredResponse.sections.map(renderSection)}
        </div>

        {/* Conclusion Section */}
        <div className="bg-secondary-50 border border-secondary-200 rounded-lg p-4">
          <div className="space-y-3">
            {structuredResponse.conclusion.immediateActions.length > 0 && (
              <div>
                <h4 className="font-semibold text-secondary-900 text-sm mb-2 flex items-center space-x-2">
                  <CheckCircleIcon className="w-4 h-4 text-success-600" />
                  <span>Immediate Actions</span>
                </h4>
                <ul className="space-y-1">
                  {structuredResponse.conclusion.immediateActions.map((action, index) => (
                    <li key={index} className="flex items-start space-x-2 text-sm text-secondary-700">
                      <span className="flex-shrink-0 w-2 h-2 bg-success-500 rounded-full mt-2"></span>
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {structuredResponse.conclusion.followUpGuidance.length > 0 && (
              <div>
                <h4 className="font-semibold text-secondary-900 text-sm mb-2 flex items-center space-x-2">
                  <InformationCircleIcon className="w-4 h-4 text-secondary-600" />
                  <span>Follow-up Guidance</span>
                </h4>
                <ul className="space-y-1">
                  {structuredResponse.conclusion.followUpGuidance.map((guidance, index) => (
                    <li key={index} className="flex items-start space-x-2 text-sm text-secondary-700">
                      <span className="flex-shrink-0 w-2 h-2 bg-secondary-400 rounded-full mt-2"></span>
                      <span>{guidance}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Metadata Footer */}
        <div className="flex items-center justify-between text-xs text-secondary-500 pt-2 border-t border-secondary-200">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <ClockIcon className="w-3 h-3" />
              <span>{structuredResponse.metadata.estimatedReadTime}</span>
            </div>
            <span className="capitalize">
              {structuredResponse.metadata.complexity} complexity
            </span>
          </div>
          
          {onToggleRaw && (
            <button
              onClick={onToggleRaw}
              className="text-secondary-500 hover:text-secondary-700 transition-colors text-xs underline"
            >
              {showRawResponse ? 'Hide' : 'Show'} raw response
            </button>
          )}
        </div>
      </div>
    </Message>
  )
}

export { StructuredMessage }
import React from 'react'
import { StructuredResponse } from '../../types/structured-response'
import { Message, MessageProps } from './Message'

interface StructuredMessageProps extends Omit<MessageProps, 'children'> {
  structuredResponse: StructuredResponse
  rawText: string
  showRawResponse?: boolean
  onToggleRaw?: () => void
}

const StructuredMessage: React.FC<StructuredMessageProps> = ({
  structuredResponse,
  rawText,
  showRawResponse = false,
  onToggleRaw,
  ...messageProps
}) => {

  // Display raw AI response text directly without any structured formatting
  return (
    <Message {...messageProps}>
      <div className="whitespace-pre-wrap">
        {rawText}
      </div>
    </Message>
  )
}

export { StructuredMessage }
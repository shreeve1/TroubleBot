import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const messageVariants = cva(
  'message-bubble',
  {
    variants: {
      variant: {
        user: 'message-user',
        assistant: 'message-assistant',
        system: 'bg-warning-100 text-warning-800 mx-auto text-center',
      },
    },
    defaultVariants: {
      variant: 'user',
    },
  }
)

export interface MessageProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof messageVariants> {
  timestamp?: Date
  showTimestamp?: boolean
  author?: string
}

const Message = React.forwardRef<HTMLDivElement, MessageProps>(
  ({ className, variant, timestamp, showTimestamp = false, author, children, ...props }, ref) => {
    const formatTime = (date: Date) => {
      return new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }).format(date)
    }

    return (
      <div
        className={cn(
          'flex flex-col',
          variant === 'user' 
            ? 'items-end ml-8 sm:ml-12 lg:ml-16' 
            : variant === 'assistant' 
            ? 'items-start mr-8 sm:mr-12 lg:mr-16' 
            : 'items-center'
        )}
        ref={ref}
        {...props}
      >
        <div className={cn(messageVariants({ variant, className }))}>
          {children}
        </div>
        {showTimestamp && timestamp && (
          <span className="text-xs text-secondary-400 mt-1 px-2">
            {author && `${author} • `}
            {formatTime(timestamp)}
          </span>
        )}
      </div>
    )
  }
)

Message.displayName = 'Message'

export { Message, messageVariants }

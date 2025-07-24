import React, { useEffect, useRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const inputVariants = cva(
  'input',
  {
    variants: {
      variant: {
        default: '',
        error: 'input-error',
      },
      size: {
        sm: 'px-2 py-1 text-xs',
        default: 'px-3 py-2 text-sm',
        lg: 'px-4 py-3 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  error?: string
  label?: string
  helperText?: string
  multiline?: boolean
}

const Input = React.forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(
  ({ className, variant, size, error, label, helperText, id, type = 'text', multiline = true, ...props }, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`
    const hasError = error || variant === 'error'
    
    const shouldUseTextarea = multiline && (type === 'text' || !type)

    const autoResize = () => {
      const textarea = textareaRef.current
      if (textarea) {
        textarea.style.height = 'auto'
        textarea.style.height = Math.min(textarea.scrollHeight, 150) + 'px'
      }
    }

    useEffect(() => {
      if (shouldUseTextarea) {
        autoResize()
      }
    }, [props.value, shouldUseTextarea])

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        // Trigger form submission by finding parent form and dispatching submit event
        const form = e.currentTarget.closest('form')
        if (form) {
          form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))
        }
      }
      if (shouldUseTextarea) {
        (props.onKeyDown as unknown as ((e: React.KeyboardEvent<HTMLTextAreaElement>) => void))?.(e as React.KeyboardEvent<HTMLTextAreaElement>)
      } else {
        props.onKeyDown?.(e as unknown as React.KeyboardEvent<HTMLInputElement>)
      }
    }

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-secondary-700 mb-1"
          >
            {label}
          </label>
        )}
        {shouldUseTextarea ? (
          <textarea
            id={inputId}
            ref={textareaRef as React.RefObject<HTMLTextAreaElement>}
            className={cn(
              inputVariants({ 
                variant: hasError ? 'error' : variant, 
                size, 
                className 
              }),
              'resize-none overflow-y-auto min-h-[2.5rem] max-h-[150px]'
            )}
            onInput={autoResize}
            onKeyDown={handleKeyDown}
            {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <input
            id={inputId}
            type={type}
            className={cn(
              inputVariants({ 
                variant: hasError ? 'error' : variant, 
                size, 
                className 
              })
            )}
            ref={ref as React.RefObject<HTMLInputElement>}
            {...props}
          />
        )}
        {(error || helperText) && (
          <p
            className={cn(
              'mt-1 text-xs',
              hasError ? 'text-error-600' : 'text-secondary-500'
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input, inputVariants }

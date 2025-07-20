import React from 'react'
import { cn } from '../../lib/utils'

export interface LayoutProps {
  children: React.ReactNode
  className?: string
}

export const Layout: React.FC<LayoutProps> = ({ children, className }) => {
  return (
    <div className={cn('min-h-screen bg-secondary-50', className)}>
      {children}
    </div>
  )
}

export interface ContainerProps {
  children: React.ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

const containerSizes = {
  sm: 'max-w-2xl',
  md: 'max-w-4xl',
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
  full: 'max-w-none',
}

export const Container: React.FC<ContainerProps> = ({ 
  children, 
  className, 
  size = 'lg' 
}) => {
  return (
    <div className={cn('mx-auto px-4 sm:px-6 lg:px-8', containerSizes[size], className)}>
      {children}
    </div>
  )
}

export interface HeaderProps {
  children: React.ReactNode
  className?: string
  sticky?: boolean
}

export const Header: React.FC<HeaderProps> = ({ 
  children, 
  className, 
  sticky = false 
}) => {
  return (
    <header 
      className={cn(
        'bg-white border-b border-secondary-200 shadow-sm',
        sticky && 'sticky top-0 z-40',
        className
      )}
    >
      <Container>
        <div className="flex items-center justify-between h-16">
          {children}
        </div>
      </Container>
    </header>
  )
}

export interface MainProps {
  children: React.ReactNode
  className?: string
}

export const Main: React.FC<MainProps> = ({ children, className }) => {
  return (
    <main className={cn('flex-1 py-8', className)}>
      <Container>
        {children}
      </Container>
    </main>
  )
}

export interface FooterProps {
  children: React.ReactNode
  className?: string
}

export const Footer: React.FC<FooterProps> = ({ children, className }) => {
  return (
    <footer className={cn('bg-white border-t border-secondary-200 py-8', className)}>
      <Container>
        {children}
      </Container>
    </footer>
  )
}
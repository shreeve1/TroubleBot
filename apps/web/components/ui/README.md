# GuruTech UI Component Library

A modern, accessible UI component library built with React, TypeScript, and Tailwind CSS.

## Components

### Button

A versatile button component with multiple variants and states.

```tsx
import { Button } from '../components/ui'

// Basic usage
<Button>Click me</Button>

// With variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Delete</Button>

// With sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>

// With loading state
<Button loading>Processing...</Button>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
- `size`: 'sm' | 'default' | 'lg'
- `loading`: boolean
- All standard HTML button attributes

### Input

A styled input component with error states and labels.

```tsx
import { Input } from '../components/ui'

// Basic usage
<Input placeholder="Enter text..." />

// With label
<Input label="Email" type="email" />

// With error
<Input error="This field is required" />

// With helper text
<Input helperText="Enter your full name" />

// Different sizes
<Input size="sm" />
<Input size="default" />
<Input size="lg" />
```

**Props:**
- `variant`: 'default' | 'error'
- `size`: 'sm' | 'default' | 'lg'
- `error`: string
- `label`: string
- `helperText`: string
- All standard HTML input attributes

### Message

A chat message component for displaying user and assistant messages.

```tsx
import { Message } from '../components/ui'

// User message
<Message variant="user" timestamp={new Date()} showTimestamp>
  Hello, I need help with my computer.
</Message>

// Assistant message
<Message variant="assistant" timestamp={new Date()} showTimestamp author="GuruTech">
  I'd be happy to help! What specific issue are you experiencing?
</Message>

// System message
<Message variant="system">
  Conversation started
</Message>
```

**Props:**
- `variant`: 'user' | 'assistant' | 'system'
- `timestamp`: Date
- `showTimestamp`: boolean
- `author`: string

### Modal

A modal dialog component built with Headless UI.

```tsx
import { Modal } from '../components/ui'

const [isOpen, setIsOpen] = useState(false)

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirm Action"
  description="Are you sure you want to proceed?"
  size="md"
>
  <div className="mt-4 flex space-x-3">
    <Button variant="outline" onClick={() => setIsOpen(false)}>
      Cancel
    </Button>
    <Button variant="destructive">
      Delete
    </Button>
  </div>
</Modal>
```

**Props:**
- `isOpen`: boolean
- `onClose`: () => void
- `title`: string (optional)
- `description`: string (optional)
- `size`: 'sm' | 'md' | 'lg' | 'xl' | 'full'
- `showCloseButton`: boolean
- `className`: string

### Layout Components

Layout components for structuring your application.

```tsx
import { Layout, Header, Main, Footer, Container } from '../components/ui'

<Layout>
  <Header sticky>
    <Container>
      <nav>Navigation content</nav>
    </Container>
  </Header>
  
  <Main>
    <Container size="lg">
      <h1>Page content</h1>
    </Container>
  </Main>
  
  <Footer>
    <Container>
      <p>Footer content</p>
    </Container>
  </Footer>
</Layout>
```

**Layout Props:**
- `children`: React.ReactNode
- `className`: string

**Container Props:**
- `size`: 'sm' | 'md' | 'lg' | 'xl' | 'full'
- `children`: React.ReactNode
- `className`: string

**Header Props:**
- `sticky`: boolean
- `children`: React.ReactNode
- `className`: string

## Design System

### Colors

The component library uses a comprehensive color palette:

- **Primary**: Blue tones for primary actions and branding
- **Secondary**: Gray tones for text and secondary elements
- **Success**: Green tones for positive states
- **Warning**: Yellow tones for warnings
- **Error**: Red tones for errors and destructive actions

### Typography

- **Font Family**: Inter for UI text, JetBrains Mono for code
- **Font Sizes**: xs, sm, base, lg, xl, 2xl, 3xl, 4xl, 5xl, 6xl
- **Font Weights**: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

### Spacing

Consistent spacing scale based on Tailwind's default spacing with custom additions:
- Standard: 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 56, 64
- Custom: 18 (4.5rem), 88 (22rem), 128 (32rem)

### Border Radius

- `rounded-lg`: 0.5rem (default for most components)
- `rounded-xl`: 0.75rem (cards, modals)
- `rounded-2xl`: 1rem (special elements)
- `rounded-4xl`: 2rem (custom large radius)

### Shadows

- `shadow-sm`: Subtle shadow for cards
- `shadow-md`: Medium shadow for hover states
- `shadow-xl`: Large shadow for modals
- `shadow-outline`: Focus ring shadow

## Accessibility

All components are built with accessibility in mind:

- Semantic HTML elements
- ARIA attributes where appropriate
- Keyboard navigation support
- Focus management
- Screen reader compatibility
- Color contrast compliance

## Responsive Design

The library follows a mobile-first approach:

- All components are responsive by default
- Touch-friendly interaction targets (minimum 44px)
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Flexible layouts that adapt to different screen sizes

## Development

### Adding New Components

1. Create the component in `components/ui/ComponentName.tsx`
2. Use the `cva` utility for variant management
3. Include proper TypeScript interfaces
4. Add to the main `index.ts` export file
5. Update this documentation

### Styling Guidelines

- Use Tailwind utility classes
- Leverage the `cn()` utility for conditional classes
- Follow the established color and spacing patterns
- Ensure responsive design
- Test accessibility features
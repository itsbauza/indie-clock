# Contributing to Indie Clock

Thank you for your interest in contributing to Indie Clock! This document provides guidelines and information for contributors.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Code Style](#code-style)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Feature Requests](#feature-requests)
- [Questions and Discussions](#questions-and-discussions)

## Getting Started

Before you start contributing, please:

1. **Read the README** - Make sure you understand the project structure and setup
2. **Check existing issues** - Look for existing issues or discussions about your idea
3. **Join the community** - Participate in discussions and help others

## Development Setup

### Prerequisites

- Node.js 18+
- Docker and Docker Compose
- Git

### Local Development

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/yourusername/indie-clock.git
   cd indie-clock
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start the development environment**
   ```bash
   # Start Docker services
   npm run docker:up
   
   # Setup database
   npm run db:generate
   npm run db:migrate
   npm run db:seed
   
   # Start development server
   npm run dev
   ```

## Code Style

### General Guidelines

- **TypeScript**: Use TypeScript for all new code
- **ESLint**: Follow the project's ESLint configuration
- **Prettier**: Use Prettier for code formatting
- **Comments**: Add comments for complex logic
- **Naming**: Use descriptive names for variables, functions, and files

### Security Guidelines

- **No Hardcoded Secrets**: Never commit passwords, API keys, or tokens to the repository
- **Environment Variables**: Use environment variables for all sensitive configuration
- **Secure Defaults**: Use empty strings or throw errors for missing required environment variables
- **Input Validation**: Validate all user inputs and API responses
- **Error Handling**: Don't expose sensitive information in error messages

### File Structure

```
src/
├── app/                 # Next.js app directory
│   ├── api/            # API routes
│   ├── auth/           # Authentication pages
│   ├── dashboard/      # Dashboard pages
│   └── device/         # Device management pages
├── components/         # Reusable React components
├── lib/               # Utility libraries and services
└── types/             # TypeScript type definitions
```

### Code Examples

#### React Components
```typescript
import { useState } from 'react'

interface ComponentProps {
  title: string
  onAction: () => void
}

export function MyComponent({ title, onAction }: ComponentProps) {
  const [state, setState] = useState(false)

  return (
    <div>
      <h1>{title}</h1>
      <button onClick={onAction}>Action</button>
    </div>
  )
}
```

#### API Routes
```typescript
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Your logic here
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Error message' },
      { status: 500 }
    )
  }
}
```

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Writing Tests

- Write tests for new features
- Ensure existing tests pass
- Use descriptive test names
- Test both success and error cases

### Test Examples

```typescript
import { render, screen } from '@testing-library/react'
import { MyComponent } from './MyComponent'

describe('MyComponent', () => {
  it('renders with title', () => {
    render(<MyComponent title="Test" onAction={() => {}} />)
    expect(screen.getByText('Test')).toBeInTheDocument()
  })

  it('calls onAction when button is clicked', () => {
    const mockAction = jest.fn()
    render(<MyComponent title="Test" onAction={mockAction} />)
    
    screen.getByRole('button').click()
    expect(mockAction).toHaveBeenCalled()
  })
})
```

## Pull Request Process

### Before Submitting

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow the code style guidelines
   - Add tests for new functionality
   - Update documentation if needed

3. **Test your changes**
   ```bash
   npm run lint
   npm test
   npm run build
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```

### Commit Message Format

Use conventional commits format:

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

### Pull Request Guidelines

1. **Title**: Use a clear, descriptive title
2. **Description**: Explain what the PR does and why
3. **Related Issues**: Link to any related issues
4. **Screenshots**: Include screenshots for UI changes
5. **Testing**: Describe how you tested the changes

### Example Pull Request

```markdown
## Description
Adds a new notification system for GitHub contribution updates.

## Changes
- Added notification component
- Integrated with existing GitHub sync
- Added user preferences for notifications

## Testing
- [x] Unit tests pass
- [x] Manual testing completed
- [x] No breaking changes

## Screenshots
[Include screenshots if applicable]

Closes #123
```

## Reporting Bugs

### Before Reporting

1. **Check existing issues** - Search for similar issues
2. **Reproduce the bug** - Make sure you can consistently reproduce it
3. **Check the logs** - Look for error messages

### Bug Report Template

```markdown
## Bug Description
Brief description of the bug

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected Behavior
What you expected to happen

## Actual Behavior
What actually happened

## Environment
- OS: [e.g. macOS, Windows, Linux]
- Browser: [e.g. Chrome, Firefox, Safari]
- Version: [e.g. 1.0.0]

## Additional Information
Any other context, logs, or screenshots
```

## Feature Requests

### Before Requesting

1. **Check existing issues** - Look for similar feature requests
2. **Think about implementation** - Consider the technical feasibility
3. **Consider the scope** - Make sure it fits the project's goals

### Feature Request Template

```markdown
## Feature Description
Brief description of the feature

## Problem Statement
What problem does this feature solve?

## Proposed Solution
How would you like to see this implemented?

## Alternative Solutions
Any alternative approaches you've considered?

## Additional Context
Any other relevant information
```

## Questions and Discussions

### Getting Help

1. **Check the documentation** - Start with the README
2. **Search existing issues** - Look for similar questions
3. **Ask in discussions** - Use GitHub Discussions for general questions
4. **Be specific** - Provide details about your setup and issue

### Helping Others

- **Be patient** - Remember that contributors are volunteers
- **Be helpful** - Provide constructive feedback
- **Be respectful** - Follow the Code of Conduct

## Recognition

Contributors will be recognized in the following ways:

- **Contributors list** - Added to the project's contributors
- **Release notes** - Mentioned in release notes for significant contributions
- **Documentation** - Credit in relevant documentation

## Questions?

If you have questions about contributing, feel free to:

1. Open a discussion on GitHub
2. Ask in an issue
3. Contact the maintainers directly

Thank you for contributing to Indie Clock! 🚀 
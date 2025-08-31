# vite-react-spa

This is a seed project for React Single Page Apps (SPA).

## Local Development Workflow

### Quick Start

To get started with local development, you need to start the required services and then run the development environment:

1. **Start the development environment:**
   ```bash
   make develop
   ```

The application will be available at [http://localhost:3000](http://localhost:3000).

### Environment Configuration

The application uses environment-specific configurations located in `src/config/`:
- `config.dev1.json` - Development environment
- `config.qa1.json` - QA environment  
- `config.qa2.json` - QA2 environment
- `config.sandbox1.json` - Sandbox environment

### Corporate Network Setup (Optional)

If you're building behind a corporate proxy (like Zscaler), you may need to add your corporate CA certificate:

1. Obtain your corporate CA certificate (In Mac toolchain)
2. Save it as `zscaler.pem` in the project root directory
3. Build normally - the Docker build will automatically include the certificate if present

Note: The `zscaler.pem` file is optional and ignored by git. The build will work fine without it for developers outside the corporate network.

## Available Scripts

### Make Commands

The Makefile includes several commands to help manage the project:

- `make develop` - Start development environment with Docker
- `make build` - Build the application
- `make test` - Run tests
- `make shell` - Start bash session in Node container
- `make deploy` - Deploy infrastructure with Terraform

To see all available commands with descriptions:
```bash
make help
```

### NPM Scripts

In addition to the Make commands, you can use these NPM scripts:

- `npm run dev` - Start development server
- `npm run build` - Build the application for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview the production build
- `npm run test` - Run tests with Vitest
- `npm run test:watch` - Run tests in watch mode
- `npm run test:ui` - Run tests with Vitest UI

## Testing

The application uses **Vitest** and **React Testing Library** for unit testing. Tests are configured to run in a jsdom environment with global test utilities available.

### Running Tests

```bash
# Run all tests once
npm run test

# Run tests in watch mode (automatically re-runs on file changes)
npm run test:watch

# Run tests with UI interface
npm run test:ui

# Run tests using Make command
make test
```

### Test Configuration

- **Testing Framework**: Vitest
- **React Testing**: React Testing Library
- **DOM Environment**: jsdom
- **Test Setup**: `src/test-setup.js` (includes jest-dom matchers)

### Writing Tests

Tests should be placed alongside their source files with the `.test.jsx` or `.test.js` extension. The test setup includes:

- Global test utilities from Vitest
- React Testing Library utilities
- jest-dom matchers for enhanced DOM assertions
- Automatic mocking capabilities

Example test structure:
```javascript
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import MyComponent from './MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })
})
```


## Deployment

The application includes Terraform infrastructure for AWS deployment:

### Terraform State

Terraform state is stored in an S3 backend. The root modules are independent and have their own state files grouped under a namespace configured by the `TF_STATE_PROJECT_KEY` in the Makefile. Here's a sample representation of the states in S3:

```
TF_STATE_BUCKET/
├── applications/
│   └── apps.vite-react-spa/
│       ├── dev1/
│       │   └── base_infra/
│       │       └── terraform.tfstate
│       ├── qa1/
│       │   └── base_infra/
│       │       └── terraform.tfstate
│       └── sandbox/
│           └── base_infra/
│               └── terraform.tfstate
```

### Local Backend

You can deploy this module locally by configuring the `TF_STATE_BUCKET` to point to the sandbox account or by overriding the backend to a local backend to isolate your state from peer deployments to sandbox. To override the remote backend configuration, create an `override.tf` file in the root of the module you are targeting for deployment (e.g., `terraform/modules/base_infra/override.tf`). This file will contain the backend configuration you want to override:

```terraform
terraform {
  backend "local" {
    path = "terraform.tfstate"
  }
}
```

By using `override.tf`, you can customize the backend configuration without modifying the main configuration files, making it easier to manage different states for local deployments. Please only use this if you plan on running a `terraform destroy` to prevent orphaned resources from polluting your account.

## Stopping Services

When you're done developing:

1. Stop the development environment: `Ctrl+C` in the terminal running `make develop`
2. Stop services: `make stop` (if available) or manually stop Docker containers

## Learn More

- [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started)
- [React documentation](https://reactjs.org/)
- [Auth0 React SDK documentation](https://auth0.com/docs/quickstart/spa/react)
- [Semantic UI React documentation](https://react.semantic-ui.com/)

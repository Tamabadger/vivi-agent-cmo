# 🤝 Contributing to ViVi CMO Agent

Thank you for your interest in contributing to ViVi! This document provides guidelines and information for contributors.

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js 20+
- pnpm 8+
- Docker & Docker Compose
- Git

### **Setup Development Environment**
```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/vivi-cmo-agent.git
cd vivi-cmo-agent

# Install dependencies
pnpm install

# Start infrastructure services
docker-compose up -d

# Setup environment
cp apps/api/.env.example apps/api/.env
# Edit .env with your configuration

# Setup database
pnpm db:migrate
pnpm db:seed

# Start development server
pnpm dev
```

## 📋 **Contribution Guidelines**

### **Code Style**
- **TypeScript**: Use strict mode and proper typing
- **Formatting**: Prettier for code formatting
- **Linting**: ESLint for code quality
- **Naming**: Use descriptive names and follow conventions

### **Commit Messages**
Follow conventional commit format:
```
type(scope): description

[optional body]

[optional footer]
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples**:
```
feat(router): add cost optimization to LLM routing
fix(media): resolve image processing memory leak
docs(api): update authentication documentation
```

### **Pull Request Process**
1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Make** your changes with proper tests
4. **Commit** your changes: `git commit -m 'feat: add amazing feature'`
5. **Push** to your fork: `git push origin feature/amazing-feature`
6. **Create** a Pull Request with clear description

### **Testing Requirements**
- **Unit Tests**: Required for all new features
- **Integration Tests**: Required for API changes
- **Test Coverage**: Maintain >80% coverage
- **Performance Tests**: For critical path changes

## 🏗️ **Project Structure**

### **Apps**
- **`apps/api/`**: Main Express.js API server
  - `src/routes/`: API endpoints
  - `src/middleware/`: Request processing
  - `src/db/`: Database operations
  - `src/jobs/`: Background job processing

### **Packages**
- **`packages/common/`**: Shared types and utilities
- **`packages/router/`**: LLM routing and cost tracking
- **`packages/media/`**: Media processing pipeline
- **`packages/vision/`**: Vision analysis engine
- **`packages/voice/`**: Voice processing engine
- **`packages/entitlements/`**: Feature gating system

### **Infrastructure**
- **`docker-compose.yml`**: Development services
- **Database**: PostgreSQL with pgvector
- **Cache**: Redis for sessions and queues
- **Storage**: MinIO for S3-compatible storage

## 🔧 **Development Workflow**

### **Package Development**
```bash
# Work on a specific package
cd packages/router
pnpm dev

# Build package
pnpm build

# Test package
pnpm test
```

### **API Development**
```bash
# Start API server
cd apps/api
pnpm dev

# Run tests
pnpm test:unit
pnpm test:integration

# Database operations
pnpm db:migrate
pnpm db:seed
```

### **Docker Services**
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🧪 **Testing**

### **Running Tests**
```bash
# All tests
pnpm test

# Unit tests only
pnpm test:unit

# Integration tests only
pnpm test:integration

# Specific package tests
pnpm --filter router test
```

### **Test Structure**
- **Unit Tests**: Test individual functions and classes
- **Integration Tests**: Test API endpoints and database operations
- **Contract Tests**: Test service interfaces
- **Performance Tests**: Load and stress testing

### **Writing Tests**
```typescript
import { describe, it, expect } from '@jest/globals';
import { LLMRouter } from '../src/llm-router';

describe('LLMRouter', () => {
  it('should route to cost-effective model', async () => {
    const router = new LLMRouter(/* config */);
    const model = await router.routeRequest(/* constraints */);
    
    expect(model.costPer1kInput).toBeLessThan(0.01);
  });
});
```

## 📚 **Documentation**

### **Required Documentation**
- **README.md**: Project overview and setup
- **API Documentation**: OpenAPI specification
- **Code Comments**: Inline documentation for complex logic
- **Architecture Docs**: System design and decisions

### **Documentation Standards**
- Use clear, concise language
- Include code examples
- Keep documentation up-to-date
- Use proper markdown formatting

## 🐛 **Bug Reports**

### **Bug Report Template**
```markdown
**Bug Description**
Clear description of the issue

**Steps to Reproduce**
1. Step 1
2. Step 2
3. Step 3

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Environment**
- OS: [e.g., macOS 12.0]
- Node.js: [e.g., 20.0.0]
- pnpm: [e.g., 8.0.0]

**Additional Context**
Any other relevant information
```

## 💡 **Feature Requests**

### **Feature Request Template**
```markdown
**Feature Description**
Clear description of the requested feature

**Use Case**
Why this feature is needed

**Proposed Solution**
How you think it should work

**Alternatives Considered**
Other approaches you've considered

**Additional Context**
Any other relevant information
```

## 🔒 **Security**

### **Security Guidelines**
- **Never commit** sensitive information
- **Report security issues** privately to maintainers
- **Follow security best practices** in code
- **Validate all inputs** and sanitize outputs

### **Reporting Security Issues**
- **DO NOT** create public issues for security problems
- **Email** security@vivi.ai (if available)
- **Use** GitHub Security Advisories
- **Provide** detailed reproduction steps

## 📊 **Performance**

### **Performance Guidelines**
- **Profile** code before optimization
- **Measure** impact of changes
- **Consider** memory usage and CPU time
- **Test** with realistic data volumes

### **Performance Testing**
```bash
# Run performance tests
pnpm test:performance

# Load testing
pnpm test:load

# Memory profiling
node --inspect-brk apps/api/src/index.ts
```

## 🌟 **Recognition**

### **Contributor Recognition**
- **Contributors** listed in README.md
- **Commit history** preserved in Git
- **Pull request** acknowledgments
- **Community** appreciation

### **Contributor Levels**
- **Contributor**: First successful PR
- **Regular Contributor**: Multiple quality contributions
- **Maintainer**: Consistent contributions and community help
- **Core Maintainer**: Project leadership and architecture decisions

## 📞 **Getting Help**

### **Communication Channels**
- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: Questions and community help
- **Pull Requests**: Code review and feedback
- **Documentation**: Self-service help

### **Community Guidelines**
- **Be respectful** and inclusive
- **Help others** when possible
- **Provide constructive** feedback
- **Follow** project conventions

## 🚀 **Next Steps**

1. **Read** the project documentation
2. **Set up** your development environment
3. **Find** an issue to work on
4. **Join** the community discussions
5. **Start** contributing!

---

**Thank you for contributing to ViVi! 🎉**

*Together we can transform social media management through AI-powered automation*

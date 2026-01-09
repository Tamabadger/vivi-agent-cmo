#!/bin/bash

# 🚀 ViVi CMO Agent - GitHub Push Script
# This script helps you push your local repository to GitHub

echo "🚀 ViVi CMO Agent - GitHub Repository Setup"
echo "=============================================="
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not initialized. Please run 'git init' first."
    exit 1
fi

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 Current branch: $CURRENT_BRANCH"

# Check if we have commits
if ! git rev-parse HEAD >/dev/null 2>&1; then
    echo "❌ No commits found. Please make your first commit first."
    exit 1
fi

echo ""
echo "📋 Repository Status:"
git status --short

echo ""
echo "🔗 To push to GitHub, follow these steps:"
echo ""

echo "1️⃣  Create a new repository on GitHub:"
echo "   • Go to https://github.com/new"
echo "   • Repository name: vivi-cmo-agent"
echo "   • Description: AI-Powered Social Media Management Platform"
echo "   • Choose Public or Private"
echo "   • DON'T initialize with README (we already have one)"
echo ""

echo "2️⃣  Add your GitHub repository as remote origin:"
echo "   git remote add origin https://github.com/YOUR_USERNAME/vivi-cmo-agent.git"
echo ""

echo "3️⃣  Push to GitHub:"
echo "   git push -u origin $CURRENT_BRANCH"
echo ""

echo "4️⃣  Alternative: Use GitHub CLI (if installed):"
echo "   gh repo create vivi-cmo-agent --public --description 'AI-Powered Social Media Management Platform' --source=. --remote=origin --push"
echo ""

echo "📚 Repository includes:"
echo "   ✅ Complete ViVi CMO Agent codebase"
echo "   ✅ Comprehensive documentation"
echo "   ✅ AI engines and capabilities"
echo "   ✅ Development setup guides"
echo "   ✅ Contributing guidelines"
echo "   ✅ MIT License"
echo ""

echo "🎯 Recommended GitHub repository topics:"
echo "   ai, social-media, marketing-automation, typescript, nodejs, postgresql, redis, docker, openai, vector-search"
echo ""

echo "🔒 Security notes:"
echo "   ✅ .gitignore configured to exclude sensitive files"
echo "   ✅ Environment variables not committed"
echo "   ✅ No API keys or secrets in code"
echo ""

echo "📖 Documentation included:"
echo "   📄 README.md - Project overview and setup"
echo "   📄 ENGINES_AND_CAPABILITIES.md - Detailed engine documentation"
echo "   📄 CONTRIBUTING.md - Contribution guidelines"
echo "   📄 GITHUB_SETUP.md - GitHub setup guide"
echo "   📄 LICENSE - MIT License"
echo ""

echo "🚀 Ready to push to GitHub! Follow the steps above."
echo ""

# Check if remote origin is already set
if git remote get-url origin >/dev/null 2>&1; then
    REMOTE_URL=$(git remote get-url origin)
    echo "ℹ️  Remote origin already set to: $REMOTE_URL"
    echo ""
    echo "To push to this remote:"
    echo "   git push -u origin $CURRENT_BRANCH"
else
    echo "ℹ️  No remote origin set yet. Follow step 2 above."
fi

echo ""
echo "🎉 Happy coding with ViVi CMO Agent!"

#!/bin/bash

# Setup Environment Files Script
# This script creates .env files from the example templates

echo "🚀 Setting up environment files..."

# Copy environment files
if [ -f "env.example" ]; then
    cp env.example .env
    echo "✅ Created root .env file"
else
    echo "❌ env.example not found"
fi

if [ -f "client/env.example" ]; then
    cp client/env.example client/.env
    echo "✅ Created client/.env file"
else
    echo "❌ client/env.example not found"
fi

if [ -f "server/env.example" ]; then
    cp server/env.example server/.env
    echo "✅ Created server/.env file"
else
    echo "❌ server/env.example not found"
fi

echo ""
echo "🎉 Environment setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Review the .env files and update values if needed"
echo "2. Run 'npm run install-all' to install dependencies"
echo "3. Run 'npm run dev' to start the application"
echo ""
echo "⚠️  Remember: Never commit .env files to version control!"

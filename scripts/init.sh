#!/bin/bash
echo "Setting up the project..."

# Install frontend dependencies
cd frontend || exit
echo "Installing frontend dependencies..."
npm install

# Back to root
cd ..

# Copy .env.example to .env if it doesn't exist
if [ ! -f .env ]; then
  echo "Creating .env from .env.example..."
  cp .env.example .env
else
  echo ".env already exists. Skipping copy."
fi

echo "Setup complete."

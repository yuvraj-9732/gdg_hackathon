#!/bin/bash

# A script to start both the frontend and backend servers concurrently.

echo "Starting Bhrashtachar Mukt application..."

# Function to clean up background processes on exit
cleanup() {
    echo -e "\nShutting down services..."
    # Kills all child processes of this script
    pkill -P $$
    echo "Done."
}

# Trap script exit (e.g., Ctrl+C) and call the cleanup function
trap cleanup EXIT

# Start Frontend in the background
echo "Starting Frontend server..."
(cd frontend && npm start) &

# Start Backend in the foreground
echo "Starting Backend server..."
(cd backend && npm start)
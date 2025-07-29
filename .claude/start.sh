#!/bin/bash

# Start script for TIME app
# This script starts the Next.js development server and logs output

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get the project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_FILE="$PROJECT_ROOT/server.log"
PID_FILE="$PROJECT_ROOT/.claude/server.pid"

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}Cleaning up...${NC}"
    if [ -f "$PID_FILE" ]; then
        rm -f "$PID_FILE"
    fi
}

# Set trap for cleanup
trap cleanup EXIT

# Change to project directory
cd "$PROJECT_ROOT"

echo -e "${GREEN}Starting TIME App Development Server...${NC}"
echo -e "${YELLOW}Project directory: $PROJECT_ROOT${NC}"
echo -e "${YELLOW}Logging to: $LOG_FILE${NC}"

# Check if bun is available
if ! command -v bun &> /dev/null; then
    echo -e "${RED}Error: bun is not installed or not in PATH${NC}"
    exit 1
fi

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: package.json not found. Are you in the right directory?${NC}"
    exit 1
fi

# Check if another server is already running
if [ -f "$PID_FILE" ]; then
    OLD_PID=$(cat "$PID_FILE")
    if ps -p "$OLD_PID" > /dev/null 2>&1; then
        echo -e "${RED}Error: Server is already running (PID: $OLD_PID)${NC}"
        echo -e "${YELLOW}Use .claude/stop.sh to stop the existing server first${NC}"
        exit 1
    else
        # Remove stale PID file
        rm -f "$PID_FILE"
    fi
fi

# Start the development server in background
echo -e "${GREEN}Starting bun dev...${NC}"
echo "$(date): Starting TIME App Development Server" > "$LOG_FILE"

# Start bun dev and capture its PID
bun dev >> "$LOG_FILE" 2>&1 &
SERVER_PID=$!

# Save PID to file
echo "$SERVER_PID" > "$PID_FILE"

echo -e "${GREEN}Server started successfully!${NC}"
echo -e "${YELLOW}PID: $SERVER_PID${NC}"
echo -e "${YELLOW}Log file: $LOG_FILE${NC}"
echo -e "${YELLOW}Server should be available at: http://localhost:3000${NC}"
echo ""
echo -e "${GREEN}To stop the server, run: .claude/stop.sh${NC}"
echo -e "${GREEN}To view logs in real-time, run: tail -f server.log${NC}"

# Wait for a moment to check if the server started successfully
sleep 3

if ps -p "$SERVER_PID" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Server is running successfully${NC}"
    
    # Show the last few lines of the log
    echo -e "\n${YELLOW}Recent log output:${NC}"
    tail -n 5 "$LOG_FILE" 2>/dev/null || echo "No log output yet..."
    
    # Keep the script running to show real-time logs (optional)
    if [ "${1:-}" = "--follow" ] || [ "${1:-}" = "-f" ]; then
        echo -e "\n${YELLOW}Following logs (Ctrl+C to stop following, server will continue running):${NC}"
        tail -f "$LOG_FILE"
    fi
else
    echo -e "${RED}✗ Server failed to start. Check the log file for errors:${NC}"
    cat "$LOG_FILE"
    rm -f "$PID_FILE"
    exit 1
fi
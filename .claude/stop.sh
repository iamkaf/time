#!/bin/bash

# Stop script for TIME app
# This script stops the Next.js development server and cleans up processes

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get the project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PID_FILE="$PROJECT_ROOT/.claude/server.pid"
LOG_FILE="$PROJECT_ROOT/server.log"

echo -e "${GREEN}Stopping TIME App Development Server...${NC}"

# Function to kill process tree
kill_process_tree() {
    local pid=$1
    local children=$(pgrep -P "$pid" 2>/dev/null || true)
    
    for child in $children; do
        kill_process_tree "$child"
    done
    
    if ps -p "$pid" > /dev/null 2>&1; then
        echo -e "${YELLOW}Stopping process $pid...${NC}"
        kill "$pid" 2>/dev/null || true
        
        # Wait up to 5 seconds for graceful shutdown
        for i in {1..5}; do
            if ! ps -p "$pid" > /dev/null 2>&1; then
                break
            fi
            sleep 1
        done
        
        # Force kill if still running
        if ps -p "$pid" > /dev/null 2>&1; then
            echo -e "${YELLOW}Force killing process $pid...${NC}"
            kill -9 "$pid" 2>/dev/null || true
        fi
    fi
}

# Function to find and kill orphaned Next.js/Node processes
cleanup_orphans() {
    echo -e "${YELLOW}Checking for orphaned processes...${NC}"
    
    # Find Next.js development server processes
    local nextjs_pids=$(pgrep -f "next.*dev" 2>/dev/null || true)
    local node_pids=$(pgrep -f "node.*next" 2>/dev/null || true)
    local bun_pids=$(pgrep -f "bun.*dev" 2>/dev/null || true)
    
    local all_pids="$nextjs_pids $node_pids $bun_pids"
    
    if [ -n "$all_pids" ]; then
        echo -e "${YELLOW}Found potential orphaned processes: $all_pids${NC}"
        for pid in $all_pids; do
            if [ -n "$pid" ] && ps -p "$pid" > /dev/null 2>&1; then
                echo -e "${YELLOW}Cleaning up orphaned process $pid...${NC}"
                kill_process_tree "$pid"
            fi
        done
    else
        echo -e "${GREEN}No orphaned processes found${NC}"
    fi
}

# Check if PID file exists
if [ -f "$PID_FILE" ]; then
    SERVER_PID=$(cat "$PID_FILE")
    echo -e "${YELLOW}Found PID file with PID: $SERVER_PID${NC}"
    
    if ps -p "$SERVER_PID" > /dev/null 2>&1; then
        echo -e "${YELLOW}Stopping server process and its children...${NC}"
        kill_process_tree "$SERVER_PID"
        echo -e "${GREEN}✓ Server process stopped${NC}"
    else
        echo -e "${YELLOW}Process $SERVER_PID is not running${NC}"
    fi
    
    # Remove PID file
    rm -f "$PID_FILE"
    echo -e "${GREEN}✓ PID file removed${NC}"
else
    echo -e "${YELLOW}No PID file found${NC}"
fi

# Always check for orphaned processes
cleanup_orphans

# Check if any processes are still running on port 3000
echo -e "${YELLOW}Checking for processes on port 3000...${NC}"
port_pids=$(lsof -ti:3000 2>/dev/null || true)
if [ -n "$port_pids" ]; then
    echo -e "${YELLOW}Found processes on port 3000: $port_pids${NC}"
    for pid in $port_pids; do
        if [ -n "$pid" ] && ps -p "$pid" > /dev/null 2>&1; then
            echo -e "${YELLOW}Killing process $pid on port 3000...${NC}"
            kill -9 "$pid" 2>/dev/null || true
        fi
    done
    echo -e "${GREEN}✓ Port 3000 cleaned up${NC}"
else
    echo -e "${GREEN}✓ Port 3000 is free${NC}"
fi

# Log the shutdown
if [ -f "$LOG_FILE" ]; then
    echo "$(date): Server stopped by stop.sh script" >> "$LOG_FILE"
fi

echo -e "${GREEN}✓ TIME App Development Server stopped successfully${NC}"
echo -e "${YELLOW}To start the server again, run: .claude/start.sh${NC}"

# Show final status
echo -e "\n${GREEN}Final cleanup status:${NC}"
echo -e "  - PID file: $([ -f "$PID_FILE" ] && echo "exists" || echo "removed")"
echo -e "  - Port 3000: $(lsof -ti:3000 2>/dev/null > /dev/null && echo "occupied" || echo "free")"
echo -e "  - Active Next.js processes: $(pgrep -f "next.*dev\|bun.*dev" 2>/dev/null | wc -l | tr -d ' ')"
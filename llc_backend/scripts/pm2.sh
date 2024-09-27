#!/bin/bash

log_file="pm2_logs_$1.txt"

# Run the command 'lxc exec $1 -- pm2 logs' and capture the output in the background
lxc exec $1 -- pm2 logs > "$log_file" 2>&1 &  # Redirect stderr to stdout

# Capture the process ID of the command
PM2_LOGS_PID=$!

# Wait for a specified time (e.g., 3 seconds) to capture logs, you can modify the time
sleep 3

# After the wait, kill the process to stop capturing logs
kill $PM2_LOGS_PID

# Check if the command was terminated successfully
if [ $? -eq 0 ]; then
  echo "pm2 logs from $1 stopped successfully. Logs saved to $log_file."
else
  echo "Failed to stop pm2 logs."
fi

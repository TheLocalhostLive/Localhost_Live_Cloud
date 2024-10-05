
#!/bin/sh

# Launch the container
lxc launch images:alpine/3.20 "$1" --storage mypool --network mynetwork

# Run a command to update the repositories and install ttyd
lxc exec "$1" -- sh -c "
    apk update || {
        echo 'First update failed, retrying...';
        sleep 5;  # Optional: Wait before retrying
        apk update
    } &&
    apk add ttyd || {
        echo 'Failed to install ttyd. Attempting again...';
        sleep 5;  # Optional: Wait before retrying
        apk update && apk add ttyd
    }
"

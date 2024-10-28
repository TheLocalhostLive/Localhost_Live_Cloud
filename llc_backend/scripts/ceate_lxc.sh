
#!/bin/sh

# Launch the container
sudo incus launch images:alpine/3.20 "$1" --storage server-storage --network server-network 

# Run a command to update the repositories and install ttyd
sudo incus exec "$1" -- sh -c "
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

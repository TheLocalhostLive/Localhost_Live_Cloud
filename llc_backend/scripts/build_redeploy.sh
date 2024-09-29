echo "Launching virtual Machine...\n"
lxc exec $1 -- /bin/sh -c "
    echo 'Inside the container now...';
    echo 'Attempting to change directory to: $2';
    cd $2 || { echo 'Failed to change directory to $2'; exit 1; }

    echo 'Changed to directory: $(pwd)';
    echo 'Checking Git remote configuration...';
    git remote -v;

    echo 'Pulling from GitHub...';
    git pull origin main 2>&1;

    echo 'Checking if npm run dev process is running...';
    ps -e -o pid,comm | grep 'npm run dev';
    
    echo 'Killing the npm process...';
    ps -e -o pid,comm | grep 'npm run dev' | awk '{print \$1}' | xargs kill -9;

    echo 'Restarting npm run dev...';
    nohup npm run dev > /dev/null 2>&1 &
"

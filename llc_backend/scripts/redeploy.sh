cd $1
echo "Pulling from github\n"
git pull origin main

echo "Restarting your Application\n"
ps -e -o pid,comm | grep "npm run dev" | awk '{print $1}' | xargs kill -9
nohup npm run dev > /dev/null 2>&1 &

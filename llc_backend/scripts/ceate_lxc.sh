
lxc launch images:alpine/3.20 $1 --storage mypool --network mynetwork
lxc exec $1 -- apk add ttyd bash
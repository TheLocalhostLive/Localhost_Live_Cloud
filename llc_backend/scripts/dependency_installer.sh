lxc exec $1 -- /bin/sh #enter into the container
apk add node
apk add npm
apk add $2 # install rust if it is a rust app

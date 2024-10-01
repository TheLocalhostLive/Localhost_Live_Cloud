nohup lxc exec $1 -- /bin/sh -c "exec ttyd --writable sh" 1&

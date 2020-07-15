#!/bin/sh

# export DISPLAY=:0
export DISPLAY=:1.0
# export DISPLAY=desktop:0
# Wanted trigger timeout in milliseconds.
IDLE_TIME=$((5*60*1000))

# Sequence to execute when timeout triggers.
trigger_cmd() {
    gnome-screenshot -f /tmp/glslScreenSaver.png  
    glslViewer /home/$USER/.glslScreenSaver/shader.frag -e cursor,off -ss /tmp/glslScreenSaver.png
}

sleep_time=$IDLE_TIME
triggered=false

# ceil() instead of floor()
while sleep $(((sleep_time+999)/1000)); do
    idle=$(xprintidle)
    if [ $idle -ge $IDLE_TIME ]; then
        if ! $triggered; then
            trigger_cmd
            triggered=true
            sleep_time=$IDLE_TIME
        fi
    else
        triggered=false
        # Give 100 ms buffer to avoid frantic loops shortly before triggers.
        sleep_time=$((IDLE_TIME-idle+100))
    fi
done
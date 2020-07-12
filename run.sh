#!/bin/sh

gnome-screenshot -f /tmp/glslScreenSaver.png  
glslViewer /home/$USER/.glslScreenSaver/shader.frag -e cursor,off -ss /tmp/glslScreenSaver.png 
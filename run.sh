#!/bin/sh

gnome-screenshot -f /tmp/glslScreenSaver.png  
glslViewer /home/$USER/.glslScreenSaver/shader.frag /tmp/glslScreenSaver.png -e cursor,off -f -ss 
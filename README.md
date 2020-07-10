Make your own ScreenSaver using GlslViewer

## Install

1. Install [GlslViewer](https://github.com/patriciogonzalezvivo/glslViewer/wiki/Compiling-GlslViewer)

2. Install XScreenSaver and Xprintidle:
```bash 
sudo apt install xscreensaver xprintidle
```

3. Clone this repo in your user folder. It will be clone in `.glslScreenSaver` so you will not see it
```bash 
cd 
git clone https://github.com/patriciogonzalezvivo/.glslScreensaver.git
```

4. Run `gnome-session-properties`, Click on `Add` and then fill the following data

```
Name:    GlslScreenSaver
Command: /home/[your_user]/.glslScreenSaver/init.sh
```

Should look like this
![](imgs/00.png)


## Edit

To edit you shader you can use any text editor together with glslViewer

```bash
glslViewer ~/.glslScreenSaver/ikeda.

```
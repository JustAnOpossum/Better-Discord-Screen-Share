# Better Discord Screen Sharing

This is a plugin and server for the plugin for Better Discord that lets you share your screen.

DISCLAMER: This is untested on OSX but the paths are set up correctly for OSX.

[![Picture.png](https://s11.postimg.org/4oq3juv4j/Picture.png)](https://postimg.org/image/apnsgxhqn/)

# Usage

Click the screenshare button in the top right corner to start and stop the screen share. The video will appear in the chat and only in the one that it was started in.

# Known Bugs

1. Sometimes the video will be blank, There is no way I can fix this since the problem is with the media server.

2. The media server has a memory leak, so every time that the screen share stops it will restart kurento. That's why there is a sudo password environment variable.

3. When you use the installer Nginx might not start so you have to restart Nginx.

# Automatic Installer

## Before you start

Make sure you are on Ubuntu 14 or 16.04 since this will not work with any other version of linux or ubuntu. This program is made to run on a server thats not on your network. So it might not work if your running this on a computer in your network.

## Installer

Run my automatic installer to install the dependencies, set up nginx, and generate a certificate. If there are any errors please contact me at support@nerdfox.me or open an issue.

1. Run the command below and substitute the variables with the information.
2. When it generates the certificate, follow the prompts.
3. use "sudo systemctl [start, stop, restart] screenshare" to control the server.
4. Go into the html folder and move ScreenShare.plugin.js to your better discord folder. [Plugin Installer Here](https://github.com/Bluscream/BetterDiscord/releases/download/3/BetterDiscord.Setup.exe)

`sudo ./install.sh domain botToken chatID admins sudoPassword httpPassword user group`

domain: The domain name of the server, if you dont have one use [DuckDNS](https://www.duckdns.org/)

botToken: This is the token for the discord bot

ChatID: This is the ID for the chat the bot will be in. To get it [follow this tutorial.](https://support.discordapp.com/hc/en-us/articles/206346498-Where-can-I-find-my-server-ID-)

admins: A list of users, without spaces that can control the screen sharing in addition to the person who is sharing.

sudoPassword: This is the password for your user account on your server, I need this to run the script that restarts Kurento.

httpPassword: This is the password for the http authentication.

user: User the server will run as

group: Group the server will run as.

## After

To change any of these variable re-run the installer.

# Manual Install

See [Manual Install](MANUAL.md) if you want to manually install the server.

# Upcoming Features

- [x] Better Autoupdate
- [x] Disconnect detection
- [ ] Webcam Support

# Libraries Used

* [Better Discord](https://github.com/Jiiks/BetterDiscordApp)
* [DiscordIO](https://github.com/izy521/discord.io)
* [Bluebird](https://github.com/petkaantonov/bluebird)
* [Primus](https://github.com/primus/primus)
* [kurento-client](https://github.com/Kurento/kurento-client-js)
* [kurento-utils](https://github.com/Kurento/kurento-utils-js)
* [adapter.js](https://github.com/webrtc/adapter)

# Problems

If there are any problems please open a issue so I can fix it.

# Licence

MIT License

Copyright (c) 2017 ConnorTheFox

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

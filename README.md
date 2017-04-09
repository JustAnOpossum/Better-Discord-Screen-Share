# Better Discord Screen Sharing

This is a plugin and server for the plugin for Better Discord that lets you share your screen. It needs ubuntu for the server.

DISCLAMER: This is untested on OSX but the paths are set up correctly for OSX.

[![Picture.png](https://s11.postimg.org/4oq3juv4j/Picture.png)](https://postimg.org/image/apnsgxhqn/)

# Usage

Click the screenshare button in the top right corner to start and stop the screen share. The video will appear in the chat and only in the one that it was started in.

# Known Bugs

1. Sometimes the video will be blank, I have put a self correcting function into the server but it does not work 100% of the time.

2. The media server has a memory leak, so every time that the screen share stops it will restart kurento. That's why there is a sudo password environment variable.

# Client Requirements

* [Better Discord](https://github.com/Jiiks/BetterDiscordApp)

# Server Requirements

* [NodeJS](https://nodejs.org/en/download/)
* Nginx
* Linux server with Ubuntu
* [Discord bot](https://discordapp.com/developers/applications/) to send who is sharing screen to the channel
* Valid TLS certificate.
* Domain name (If you don't have one then use [NoIP](https://www.noip.com/))
* [Kurento Media Server](https://doc-kurento.readthedocs.io/en/stable/what_is_kurento.html)

# If you Don't Have A TLS Certificate

Install [Certbot](https://certbot.eff.org/#ubuntuxenial-nginx) and follow the prompts for getting a certificate

```bash
sudo add-apt-repository ppa:certbot/certbot
sudo apt update
sudo apt install certbot
sudo certbot certonly
```

# Set up Kurento Server

This is the server that relays the video to the users.

To use this you NEED to be on ubuntu since Kurento only supports ubuntu.

Replace "Version" with whatever version of ubuntu you are on.

14.04 - trusty

16.04 - xenial

16.10 - yakkety

```bash
echo "deb http://ubuntu.kurento.org VERSION kms6" | sudo tee /etc/apt/sources.list.d/kurento.list
wget -O - http://ubuntu.kurento.org/kurento.gpg.key | sudo apt-key add -
sudo apt update
sudo apt install kurento-media-server-6.0
sudo service kurento-media-server-6.0 start
```

# Setting Up Nginx

1. Add this block to your current site or a new sites, edit the alias for /screenshare to point to where the html folder is.

```Nginx
location /ssws {
    proxy_pass http://localhost:8006;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_buffering off;
    proxy_connect_timeout 43200000;
    proxy_read_timeout 43200000;
    proxy_send_timeout 43200000;
}

location /screenshare {
    alias /path/to/html/folder;
    add_header 'Access-Control-Allow-Origin' '*';
}
```

2. Enable TLS

# Set Up The Server

Run these from the screenshare folder. And run the file with the command arguments

```bash
npm install
sudo chmod +x restart.sh
BOT="123456" CHATID="123456" PASS="password" ADMIN="user1user2" SUDO="password" node main.js
```

# How to Set up the Plugin

1. Download Better Discord and install.
2. Extract screenShare.plugin.js to %appdata%\BetterDiscord\Plugins (or ~/Library/Preferences/BetterDiscord/plugins for OSX)
3. Edit domain varibale near the top of the plugin.
4. Distribute plugin to everyone who will use it.
5. Enable plugin in Better Discord.
6. Use the button in the top right corner to start and stop screen share.

# Server Options

## Environment Variables

### Required

BOT: The token for the discord bot.

CHATID: Channel ID for the channel the bot is going to be in

PASS: Password for the WS server. (Automatically inserted to the client)

SUDO: Password for sudo to restart kurento after someone has stop sharing.

### Optional

ADMIN: String of users who can stop and start the screen share.

# Client Configuration

domain: Domain Name of the server.

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

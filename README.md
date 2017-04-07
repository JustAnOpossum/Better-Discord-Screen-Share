# Better Discord Screen Sharing

This is a plugin and server for the plugin for Better Discord that lets you share your screen. It needs ubuntu for the server.

DISCLAMER: This is untested on OSX but the paths are set up correctly for OSX.

![Example:](https://s16.postimg.org/jp7ptckj9/Picture.png)

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
sudo apt-get update
sudo apt-get install kurento-media-server-6.0
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
BOT="1234" node main.js --chatID=1234
```

# How to Set up the Plugin

1. Download Better Discord and install.
2. Extract screenShare.plugin.js to %appdata%\BetterDiscord\Plugins (or ~/Library/Preferences/BetterDiscord/plugins for OSX)
3. Enable plugin in Better Discord.
4. Use the button in the top right corner to start and stop screen share.

# Server Options

## Command Like Options

Run the server with these options to change the options.

### Required

chatID: The chat is for the group the bot is going to be in.

```node
node main.js --chatID=123456
```

## Environment Vars

### Required

BOT: The token for the discord bot.

```node
BOT="123456" node main.js
```

# Client config

Edit the variables in the top of the plugin.

domain: Domain Name of the server.

# Upcoming Features

- [x] Better Autoupdate
- [x] Disconnect detection
- [ ] Webcam Support
- [ ] Better video placement

# Libraries Used

* [Better Discord](https://github.com/Jiiks/BetterDiscordApp)
* [DiscordIO](https://github.com/izy521/discord.io)
* [Bluebird](https://github.com/petkaantonov/bluebird)
* [Primus](https://github.com/primus/primus)
* [kurento-client](https://github.com/Kurento/kurento-client-js)
* [kurento-utils](kurento-client)
* [adapter.js](https://github.com/webrtc/adapter)

# Problems

If there are any problems please open a issue or pull request if you want to fix the problem.

# Licence

MIT License

Copyright (c) 2017 ConnorTheFox

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

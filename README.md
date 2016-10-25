# Better Discord Screen Sharing

This is a plugin for Better Discord that lets you share your screen simalar to Skype. It uses webRTC to transmit the video (so it might not be good for a large volume of people). And if it dosen't work or weird bugs happen then please open a issue here so I can correct it.

I have provided the plugin and the server to run it.

DISCLAMER: This is untested on OSX but the paths are set up correctly for OSX.

![Example:](https://s16.postimg.org/jp7ptckj9/Picture.png)

# Client Requirements

* [Better Discord](https://github.com/Jiiks/BetterDiscordApp)

# Server Requirements

* [NodeJS](https://nodejs.org/en/download/) Use V4 LTS since there are bugs with V6
* Ability to port forward
* [Discord bot](https://discordapp.com/developers/applications/) to handle screenshare in chat.
* Valid TLS certificate.
* Domain name (If you don't have one then use [NoIP](https://www.noip.com/))

# If you Don't Have A Certificate

Install the commaind line tool

```
npm install -g letsencrypt-cli@2.x
```

Run this command in the server directory


```
letsencrypt certonly --agree-tos --email YOUREMAILHERE --standalone --domains DNS_NAME_HERE --server https://acme-v01.api.letsencrypt.org/directory --config-dir certs --tls-sni-01-port 443
```

The files should be in certs/live/yourdoamin

Key: privkey.pem

Cert: cert.pem

# How to Set up the Server

1. Extract server folder
2. Run npm install
3. Create a discord bot and add it to chat.
4. Customise serverConfig.json
5. Run server.js

# How to Set up the Plugin

1. Download Better Discord and install.
2. Extract the client folder into %appdata%\BetterDiscord\plugins
3. Enable plugin in Better Discord
4. Use "start" and "stop" to control screenshare in chat.

# Server Options

Edit config.json to your liking

botToken: The token for the discord bot. ***Required***

peerPort: The port for the peerJS server (Default: 9000).

expressPort: Port for websockets and express server. (Default: 9001).

key: Path to TLS key file. ***Required***

cert: Path to TLS cert file. ***Required***

# Client config

Edit the variables in the top of the plugin.

domain: Domain Name of the server

peerPort: Port for the peerjs server (Default: 9000)

wsPort: Port for the http server and websocket server (Default: 9001)

# Upcoming Features

* Better Autoupdate
* Better video placement
* Disconnect detection
* Webcam Support

# Libraries Used

* [Better Discord](https://github.com/Jiiks/BetterDiscordApp)
* [BetterAPI](https://github.com/Bluscream/BetterDiscord-Plugins-and-Themes/blob/master/src/plugins/0_BetterAPI.plugin.js)
* [Reconnecting WebSockets](https://github.com/joewalnes/reconnecting-websocket)
* [DiscordIO](https://github.com/izy521/discord.io)
* [PeerJS](http://peerjs.com/)
* [Letsencrypt CLI](https://github.com/Daplie/letsencrypt-cli)

# Licence

MIT License

Copyright (c) 2016 ConnorTheFox

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

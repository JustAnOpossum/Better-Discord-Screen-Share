# Better Discord Screen Sharing

This is a plugin for Better Discord that lets you share your screen simalar to Skype. It uses webRTC to transmit the video (so it might not be good for a large volume of people). And if it dosen't work or weird bugs happen then please open a issue here so I can correct it.

I have provided the plugin and the server to run it.

![Example:](https://s16.postimg.org/jp7ptckj9/Picture.png)

# Requirements

* [Better Discord](https://github.com/Jiiks/BetterDiscordApp)
* A place to run the server that can be accessed from the internet.
* [Discord bot](https://discordapp.com/developers/applications/) to handle screenshare.
* Valid TLS certificate for TLS support. (If you want free valid certs check out [letsencrypt](https://certbot.eff.org/))
* [Reconnecting Web Sockets](https://github.com/joewalnes/reconnecting-websocket)

# How to use

1. Extract server folder into a folder of your choice
2. Run NPM install
3. Run server.js
4. Download Better Discord and install.
5. Extract the client folder into %appdata%/BetterDiscord/Plugins
6. Install ReconnectingWebSockets into a file named ws.js in the plugins folder.
7. Create a discord bot and add it to chat.
8. Use start and stop to control screenshare in chat.

# Server Options

Edit config.json to your liking

botToken: The token for the discord bot. ***Required***

peerPort: The port for the peerJS server (Default: 9000).

expressPort: Port for websockets and express server. (Default: 9001).

key: Path to TLS key file. ***Required***

cert: Path to TLS cert file. ***Required***

# Client config

Domain: IP or DNS name of the server.

peerPort: The Peerjs server port.

expressPort: The port for the express server

# Upcoming Features

* Autoupdate
* Better video placement
* Disconnect detection
* Webcam Support
* Chat detection

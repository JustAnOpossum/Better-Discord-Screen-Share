# Client Requirements

* [Better Discord](https://github.com/Jiiks/BetterDiscordApp)

# Server Requirements

* [NodeJS](https://nodejs.org/en/download/)
* Nginx
* Linux server with Ubuntu 14 or 16.04
* [Discord bot](https://discordapp.com/developers/applications/) to send who is sharing screen to the channel
* Valid TLS certificate.
* Domain name (If you don't have one then use [DuckDNS](https://www.duckdns.org/)
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
    auth_basic "Private";
    auth_basic_user_file PATH TO .htpasswd FILE
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
BOT="123456" CHATID="123456" PASSHTTP="password" ADMIN="user1user2" SUDO="password" DOMAIN="example.com" node main.js
```

# How to Set up the Plugin

1. Download Better Discord and install.
2. Extract screenShare.plugin.js to %appdata%\BetterDiscord\Plugins (or ~/Library/Preferences/BetterDiscord/plugins for OSX)
3. Copy Genertated plugin from the html folder and send it to people.
4. Enable plugin in Better Discord.
5. Use the button in the top right corner to start and stop screen share.

# Server Options

## Environment Variables

### Required

BOT: The token for the discord bot.

CHATID: Channel ID for the channel the bot is going to be in

PASS: Password for the WS server. (Automatically inserted to the client)

SUDO: Password for sudo to restart kurento after someone has stop sharing.

ADMIN: String of users who can stop and start the screen share.

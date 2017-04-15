#!/bin/bash

V=`lsb_release -r`

check14=`echo $V | grep '14'`
if [ "$check14" != '' ]
then
  release='trusty'
fi

check16=`echo $V | grep '16.04'`
if [ "$check16" != '' ]
then
  release='xenial'
fi

check1610=`echo $V | grep '16.10'`
if [ "$check1610" != '' ]
then
  release='yakkety'
fi

if [ ! -f /usr/bin/node ] || [ ! -f /usr/bin/git ] || [ ! -f /usr/bin/curl ] || [ ! -f /usr/bin/add-apt-repository ]
then
  apt update && apt install -y curl software-properties-common git
  service stop apache2
  update-rc.d apache2 disable
  add-apt-repository -y ppa:certbot/certbot
  curl -sL https://deb.nodesource.com/setup_7.x | bash
  apt install -y nodejs nginx certbot
fi

if [ ! -f /usr/bin/kurento-media-server ]
then
  echo "deb http://ubuntu.kurento.org $release kms6" |  tee /etc/apt/sources.list.d/kurento.list
  wget -O - http://ubuntu.kurento.org/kurento.gpg.key |  apt-key add -
  apt update
  apt install -y kurento-media-server-6.0
  service kurento-media-server-6.0 start
fi

if  [ ! -d /etc/letsencrypt/live/$1 ]
then
  mkdir /var/www/
  mkdir /var/www/certbot
  sed "s/DOMAIN/$1/g" nginxBase.conf |  tee /etc/nginx/sites-available/$1.conf
  sed -i "s|DIR|$PWD\/html|g" /etc/nginx/sites-available/$1.conf
  ln -s /etc/nginx/sites-available/$1.conf /etc/nginx/sites-enabled/$1.conf
  service nginx reload
  certbot certonly --webroot -w /var/www/certbot -d $1
  sed -i "s/#/ /g" /etc/nginx/sites-available/$1.conf
  service nginx reload
fi

npm i
echo "DOMAIN=$1 BOT=$2 CHATID=$3 PASS=$4 SUDO=$5 node main.js &&  service kurento-media-server-6.0 start" > start.sh
chmod +x start.sh
chown -R $SUDO_USER node_modules
chown -R $SUDO_USER start.sh
chmod -R 755 html
chown -R $SUDO_USER html
chmod +x restart.sh
./start.sh

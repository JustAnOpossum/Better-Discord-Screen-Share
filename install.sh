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
  sed -i "s|AUTHDIR|$PWD/$6|g" /etc/nginx/sites-available/$1.conf
  service nginx reload
fi

npm i
chown -R $SUDO_USER node_modules
chmod -R 755 html
chown -R $SUDO_USER html
chmod +x restart.sh
htpasswd -b -c passdw screenshare $6
sed "s|PATH|$PWD|g; s/EBOT/$2/g; s/ECHATID/$3/g; s/EADMIN/$4/g; s/ESUDO/$5/g; s/EPASSHTTP/$6/g; s/EDOMAIN/$1/g; s/PUSERNAME/$7/g; s/PGROUP/$8/g" serviceBase.service | tee /etc/systemd/system/screenshare.service
systemctl daemon-reload
systemctl start screenshare
systemctl enable screenshare
sleep 4

if [ `systemctl is-active screenshare` = 'active' ]
then
  printf 'The screen share server is installed and active, use sudo systemctl [command] screenshare to control it.\nIf any problems occur, email me at support@nerdfox.me\n'
else
  systemctl restart screenshare
  timeout 4 journalctl -u screenshare --follow | tee error.log
  printf 'An error has occured with launching the server, please send me error.log above to support@nerdfox.me'
fi

#!/bin/bash

echo $1 | sudo -S sudo service kurento-media-server-6.0 restart

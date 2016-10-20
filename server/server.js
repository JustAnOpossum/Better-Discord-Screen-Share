'use strict'

const fs = require('fs')
const Discord = require('discord.io')
const config = JSON.parse(fs.readFileSync('serverConfig.json', 'utf8'))
if (!config.botToken) {
  throw "Please enter bot token in config"
}
const bot = new Discord.Client({
    token: config.botToken,
    autorun: true
})
const PeerServer = require('peer').PeerServer
const express = require('express')
const https = require('https')
const WebSocketServer = require('ws').Server

let peerPort = config.peerPort || 9000
let expressPort = config.expressPort || 9001
if (!config.key || !config.crt) {
  throw "Please enter all TLS certs in the config"
}
let key = fs.readFileSync(config.key, 'utf8')
let cert = fs.readFileSync(config.crt, 'utf8')

let share = false //Set when someone shares their screen
let currentId //Current Discord ID of the user screensharing
let currentChannel //Current channel the screen share is happaning
let currentScreenUser //Current User that is sharing his/her screen

bot.on('ready', function() {})

bot.on('message', function(user, userID, channelID, message, event) {
    currentScreenUser = user //sets it to user that sent message
    currentChannel = channelID //gets channel id
    if (message.toLowerCase() === 'start' && share === false) {
        bot.sendMessage({
                to: currentChannel,
                message: currentScreenUser + ' is now sharing their screen!'
            }) //sends the share screen message
        wss.clients.forEach(function each(client) { //Finds the user that started the screenshare
            client.send(JSON.stringify({
                status: 'findStart',
                userId: userID
            }))
        })
    }
    if (message.toLowerCase() === 'stop' && share === true) {
        if (user === currentScreenUser) { //Only lets user stop their own
            wss.clients.forEach(function each(client) {
                client.send(JSON.stringify({
                        status: 'findStop',
                        userId: userID
                    })) //Finds person who stopped share
            })
        }
    }
})

var server = PeerServer({
    port: peerPort,
    ssl: {
        key: key,
        cert: cert
    },
    path: '/peerjs'
})

var options = {
    key: key,
    cert: cert
}

var app = express()
var httpsServer = https.createServer(options, app)
httpsServer.listen(expressPort)


var wss = new WebSocketServer({
    server: httpsServer
})
wss.on('connection', function connection(ws) {
    if (share === true) { //If someone is sharing screen tell them where to find it
        ws.send(JSON.stringify({
            status: 'connect',
            peerId: currentId
        }))
    }
    ws.on('message', function incoming(message) {
        var parsed = JSON.parse(message)
        if (parsed.status === 'startShare') { //When user is found to screenshare
            currentId = parsed.peerId
            share = true //Sharing is on
            wss.clients.forEach(function each(client) { //Lets plugin know that a share is happaning
                if (client != ws) {
                    client.send(JSON.stringify({
                        status: 'connect',
                        peerId: parsed.peerId
                    }))
                }
            })
        }
        if (parsed.status === 'stop') { //Stops screenshare
            share = false
            wss.clients.forEach(function each(client) {
                client.send(JSON.stringify({
                    status: 'stop',
                    peerId: parsed.peerId
                }))
            })
        }
    })
    ws.on('close', function close() {})
})

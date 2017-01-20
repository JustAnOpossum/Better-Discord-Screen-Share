'use strict'

const fs = require('fs')
const url = require('url')
const path = require('path')
const Discord = require('discord.io')
const config = JSON.parse(fs.readFileSync('serverConfig.json', 'utf8'))
if (!config.botToken) {
  throw new Error("Please enter bot token in config")
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
  throw new Error("Please enter all TLS certs in the config")
}
let key = fs.readFileSync(config.key, 'utf8')
let cert = fs.readFileSync(config.crt, 'utf8')

let share = false //Set when someone shares their screen
let username
let currentId

bot.on('ready', function() {})

bot.on('disconnect', function(){ //Reconnects of bot goes offline
  bot.connect()
})

/**bot.on('message', function(user, userID, channelID, message){
            bot.sendMessage({
                    to: '229480413582721024',
                    message:  message
                })
})
**/
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
app.use(express.static('html'))
app.use(express.static('updates'))
var httpsServer = https.createServer(options, app)
httpsServer.listen(expressPort)

app.get('/head*', function(req, res){
res.writeHead('200', {'Access-Control-Allow-Origin':'*'})
var file = path.parse(url.parse(req.url).path).base
res.end( fs.readFileSync(__dirname +'/scripts/'+file, 'utf8'))
})


var wss = new WebSocketServer({
    server: httpsServer
})
wss.on('connection', function connection(ws) {
    if (share === true) { //If someone is sharing screen tell them where to find it
        ws.send(JSON.stringify({
            status: 'connect',
            peerId: currentId,
            username: username
        }))
    }
    ws.on('message', function incoming(message) {
        var parsed = JSON.parse(message)
        if (parsed.status === 'startShare') { //When user is found to screenshare
            username = parsed.username
            currentId = parsed.peerId
            share = true //Sharing is on
            wss.clients.forEach(function each(client) { //Lets plugin know that a share is happaning
                if (client != ws) {
                    client.send(JSON.stringify({
                        status: 'connect',
                        peerId: parsed.peerId,
                        username: parsed.username
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
        if (parsed.status === 'buttonClick') {
          if (share === false) {
            bot.sendMessage({
                    to: '229480413582721024',
                    message:  parsed.username + ' is now sharing their screen!'
                })
            ws.send(JSON.stringify({
              status:'getPeer'
            }))
          }
          if (share === true) {
            if (parsed.username === username) {
              wss.clients.forEach(function each(client) {
                  client.send(JSON.stringify({
                      status: 'stop',
                      peerId: parsed.peerId
                  }))
              })
              share = false
            }
          }
        }
    })
    ws.on('close', function close() {})
})

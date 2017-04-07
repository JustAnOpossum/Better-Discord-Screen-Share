const process = require('process')
const Discord = require('discord.io')
const primus = require('primus')
const Promise = require('bluebird')
const kurento = require('kurento-client')
const crypto = require('crypto')
const fs = require('fs')
const argv = require('minimist')(process.argv.slice(2))
Promise.promisifyAll(fs)
let mediaServer

let users = {}
let share = false
let shareID

const kurentoWS = argv.kurento || 'ws://localhost:8888/kurento'
const chatID = argv.chatID
let token
if (!process.env.BOT) {
   throw new Error('Enter A Bot Token')
} else {
   token = process.env.BOT
}

const bot = new Discord.Client({
   token: token,
   autorun: true
})

const wssServer = primus.createServer({
   port: 8006,
   iknowhttpsisbetter: true,
   pathname: '/ssws'
})

wssServer.on('connection', spark => {
  console.log('Got connection')
   fs.readFile('html/screenShare.plugin.js', 'utf8', (err, localPlugin) => {
      let localHash = crypto.createHash('sha256').update(localPlugin).digest('hex')
      if (localHash != spark.query.version) {
         spark.write({ type: 'update', file: localPlugin })
      }
      if (share) {
         spark.write({ type: 'startView' })
      }
      spark.on('data', msg => {
         if (msg.type === 'button') {
            if (!share) {
               spark.write({ type: 'startShare' })
            }
            if (share) {
               stop(spark)
            }
         }
         if (msg.type === 'share' && !share) {
            mediaServer = kurento(kurentoWS)
            shareID = spark.id
            users[spark.id] = new user('share', msg.username)
            startShare(spark, msg.offer, spark.id)
         }
         if (msg.type === 'view' && share) {
            users[spark.id] = new user('view', msg.username)
            startView(spark, msg.offer, spark.id)
         }
         if (msg.type === 'ice' && share) {
            onIceCandidate(msg.ice, spark.id)
         }
      })
      spark.on('end', () => {
         if (share) {
            stop(spark, true)
         }
      })
   })
})

function startShare(spark, offer, id) {
  console.log('Starting Share')
   bot.sendMessage({ to: chatID, message: users[id].username + ' is now sharing their screen!' })
   let pipeline = mediaServer.create('MediaPipeline')
   users[id].pipeline = pipeline
   let endpoint = pipeline.create('WebRtcEndpoint')
   users[id].endpoint = endpoint
   users[id].ice.forEach(ice => {
      endpoint.addIceCandidate(ice)
   })
   endpoint.on('OnIceCandidate', event => {
      let ice = kurento.getComplexType('IceCandidate')(event.candidate)
      let message = {
         type: 'ice',
         ice: ice
      }
      spark.write(message)
   })
   endpoint.processOffer(offer, (err, answer) => {
      if (err) {
         console.log(err)
      }
      let message = {
         type: 'shareAccepted',
         answer: answer
      }
      spark.write(message)
   })
   endpoint.gatherCandidates()
   share = true
   wssServer.forEach((spark, id) => {
      if (id != shareID) {
         spark.write({ type: 'startView' })
      }
   })
}

function startView(spark, offer, id) {
  console.log('Starting View')
   let endpoint = users[shareID].pipeline.create('WebRtcEndpoint')
   users[id].endpoint = endpoint
   users[id].ice.forEach(ice => {
      endpoint.addIceCandidate(ice)
   })
   endpoint.on('OnIceCandidate', event => {
      let ice = kurento.getComplexType('IceCandidate')(event.candidate)
      let message = {
         type: 'ice',
         ice: ice
      }
      spark.write(message)
   })
   endpoint.processOffer(offer, (err, answer) => {
      if (err) {
         console.log(err)
      }
      let message = {
         type: 'viewAccepted',
         answer: answer
      }
      spark.write(message)
   })
   users[shareID].endpoint.connect(endpoint, function(err) {
      if (err) {
         console.log(err)
      }
      endpoint.gatherCandidates()
   })
}

function onIceCandidate(_ice, id) {
   let ice = kurento.getComplexType('IceCandidate')(_ice)
   if (share) {
      if (users[id].type === 'share') {
         users[id].endpoint.addIceCandidate(ice)
      }
      if (users[id].type === 'view') {
         users[id].endpoint.addIceCandidate(ice)
      }
   } else {
      users[id].ice.push(ice)
   }
}

function user(type, username) {
   this.type = type
   this.ice = []
   this.endpoint = null
   this.pipeline = null
   this.spark = null
   this.username = username
}

function stop(spark, disconnect) {
      if (spark.id === shareID) {
         stopAll()
      } else {
         users[spark.id].endpoint.release()
      }

   function stopAll() {
      let id = spark.id
      wssServer.write({ type: 'stop' })
      users[shareID].pipeline.release()
      mediaServer.close()
      share = false
      users = {}
      shareID = null
   }
}

console.log('Web Socket server listening on port 8006 on localhost')

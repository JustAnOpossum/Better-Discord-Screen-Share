const process = require('process')
const Discord = require('discord.io')
const primus = require('primus')
const Promise = require('bluebird')
const kurento = require('kurento-client')
const crypto = require('crypto')
const fs = require('fs')
const child = require('child_process')
Promise.promisifyAll(fs)
let mediaServer

let users = {}
let share = false
let shareID
let messageID
let guild

let chatID
let token
let sudoPassword
let domain
let httpPassword
let errorCalled = false
const admin = (process.env.ADMIN || '')

if (!process.env.BOT || !process.env.CHATID || !process.env.DOMAIN || !process.env.PASSHTTP) {
   throw new Error('Enter All The Required Environment Variables')
} else {
   token = process.env.BOT
   chatID = process.env.CHATID
   sudoPassword = process.env.SUDO
   domain = process.env.DOMAIN
   httpPassword = process.env.PASSHTTP
}

child.exec('sed "s/PLACEHOLDER/' + domain + '/g; s/USERPLACE/screenshare/g; s/PASSPLACE/'+httpPassword+'/g" html/template.js > html/screenShare.plugin.js', (err, stdout, out) => {
  if (err) {
     throw new Error(err)
  }
})

const bot = new Discord.Client({
   token: token,
   autorun: true
})



const wssServer = primus.createServer({
   port: 8006,
   iknowhttpsisbetter: true,
   pathname: '/ssws'
})

wssServer.save(__dirname + '/html/primus.js')

wssServer.on('connection', spark => {
   console.log('Got connection')
   fs.readFile('html/screenShare.plugin.js', 'utf8', (err, localPlugin) => {
      let localHash = crypto.createHash('sha256').update(localPlugin).digest('hex')
      if (localHash != spark.query.version) {
         spark.write({ type: 'update', file: localPlugin })
      }
      if (share) {
         spark.write({ type: 'startView', guild: guild })
      }
      spark.on('data', msg => {
         if (msg.type === 'button') {
            if (!share) {
               spark.write({ type: 'startShare' })
            }
            if (share) {
               stop(spark, false)
            }
         }
         if (msg.type === 'share' && !share) {
            bot.sendMessage({ to: chatID, message: msg.username + ' is now sharing their screen!' }, (err, message) => {
               messageID = message.id
               mediaServer = kurento('ws://localhost:8888/kurento')
               shareID = spark.id
               users[spark.id] = new user('share', msg.username, spark)
               guild = msg.guild
               startShare(spark, msg.offer, spark.id)
            })
         }
         if (msg.type === 'view' && share) {
            users[spark.id] = new user('view', msg.username, spark)
            startView(spark, msg.offer, spark.id)
         }
         if (msg.type === 'ice' && share) {
            onIceCandidate(msg.ice, spark.id)
         }
         if (msg.type === 'stop') {
            stop(spark, false)
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
         spark.write({ type: 'startView', guild: guild })
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

function user(type, username, spark) {
   this.type = type
   this.ice = []
   this.endpoint = null
   this.pipeline = null
   this.spark = spark
   this.username = username
}

function stop(spark, disconnect) {
  try {
    if (disconnect && spark.id === shareID || admin.search(users[spark.id].username) != -1 && !disconnect || spark.id === shareID) {
       stopAll()
    } else {
       users[spark.id].endpoint.release()
       delete users[spark.id]
    }

    function stopAll() {
       let shareSpark = users[shareID].spark
       wssServer.write({ type: 'stop' })
       users[shareID].pipeline.release()
       mediaServer.close()
       share = false
       users = {}
       shareID = null
       setTimeout(function() {
          child.exec('./restart.sh ' + sudoPassword, (err, stdout, out) => {
             bot.deleteMessage({ channelID: chatID, messageID: messageID })
          })
       }, 1500)
    }  
  }
  catch(e) {
    console.log(e)
  }
}

console.log('Web Socket server listening on port 8006 on localhost')

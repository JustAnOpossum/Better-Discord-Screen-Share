//META{"name":"screenShare"}*//
let screenShare = function() {}

const domain = 'PLACEHOLDER'
const user = 'USERPLACE'
const password = 'PASSPLACE'
const httpAuthPath = `https://${user}:${password}@${domain}`
const wspath = '/ssws'
const staticpath = '/screenshare'
let pluginPath
if (process.platform != 'win32') {
   pluginPath = `${process.env.HOME}/Preferences/BetterDiscord/plugins/screenShare.plugin.js`
} else {
   pluginPath = `${process.env.APPDATA}\\BetterDiscord\\plugins\\screenShare.plugin.js`
}

let primus
let mediaStream
let webRtcPeer
let sharing = false
let reconnecting = true
let remoteHash
let localHash
let pendingUpdate = { file: null, status: false }
let i
let isShare = false
let guildText
let click = true
let checkForVideos
let error = false
const { desktopCapturer } = require('electron')
const crypto = require('crypto')
const request = require('request')
const fs = require('fs')

function buttonClick() {
   if (pendingUpdate.status) {
      let updateOrNot = confirm('Would you like to update now?\nCancel: start share screen\nOK: Update Now')
      if (updateOrNot) {
         fs.writeFile(pluginPath, pendingUpdate.file, (err, wrote) => {
            if (!err) {
               window.location.reload()
            }
         })
      } else {
         primus.write({ type: 'button' })
      }
   } else {
      if (click) {
         primus.write({ type: 'button' })
         click = false
         setTimeout(function() { click = true }, 3000)
      }
   }
}

screenShare.prototype.start = function() {
   let t = `https://${domain}${staticpath}/icon.png`
   let main = this
   fs.readFile(pluginPath, 'utf8', (err, localfile) => {
      localHash = crypto.createHash('sha256').update(localfile).digest('hex')
      $.when(
         $.getScript(`${httpAuthPath}${staticpath}/primus.js`),
         $.getScript(`${httpAuthPath}${staticpath}/kurento-utils.min.js`),
         $.getScript(`${httpAuthPath}${staticpath}/adapter.js`)
      ).then(() => {
         main.ready()
      })
   })
}

screenShare.prototype.ready = function() {
   primus = Primus.connect(`https://${domain}${wspath}/?version=${localHash}`)
   $('.header-toolbar').prepend('<button onclick="buttonClick()" id="screenshare" type="button" style="background-image:url(' + httpAuthPath + staticpath + '/icon.png' + ');background-repeat:no-repeat"></button>')
   setInterval(() => {
      if (!$('#screenshare').length) {
         $('.header-toolbar').prepend('<button onclick="buttonClick()" id="screenshare" type="button" style="background-image:url(' + httpAuthPath + staticpath + '/icon.png' + ');background-repeat:no-repeat"></button>')
      }
      if (isShare && $('.name-3gtcmp').text() === guildText && !$('#ssvideo').length) {
         if (sharing) {
            $('.message-text').last().append("<video id='ssvideo' autoplay controls muted style='width:100%;height:100%'src=" + URL.createObjectURL(mediaStream) + ">")
         } else {
            $('.message-text').last().append("<video id='ssvideo' autoplay controls muted style='width:100%;height:100%'src=" + webRtcPeer.remoteVideo.src + ">")
         }
      }
   }, 10000)
   let mainFunc = this
   primus.on('data', msg => {
      if (msg.type === 'ice') {
         webRtcPeer.addIceCandidate(msg.ice)
      }
      if (msg.type === 'shareAccepted') {
         webRtcPeer.processAnswer(msg.answer)
      }
      if (msg.type === 'viewAccepted') {
         webRtcPeer.processAnswer(msg.answer)
      }
      if (msg.type === 'stop') {
         mainFunc.stopScreen()
      }
      if (msg.type === 'startView') {
         guildText = msg.guild
         mainFunc.startView()
      }
      if (msg.type === 'startShare') {
         mainFunc.startShare()
      }
      if (msg.type === 'update') {
         pendingUpdate.status = true
         pendingUpdate.file = msg.file
         $('#screenshare').css({ 'background-image': 'url(' + httpAuthPath + staticpath + '/iconUpdate.png)' })
      }
   })
   primus.on('reconnect', () => {
      if (reconnecting) {
         mainFunc.stopScreen()
         reconnecting = false
      }
   })
   primus.on('reconnected', () => {
      reconnecting = true
   })
}

screenShare.prototype.startShare = function() {
   guildText = $('.name-3gtcmp').text()
   let main = this
   desktopCapturer.getSources({ types: ['screen'] }, (error, sources) => {
      if (error) throw error
      navigator.webkitGetUserMedia({
         audio: false,
         video: {
            mandatory: {
               chromeMediaSource: 'desktop',
               chromeMediaSourceId: sources[0].id,
               minWidth: 1280,
               maxWidth: 1280,
               minHeight: 720,
               maxHeight: 720
            }
         }
      }, handleStream, handleError)
   })

   function handleStream(stream) {
      mediaStream = stream
      var options = {
         videoStream: stream,
         onicecandidate: main.onIceCandidate
      }
      webRtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerSendonly(options, function(err) {
         if (err) {
            console.log(err)
         }
         this.generateOffer((err, offer) => {
            if (err) {
               console.log(err)
            } else {
               var message = {
                  type: 'share',
                  offer: offer,
                  username: $('.username').text(),
                  guild: guildText
               }
               $('.message-text').last().append("<video id='ssvideo' autoplay controls muted style='width:100%;height:100%'src=" + URL.createObjectURL(stream) + ">")
               sharing = true
               isShare = true
               primus.write(message)
            }
         })
      })
   }

   function handleError(e) {
      console.log(e)
   }
}

screenShare.prototype.startView = function() {
   isShare = true
   $('.message-text').last().append("<video id='ssvideo' autoplay controls muted style='width:100%;height:100%'>")
   let video = document.getElementById('ssvideo')
   let main = this
   let options = {
      onicecandidate: main.onIceCandidate,
      remoteVideo: video
   }

   checkForVideos = setInterval(() => {
      try {
         webRtcPeer.currentFrame
      } catch (e) {
        error = true
         primus.write({ type: 'stop' })
         main.stopScreen()
      }
   }, 8000)

   webRtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerRecvonly(options, function(error) {
      if (error) console.log(err)

      this.generateOffer((err, offer) => {
         if (err) {
            console.log(err)
         } else {
            var message = {
               type: 'view',
               offer: offer,
               username: $('.username').text()
            }
            primus.write(message)
         }
      })
   })
}

screenShare.prototype.onIceCandidate = function(candidate) {
   var message = {
      type: 'ice',
      ice: candidate
   }
   primus.write(message)
}

screenShare.prototype.onSwitch = function() {
   if (i === 1) {
      if (!$('#screenshare').length) {
         $('.header-toolbar').prepend('<button onclick="buttonClick()" id="screenshare" type="button" style="background-image:url(' + httpAuthPath + staticpath + '/icon.png' + ');background-repeat:no-repeat"></button>')
      }
      if (isShare && $('.name-3gtcmp').text() === guildText) {
         if (sharing) {
            $('.message-text').last().append("<video id='ssvideo' autoplay controls muted style='width:100%;height:100%'src=" + URL.createObjectURL(mediaStream) + ">")
         } else {
            $('.message-text').last().append("<video id='ssvideo' autoplay controls muted style='width:100%;height:100%'src=" + webRtcPeer.remoteVideo.src + ">")
         }
      }
      i = 0
   } else {
      i = 1
   }
}

screenShare.prototype.stopScreen = function() {
   clearInterval(checkForVideos)
   webRtcPeer.dispose()
   webRtcPeer = null
   isShare = false
   $('#ssvideo').remove()
   if (sharing) {
      sharing = false
      mediaStream.getVideoTracks()[0].stop()
   }
   if (error) {
     error = false
     this.startView()
   }
}

screenShare.prototype.getSettingsPanel = function() {
   return "<h3>Settings Panel</h3>"
}
screenShare.prototype.getName = function() {
   return "Screen Share"
}
screenShare.prototype.getDescription = function() {
   return "Shares your screen"
}
screenShare.prototype.getVersion = function() {
   return "0.4.0"
}
screenShare.prototype.getAuthor = function() {
   return "ConnorTheFox"
}

screenShare.prototype.load = function() {}

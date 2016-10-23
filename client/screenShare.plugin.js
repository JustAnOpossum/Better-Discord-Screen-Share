//META{"name":"screenShare"}*//
var screenShare = function() {};

var domain = '' //enter domain here. String
var peerPort =  //perjs port. Number
var wsPort = '' //Websockt port. String

var i = 0
var media
var conn
var ws
var peer
var isShare
var currentCall

screenShare.prototype.start = function() {
    var reconnect = require(process.env.APPDATA+'\\BetterDiscord\\Plugins\\ws.js')
    var orig = this
    var s = document.createElement("script")
    s.type = "text/javascript"
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/peerjs/0.3.14/peer.min.js"
    $("head").append(s)
    $('document').ready(function() {
        ws = new reconnect('wss://'+domain+wsPort', null, {maxReconnectInterval:'10000'})
        ws.onmessage = function(message) {
            var parsed = JSON.parse(message.data)
            if (parsed.status === 'connect') {
              peer = new Peer({
                  host: domain,
                  port: peerPort,
                  path: '/peerjs',
                  debug: 1,
                  secure: true,
                  config: {
                      'iceServers': [{
                          url: 'stun:stun1.l.google.com:19302'
                      }, {
                          url: 'turn:numb.viagenie.ca',
                          credential: 'muazkh',
                          username: 'webrtc@live.com'
                      }]
                  }
              })
              peer.on('call', function(call) {
                  call.answer()
                  call.on('stream', function(stream) {
                    media = stream
                  isShare = true
                      $(".message-text").last().append("<video class='hereisthevideo' autoplay controls muted style='width:100%;height:100%'src=" + URL.createObjectURL(media) + ">")
                  })
              })
                peer.on('open', function(){
                    conn = peer.connect(parsed.peerId)
                })
            }
            if (parsed.status === 'stop') {
                isShare = false
                $('.hereisthevideo').remove()
                peer.destroy()
            }
            if (parsed.status === 'findStart' && parsed.userId === BetterAPI.getOwnID()) {
              isShare = true
              orig.getScreen()
            }
            if (parsed.status === 'findStop' && parsed.userId === BetterAPI.getOwnID()) {
              isShare = false
              orig.stopStream()
            }
        }
    })
};
screenShare.prototype.load = function() {};
screenShare.prototype.unload = function() {};
screenShare.prototype.stop = function() {};
screenShare.prototype.onSwitch = function() {
    if (i === 1) {
        if (isShare === true) {
            $(".message-text").last().append("<video class='hereisthevideo' autoplay controls muted style='width:100%;height:100%'src=" + URL.createObjectURL(media) + ">")
        }
        i = 0
    } else {
        i = 1
    }
};
screenShare.prototype.observer = function(e) {};
screenShare.prototype.getScreen = function() {
    const {
        desktopCapturer
    } = require('electron')
    desktopCapturer.getSources({
        types: ['window', 'screen']
    }, (error, sources) => {
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
        }, on, off)
        return
    })

    function on(mediaStream) {
      peer = new Peer({
          host: doamin,
          port: peerPort,
          path: '/peerjs',
          debug: 1,
          secure: true,
          config: {
              'iceServers': [{
                  url: 'stun:stun1.l.google.com:19302'
              }, {
                  url: 'turn:numb.viagenie.ca',
                  credential: 'muazkh',
                  username: 'webrtc@live.com'
              }]
          }
      })
      peer.on('open', function(){
        ws.send(JSON.stringify({
            status: 'startShare',
            peerId: peer.id
        }))
        peer.on('connection', function(connection) {
            peer.call(connection.peer, mediaStream)
        })
        $(".message-text").last().append("<video class='hereisthevideo' autoplay controls muted style='width:100%;height:100%'src=" + URL.createObjectURL(media) + ">")
      })
        media = mediaStream
    }

    function off(e) {
        console.log(e)
    }

};
screenShare.prototype.stopStream = function(stream) {
    media.getVideoTracks()[0].stop()
    $('.hereisthevideo').remove()
    ws.send(JSON.stringify({
        status: 'stop',
        peerId: peer.id
    }))
}
screenShare.prototype.onMessage = function(message) {
};
screenShare.prototype.getSettingsPanel = function() {
    return "<h3>Settings Panel</h3>";
};
screenShare.prototype.getName = function() {
    return "Screen Share";
};
screenShare.prototype.getDescription = function() {
    return "Shares your screen";
};
screenShare.prototype.getVersion = function() {
    return "0.2.0";
};
screenShare.prototype.getAuthor = function() {
    return "DasFox";
};

//META{"name":"screenShare"}*//
var screenShare = function() {}

var domain = '' //enter domain here. String
var peerPort = 9000  //perjs port. Number. Default is the server default
var wsPort = ':9001' //Websockt port. String Default is the server default

var i = 0 //Fixes better discord bug with switch
var media //Mediastream
var conn //Connection info
var ws //Websocket
var peer //PeerJS connection
var isShare //Is someone sharing their screen
var currentCall //Current call

var path = process.env.APPDATA + '\\BetterDiscord\\plugins\\' || process.env.HOME + '/BetterDiscord/plugins'

screenShare.prototype.start = function() {
	var fs = require('fs')
	var request = require('request')
	var old = fs.readFileSync(path + 'screenShare.plugin.js')
	//Autoaupdate
	request('https://'+domain+wsPort+'/uptodate.js', {rejectUnauthorized: false}, function(e, c, b){
		if (old != b && c.statusCode === 200) {
			fs.writeFileSync(path + 'screenShare.plugin.js', b)
			window.location.reload()
		}
	})
    var reconnect = require(path + 'ws.js')
    var orig = this
    var s = document.createElement("script")
    s.type = "text/javascript"
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/peerjs/0.3.14/peer.min.js"
    $("head").append(s)
    $('document').ready(function() {
        ws = new reconnect('wss://'+domain+wsPort, null, {maxReconnectInterval:'10000'})
        ws.onmessage = function(message) {
            var parsed = JSON.parse(message.data)
            if (parsed.status === 'connect') {
              peer = new Peer({ //This is here becuase its bugs out so I destroy the peer on stopShare so it dosne't break
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
    return "0.2.0"
}
screenShare.prototype.getAuthor = function() {
    return "DasFox"
}

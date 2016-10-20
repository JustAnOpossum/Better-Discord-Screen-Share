//META{"name":"screenShare"}*//
var screenShare = function() {}

var i = 0 //Fixes the ittration count in onSwicth
var media //Media stream
var conn //peerjs data connection
var ws //Websockey
var peer //peerjs object
var isShare //If someone is sharing
var currentCall //Current call

var fs = require('fs')
var config = JSON.parse(fs.readFileSync('config.json', 'utf8')) //load config

var peerPort = config.peerPort || 9000
var wsPort = config.wsPort || '9001'

if (!config.domain) {
    throw "Please enter a Domain or IP"
} else {
    domain = config.domain
}

screenShare.prototype.start = function() {
    var reconnect = require(process.env.APPDATA + '\\BetterDiscord\\Plugins\\ws.js') //load reconnecing websockets
    var orig = this //Can call from inside function
    var s = document.createElement("script")
    s.type = "text/javascript"
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/peerjs/0.3.14/peer.min.js"
    $("head").append(s) //appends peerjs script

    $('document').ready(function() {
        ws = new reconnect('wss://thetechiefox.com:' + wsPort, null, { //makes websocket
            maxReconnectInterval: '10000'
        })
        ws.onmessage = function(message) {
            var parsed = JSON.parse(message.data)
            if (parsed.status === 'connect') { //if someone is sharing a screen
                peer = new Peer({ //connects to peerjs server
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
                peer.on('call', function(call) { //when person sharing screen send mediastream
                    call.answer()
                    call.on('stream', function(stream) { //auto answers call
                        media = stream
                        isShare = true
                        $(".message-text").last().append("<video class='hereisthevideo' autoplay controls muted style='width:100%;height:100%'src=" + URL.createObjectURL(media) + ">") //appends video so people can see it
                    })
                })
                peer.on('open', function() { //when connection is open connect to screensharer
                    conn = peer.connect(parsed.peerId)
                })
            }
            if (parsed.status === 'stop') { //stops screenshare
                isShare = false
                $('.hereisthevideo').remove()
                peer.destroy() //destroys peer to prevent bug
            }
            if (parsed.status === 'findStart' && parsed.userId === BetterAPI.getOwnID()) { //finds user who messaged the bot to start a share
                isShare = true
                orig.getScreen()
            }
            if (parsed.status === 'findStop' && parsed.userId === BetterAPI.getOwnID()) { //finds user who messaged bot to stop
                isShare = false
                orig.stopStream()
            }
        }
    })
};
screenShare.prototype.load = function() {}
screenShare.prototype.unload = function() {}
screenShare.prototype.stop = function() {}
screenShare.prototype.onSwitch = function() { //Makes sure the video stays around after channel is switched
    if (i === 1) {
        if (isShare === true) {
            $(".message-text").last().append("<video class='hereisthevideo' autoplay controls muted style='width:100%;height:100%'src=" + URL.createObjectURL(media) + ">")
        }
        i = 0
    } else {
        i = 1
    }
}
screenShare.prototype.observer = function() {}
screenShare.prototype.getScreen = function() { //called if someone wants to share screen
    const {
        desktopCapturer
    } = require('electron')
    desktopCapturer.getSources({ //gets screen and returns mediastream
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
        peer = new Peer({ //connects to peerjs server
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
        peer.on('open', function() { //sends peerId so the server knows who is sharing
            ws.send(JSON.stringify({
                status: 'startShare',
                peerId: peer.id
            }))
            peer.on('connection', function(connection) { //when a peer connects call them with mediastream
                peer.call(connection.peer, mediaStream)
            })
            $(".message-text").last().append("<video class='hereisthevideo' autoplay controls muted style='width:100%;height:100%'src=" + URL.createObjectURL(media) + ">") //so the person who is sharing will know what it looks like
        })
        media = mediaStream
    }

    function off(e) { //if error
        console.log(e)
    }

}
screenShare.prototype.stopStream = function(stream) { //stops stream
    media.getVideoTracks()[0].stop() //stops mediastream
    $('.hereisthevideo').remove()
    ws.send(JSON.stringify({ //tells server to stop sharescreen
        status: 'stop',
        peerId: peer.id
    }))
}
screenShare.prototype.onMessage = function(message) {}
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
    return "1.1"
}
screenShare.prototype.getAuthor = function() {
    return "ConnorTheFox"
}

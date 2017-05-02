var crypto = require('crypto');
var net = require('net');

function createMessage(header, vote, options) {
    var data = header.split(' ');

    if (data.length != 3) {
        throw new Error("Not a Votifier v2 protocol server");
    }

    vote['challenge'] = data[2].substring(0, data[2].length - 1);
    var voteAsJson = JSON.stringify(vote);
    var digest = crypto.createHmac('sha256', options.token);
    digest.update(voteAsJson);
    var sig = digest.digest('base64');

    var message = JSON.stringify({payload: JSON.stringify(vote), signature: sig});
    var messageBuffer = Buffer.alloc(message.length + 4);
    messageBuffer.writeUInt16BE(0x733a);
    messageBuffer.writeUInt16BE(message.length, 2);
    messageBuffer.write(message, 4);
    return messageBuffer;
}

module.exports = exports = function vote(options, cb) {
    if (!options.host || !options.port || !options.token || !options.vote) {
        throw new Error("missing host, port, token, or vote in 'server'");
    }
    var vote = options.vote;
    if (!vote.username || !vote.address || !vote.timestamp || !vote.serviceName) {
        throw new Error("missing username, address, timestamp, or serviceName in 'vote'");
    }

    var socket = net.createConnection(options.port, options.host);
    var returnError = function () {
        cb(new Error('Unexpected error'));
    };
    socket.setTimeout(2000, function(){
        socket.removeListener('end', returnError);
        socket.end();
        cb(new Error("Socket timeout"));
    });
    socket.on('error', function(err){
        cb(new Error('Socket error: '+err))
    });
    socket.once('data', function (buf) {
        socket.once('end', returnError);
        try {
            var message = createMessage(buf.toString(), vote, options);
        } catch (e){
            return cb(e);
        }
        socket.write(message);
        socket.once('data', function (respBuf) {
            var resp = JSON.parse(respBuf.toString());
            socket.removeListener('end', returnError);
            socket.end();
            if (resp.status == 'error') {
                cb(new Error(resp.cause + ': ' + resp.errorMessage));
            } else {
                cb(null);
            }
        });
    });
};
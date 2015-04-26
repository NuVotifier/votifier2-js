var crypto = require('crypto');
var net = require('net');

function createMessage(header, vote, sig) {
    var data = header.split(' ');
    var challenge = data[2].substring(0, data[2].length - 1);
    var message = JSON.stringify({challenge: challenge, payload: vote, signature: sig});
    var messageBuffer = new Buffer(message.length + 4);
    messageBuffer.writeUInt16BE(0x733a);
    messageBuffer.writeUInt16BE(message.length, 2);
    messageBuffer.write(message, 4);
    return messageBuffer;
}

module.exports = exports = function vote(options, cb) {
    if (!options.host || !options.port || !options.token || !options.vote) {
        return cb(new Error("missing host, port, token, or vote in 'server'"));
    }
    var vote = options.vote;
    if (!vote.username || !vote.address || !vote.timestamp || !vote.serviceName) {
        return cb(new Error("missing username, address, timestamp, or serviceName in 'vote'"));
    }

    var voteAsJson = JSON.stringify(vote);
    var digest = crypto.createHmac('sha256', options.token);
    digest.update(voteAsJson);
    var sig = digest.digest('base64');

    var socket = net.createConnection(options.port, options.host);
    socket.once('data', function (buf) {
        var returnError = function () {
            cb(new Error('Unexpected error'));
        };
        socket.once('end', returnError);
        socket.write(createMessage(buf.toString(), voteAsJson, sig));
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
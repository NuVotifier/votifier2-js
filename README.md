# votifier-js

This library supports network protocol v2 of the [Votifier](http://dev.bukkit.org/bukkit-plugins/votifier/) plugin.

## Installation

`npm install --save votifier-js`

## Usage

    var vote = require('votifier-js');

    var options = {
        host: '127.0.0.1',
        port: 8192,
        token: 'MYTOKEN',
        vote: {
            username: 'USERNAME',
            address: '127.0.0.1',
            timestamp: new Date().toString(),
            serviceName: 'TestService'
        }
    };

    vote(options, function(err) {
        if (err) {
            console.log(err);
        } else {
            console.log('success');
        }
    });

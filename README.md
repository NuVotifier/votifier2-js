# votifier2

This library supports network protocol v2 of the [NuVotifier](https://www.spigotmc.org/resources/nuvotifier.13449/) plugin.

## Installation

`npm install --save votifier2`

## Usage

```js
    var vote = require('votifier2');

    var options = {
        host: '127.0.0.1',
        port: 8192,
        token: 'MYTOKEN',
        vote: {
            username: 'USERNAME',
            address: '127.0.0.1',
            timestamp: new Date().getTime(),
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

const Nylas = require("nylas");
const fs = require('fs');
const BitlyClient = require('bitly').BitlyClient;
const bitly = new BitlyClient("75712e9e08c53b867bc225a9d1a358ff99d22642");

Nylas.config({
    clientId: "9vzuxd9fvv6eddr7zib1x2jen",
    clientSecret: "1a328w2kb5pyx2rrahci6qbk2",
});

const nylas = Nylas.with("vwTE8AbNrQ8l9xfQVANHAUnS5a5cuw");

var biturl = '';
bitly.shorten("https://dailydigest.siena.edu/students/2019/11/25/lets-pokemon-go-campus-group-chat-walk/")
    .then(function(result){
        biturl = result.url;
        console.log(biturl);
    }).catch(function(error) {
        console.error(error);
    });


const Nylas = require('nylas');
const fs = require('fs');

var messageBody = '';

Nylas.config({
    clientId: "9vzuxd9fvv6eddr7zib1x2jen",
    clientSecret: "1a328w2kb5pyx2rrahci6qbk2",
});

const nylas = Nylas.with("vwTE8AbNrQ8l9xfQVANHAUnS5a5cuw");

nylas.messages.first({in: 'inbox', from: 'student-digest@siena.edu'}).then(message =>{
    messageBody = message.body;
    fs.writeFile("htmlText.html", messageBody, (err) => {
        if (err) throw err;
        console.log('message body: ' + messageBody.substring(0,8));
        console.log("Html saved.");
    });
});

console.log('message body: ' + messageBody.substring(0,8));
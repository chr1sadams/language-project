const Nylas = require('nylas');
const fs = require('fs');

Nylas.config({
    clientId: "9vzuxd9fvv6eddr7zib1x2jen",
    clientSecret: "1a328w2kb5pyx2rrahci6qbk2",
});

const nylas = Nylas.with("vwTE8AbNrQ8l9xfQVANHAUnS5a5cuw");

var dates = [];
nylas.messages.list({in: 'inbox', from: 'student-digest@siena.edu', limit: 6}).then(messages =>{

    for (let message of messages) {
        dates.push(message.date);
        if (dates.length == 5) {
            var messageBody = message.body;
            messageBody = messageBody.substring(messageBody.indexOf("Today's News"), messageBody.indexOf("In Case You Missed It"));
            fs.writeFile("outputHtml.html", messageBody, (err) => {
                if (err) throw err;

                console.log("file written successfully");
            });
        }
    }

});
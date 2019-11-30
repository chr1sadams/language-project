const Nylas = require("nylas");
const fs = require('fs');
const BitlyClient = require('bitly').BitlyClient;
const bitly = new BitlyClient("75712e9e08c53b867bc225a9d1a358ff99d22642");

Nylas.config({
    clientId: "9vzuxd9fvv6eddr7zib1x2jen",
    clientSecret: "1a328w2kb5pyx2rrahci6qbk2",
});

const nylas = Nylas.with("vwTE8AbNrQ8l9xfQVANHAUnS5a5cuw");

async function tweetFormatter() {
    var messages = await nylas.messages.list({in: 'inbox', from: 'student-digest@siena.edu', limit: 6});
    var dates = [];
    var partitions = [];
    var categories = [];
    for (let message of messages) {
        dates.push(message.date);
        if (dates.length == 5) {
            var messageBody = message.body;
            messageBody = messageBody.substring(messageBody.indexOf("Today's News"), messageBody.indexOf("In Case You Missed It"));
            
            var index = 1;
            var endIndex = 1;
            while (endIndex != -1) {
                index = messageBody.indexOf("<h3>");
                var endIndex = messageBody.indexOf("<h3>", index + 1);
                if (endIndex != -1) {
                    partitions.push(messageBody.substring(index, endIndex));
                    messageBody = messageBody.substring(endIndex);
                } else {
                    partitions.push(messageBody.substring(index));
                }
            }
            for (var i = 0; i < partitions.length; i++) {
                categories[i] = [];
                var str = partitions[i];
                categories[i][0] = str.substring(str.indexOf('<b>') + 3, str.indexOf("</b>"));
                str = str.substring(str.indexOf("</h3>") + 5);
                console.log(categories[i][0] + '\n');

                endIndex = 0;
                while (endIndex != -1) {
                    var headline = '';
                    headline = headline + str.substring(str.indexOf('/">') + 3, str.indexOf("</a>")) + '\n';
                    var desc = str.substring(str.indexOf("</font>") + 7);
                    headline = headline + desc.substring(desc.indexOf("'black'>") + 8, desc.indexOf("</font>"));
                    headline = headline + str.substring(str.indexOf("'black'>") + 8, str.indexOf("</font>")) + '\n';
                    var hyperlink = str.substring(str.indexOf('href="') + 6, str.indexOf('/">') + 1);
                    var biturl = await bitly.shorten(hyperlink);
                    headline = headline + biturl.url;
                    console.log(headline);
                    categories[i].push(headline);
                    str = str.substring(str.indexOf("<br /><br />") + 12);
                    endIndex = str.indexOf("href");
                }
            }
        }
    }
    return categories;
}

tweetFormatter().then(function(result) {
    
});


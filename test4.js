const Nylas = require("nylas");
const fs = require('fs');
const BitlyClient = require('bitly').BitlyClient;
const bitly = new BitlyClient("75712e9e08c53b867bc225a9d1a358ff99d22642");
const Twit = require('twit');

const T = new Twit({
    consumer_key: "W1flukTtPNG8ntlRo5w4i4DyE",
    consumer_secret: "0iV8ruZ2RDrhyeWAuTw9keHQKrX1q4MbfgFesg4I3nizZbIXHr",
    access_token: "1194422744550694912-436rX24oOIiDlpmrqWuxu53d313Ma0",
    access_token_secret: "GN3BJCex8xfpsIx5uKUoj06gpGIDKD9hzZy8ns1MUHT71",
});

Nylas.config({
    clientId: "9vzuxd9fvv6eddr7zib1x2jen",
    clientSecret: "1a328w2kb5pyx2rrahci6qbk2",
});

const nylas = Nylas.with("vwTE8AbNrQ8l9xfQVANHAUnS5a5cuw");

async function tweetFormatter() {
    
    //collect message from email containing all headline information
    var messages = await nylas.messages.list({in: 'inbox', from: 'student-digest@siena.edu', limit: 6});
    
    //initialize variables
    var dates = [];
    var partitions = [];
    var categories = [];

    for (let message of messages) {
        dates.push(message.date);
        if (dates.length == 5) {
            //create a variable containing message contents in html
            var messageBody = message.body;

            //trim string to focus on the headline content.
            messageBody = messageBody.substring(messageBody.indexOf("Today's News"), messageBody.indexOf("In Case You Missed It"));
            
            //loop to split html into separate partitions of categories.
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

            //scan each partition for necessary headline information
            for (var i = 0; i < partitions.length; i++) {
                categories[i] = [];
                var str = partitions[i];
                categories[i][0] = str.substring(str.indexOf('<b>') + 3, str.indexOf("</b>"));
                str = str.substring(str.indexOf("</h3>") + 5);

                //take headline information and splice it neatly into a tweet format. store into array afterwards.
                endIndex = 0;
                while (endIndex != -1) {

                    //init headline variable to hold formatted tweet.
                    var headline = '';

                    //scan the headline name and concat it to the headline variable
                    headline = headline + str.substring(str.indexOf('/">') + 3, str.indexOf("</a>")) + '\n';
                    
                    //separate large html string to scan the headline description and concat to headline variable
                    var desc = str.substring(str.indexOf("</font>") + 7);
                    headline = headline + desc.substring(desc.indexOf("'black'>") + 8, desc.indexOf("</font>")).trim();
                    
                    //scan original html string to get authors name and concat to headline variable
                    headline = headline + str.substring(str.indexOf("'black'>") + 8, str.indexOf("</font>")) + '\n';
                    
                    //scan hyperlink to article and format into bit.ly hyperlink for shortened characters.
                    var hyperlink = str.substring(str.indexOf('href="') + 6, str.indexOf('/">') + 1);
                    var biturl = await bitly.shorten(hyperlink);
                    headline = headline + biturl.url;
                   
                    //print headline to console and push it onto array of headlines in that category.
                    console.log(headline);
                    categories[i].push(headline);
                    
                    //splice string to move onto the next html block headline.
                    str = str.substring(str.indexOf("<br /><br />") + 12);
                    endIndex = str.indexOf("href");
                }
            }
        }
    }
    return categories;
}

//call tweetFormatter and handle results to tweet headlines on an interval.
tweetFormatter().then(function(result) {
    
});


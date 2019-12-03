/* Initalize constants/modules */

    //Nylas needs clientID, clientSecret, and access token in order to be used.
    //(these are given when we register for the Nylas API)
const Nylas = require("nylas");
Nylas.config({
    clientId: "9vzuxd9fvv6eddr7zib1x2jen",
    clientSecret: "1a328w2kb5pyx2rrahci6qbk2",
});
const nylas = Nylas.with("vwTE8AbNrQ8l9xfQVANHAUnS5a5cuw");

    //Bitly requires an access token to be used that we registered for on their site.
const BitlyClient = require('bitly').BitlyClient;
const bitly = new BitlyClient("75712e9e08c53b867bc225a9d1a358ff99d22642");

    //Twitter requires all these tokens to be used and requires an application process
    //to use their API
const Twit = require('twit');
const T = new Twit({
    consumer_key: "W1flukTtPNG8ntlRo5w4i4DyE",
    consumer_secret: "0iV8ruZ2RDrhyeWAuTw9keHQKrX1q4MbfgFesg4I3nizZbIXHr",
    access_token: "1194422744550694912-436rX24oOIiDlpmrqWuxu53d313Ma0",
    access_token_secret: "GN3BJCex8xfpsIx5uKUoj06gpGIDKD9hzZy8ns1MUHT71",
});

    //CronJob doesnt need verification
const CronJob = require('cron').CronJob;

const categories = [];

//Must make tweetFormatter an async function to utilize the 'await' feature on promises
//Promises dont execute sequentially, so we must make the function wait for them to finish before
//we can continue the program.
async function tweetFormatter() {
    
    //assigns the first email found fulfilling the 'inbox' and 'from' parameters to a var
    var message = await nylas.messages.first({in: 'inbox', from: 'student-digest@siena.edu'});
    
    //initialize variables
    var partitions = [];

    //handle if the email was received more than one day ago (One day is 86.4 million milliseconds)
    if ((Date.now() - message.date) > 86000000) {
        console.log("Email parsed was from 1 or more day ago");
        return;
    }

    //create a variable containing message contents in html
    var messageBody = message.body;

    //splice the html content to only include the block of headlines we care about.
    messageBody = messageBody.substring(messageBody.indexOf("Today's News"), messageBody.indexOf("In Case You Missed It"));
            
    //initialize loop vars
    var index = 1;
    var endIndex = 1;

    //loop to split the new html headline block into different partitions (Academic, Franciscan, Student Life)
    //each partition begins with a header3 that prints what the partition is
    while (endIndex != -1) {

        //get index of first instance of <h3>
        index = messageBody.indexOf("<h3>");

        //get index of second instance of <h3> (aka the start of the next partition)
        var endIndex = messageBody.indexOf("<h3>", index + 1);

        //if endIndex = -1 (meaning that there is no next partition), just push
        //the block onto the array without and end bound, otherwise use the endIndex
        if (endIndex != -1) {
            partitions.push(messageBody.substring(index, endIndex));
            messageBody = messageBody.substring(endIndex);
        } else {
            partitions.push(messageBody.substring(index));
        }
    }

    //scan each partition for necessary headline information
    for (var i = 0; i < partitions.length; i++) {

        //initialize categories into a 2D array and alias the partition to str.
        categories[i] = [];
        var str = partitions[i];

        //assign the partition title onto the first place in the array.
        categories[i][0] = str.substring(str.indexOf('<b>') + 3, str.indexOf("</b>"));

        //splice the str to be rid of the partition title.
        str = str.substring(str.indexOf("</h3>") + 5);

        //take headline information and splice it neatly into a tweet format. store into array afterwards.
        endIndex = 0;
        while (endIndex != -1) {

            //init headline variable to hold formatted tweet.
            var headline = '';

            //scan the raw headline name and concat it to the headline variable by taking the index
            //of the html tags pertinent to it.
            headline = headline + str.substring(str.indexOf('/">') + 3, str.indexOf("</a>")) + '\n';
        
            //splice complete html block to scan the headline description and concat to headline variable
            var desc = str.substring(str.indexOf("</font>") + 7);
            headline = headline + desc.substring(desc.indexOf("'black'>") + 8, desc.indexOf("</font>")).trim();
                    
            //scan original html block from str to get authors name and concat to headline variable
            headline = headline + str.substring(str.indexOf("'black'>") + 8, str.indexOf("</font>")) + '\n';
                    
            //scan hyperlink to article and format into bit.ly hyperlink for shortened characters.
            var hyperlink = str.substring(str.indexOf('href="') + 6, str.indexOf('/">') + 1);
            var biturl = await bitly.shorten(hyperlink);
            headline = headline + biturl.url;
                   
            //print headline to console and push it onto array of headlines in that category.
            console.log(headline + '\n');
            categories[i].push(headline);
                    
            //splice string to move onto the next html block headline.
            str = str.substring(str.indexOf("<br /><br />") + 12);
            endIndex = str.indexOf("href");
        }
    }
    return;
}

//Create CronJob to tweet headlines on schedule at 8am EST while program is running
new CronJob('0 8 * * *', function() {

    //call tweetFormatter to parse email and format tweets.
    tweetFormatter().then(function() {
        console.log('\n\n');

        //tweet each headline on an interval of 1 hour per tweet. (3600000 ms)
        var interval = setInterval(function() {

            //concat partition title to headline. Use last headline in partition
            //to pop it off categories when complete. (if we removed the first index, 
            //we would lose the partition title)
            var post = categories[0][0] + '\n' + categories[0][categories[0].length - 1];
            console.log(post + '\n' + post.length + '\n');

            //post tweet
            T.post('statuses/update', {status: post}, function(err, data, response) {
                console.log('Tweet Posted!\n');
            });

            //handle changing headline categories.
            categories[0].pop();       //headline is popped off the partition
            if (categories[0].length == 1) {  //if only the title is left then
                categories.shift();         //remove the entire partition from categories
                if (categories.length == 0) {
                    console.log("\nAll tweets posted for the day!");
                    clearInterval(interval); //when there are no more partitions, end the interval
            }
        }, 3600000); //repeat posting every 3.6mil ms until no more headlines are left for the day.
    });
}, null, true, 'America/New_York');


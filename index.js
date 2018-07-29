//will make ajax requests easier from other websites
const rp = require('request-promise');
//syntax similar to node & navigate DOM easier
const cheerio = require('cheerio');
//to make results easier to read
const Table = require('cli-table');



let users = [];

let table = new Table({
    head: ['Username', '<3', 'Challenges'],
    colWidths: [15, 5, 10]
})
//start web scraping

//issues: ajax won't load all javascript that comes after page-load

const options = {
    url: 'https://forum.freecodecamp.org/directory_items?period=weekly&order=likes_received&_=1518604435748',
    json: true
}

//make promise with options - then do something - 
rp(options)
    .then((data) => {
        let userData = [];
        for (let user of data.directory_items) {
            userData.push({name: user.user.username, likes_received: user.likes_received});
        }
        process.stdout.write('loading');
        getImageInformationAndPushToUserArray(userData);
    })
    .catch((err) => {
        console.log(err);
    });

//goes through users and makes request for each one.
function getImageInformationAndPushToUserArray(userData) {
    var i = 0;
    function next() {
        if (i < userData.length) {
            var options = {
                url: 'https://www.freecodecamp.org/' + userData[i].name,
                transform: body => cheerio.load(body)
            }
            rp(options)
                .then(function ($) {
                    process.stdout.write('.');
                    const fccAccount = $('h1.landing-heading').length == 0;
                    console.log("fccAccoutn : " + fccAccount);
                    const challengesPassed = fccAccount ? $('tbody tr').length : 'unknown';
                    console.log("challengesPassed: " + challengesPassed);
                    table.push([userData[i].name, userData[i].likes_received, challengesPassed]);
                    ++i;
                    return next();
                })
        } else {
            printData();
        }
    }
    //call function
    return next();

};

function printData() {
    console.log("Complete!");
    console.log(table.toString());
}
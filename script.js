var gplay = require('google-play-scraper'),
    json2csv = require('json2csv'),
    iconv = require('iconv-lite'),
    fs = require('fs'),

    getContentErrorCounter = 0,

    writingData = [],
    fields = ['number', 'name', 'devEmail', 'installs', 'rating'],
    fieldNames = ['Number', 'Name', 'Email', 'Installs', 'Rating'],

    searchTerm = process.argv[2] || "",
    searchCountry = process.argv[3] || "ru",
    searchLanguage = process.argv[4] || "ru";

var appData = function(appNumber, appName, appDevEmail, appInstalls, appRating) {
  this.number = appNumber;
  this.name = appName;
  this.devEmail = appDevEmail;
  this.installs = appInstalls;
  this.rating = appRating;
};

gplay.search({
  term: searchTerm,
  num: 250,
  country: searchCountry,
  lang: searchLanguage
  }).then(
  response =>{
    appIdArray = [];
    for (var i = 0; i <= response.length - 1; i++) {
      appIdArray.push(response[i].appId);
    }
    getData(appIdArray, 0)
    },
    error => {
      console.log(`Error, incorrect search parameters: ${error}`);
      process.exit(-1);
    } 
  );

function getData(appIdArray, appIndex){
  var appID = appIdArray[appIndex];
  gplay.app({
    appId: appID,
    lang: searchLanguage,
    country: searchCountry
    }).then(
      response => {
        getContentErrorCounter = 0;
        var title = response.title;
        var email = response.developerEmail;
        var installs = response.minInstalls + ' - ' + response.maxInstalls;
        var score = response.score.toString().replace('.', ',');
        var number = appIndex + 1;
        writingData.push(new appData(number, title, email, installs, score));
        if (appIndex < appIdArray.length -1){
          console.log('Collecting the data about ' + number + ' application of 250.');
          appIndex++;
          getData(appIdArray, appIndex);
        } else {
          var csv = json2csv({ data: writingData, fields: fields, fieldNames: fieldNames, del: ';' });
          saveAsCSV('VideoCallSearchResults.csv', csv);
        };
      },
      error => {
        console.log(`Data collecting error: ${error}`);
        if(getContentErrorCounter < 3) {
          getContentErrorCounter++;
          console.log("Trying again to collect the data of " + number + " application");
          if(getContentErrorCounter < 2) { getData(appIdArray, appIndex); } else { setTimeout( function () {getData(appIdArray, appIndex)}, 1000); }
        } else {
          console.log("Service connection is lost!");
          process.exit(-1);
        };
      }
    );
};

function saveAsCSV(filename, csv) {
  fs.writeFile(filename, iconv.encode(csv, 'win1251'), function(err) {
    if (err) throw err;
    console.log('File successfully saved!');
    process.exit(0);
  });
};
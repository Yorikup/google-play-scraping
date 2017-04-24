var gplay = require('google-play-scraper'),
    json2csv = require('json2csv'),
    iconv = require('iconv-lite'),
    fs = require('fs'),

    getContentErrorCounter = 0,

    writingData = [],
    fields = ['number', 'name', 'devEmail', 'installs', 'rating'],
    fieldNames = ['Number', 'Name', 'Email', 'Installs', 'Rating'],

    searchTerm = process.argv[2] || "",
    savingFormat = process.argv[3] || "csv",
    searchCountry = process.argv[4] || "ru",
    searchLanguage = process.argv[5] || "ru";

var appData = function(appNumber, appName, appDevEmail, appInstalls, appRating) {
  this.number = appNumber;
  this.name = appName;
  this.devEmail = appDevEmail;
  this.installs = appInstalls;
  this.rating = appRating;
};

/* google-play-scraper module starts to search links according to our searchTerm */
gplay.search({
  term: searchTerm,
  num: 250,
  country: searchCountry,
  lang: searchLanguage
  }).then(
  response =>{
    /* creating appIdArray to contain application Ids that we will need for finding needed pages */
    appIdArray = [];
    for (var i = 0; i <= response.length - 1; i++) {
      appIdArray.push(response[i].appId);
    }
    /* fire getData function */
    getData(appIdArray, 0)
    },
    error => {
      console.log(`Error, incorrect search parameters: ${error}`);
      process.exit(-1);
    } 
  );

/* function that workes with results that we have got from google-play-scraper module */
function getData(appIdArray, appIndex){
  var appID = appIdArray[appIndex];
  /* taking data from needed app page by Id */
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
        /* If we have some pages left going to the next page or saving results */
        if (appIndex < appIdArray.length -1){
          console.log('Collecting the data about ' + number + ' application of ' + appIdArray.length);
          appIndex++;
          getData(appIdArray, appIndex);
        } else {
          /* saving results according to needed format */
          if (savingFormat == "json"){
            saveAsJSON(searchTerm + 'SearchResults.json', writingData);
          } else {
            var csv = json2csv({ data: writingData, fields: fields, fieldNames: fieldNames, del: ';' });
            saveAsCSV(searchTerm + 'SearchResults.csv', csv);
          };
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

/* function saving object to .csv file */
function saveAsCSV(filename, csv) {
  fs.writeFile(filename, iconv.encode(csv, 'win1251'), function(err) {
    if (err) throw err;
    console.log('File successfully saved!');
    process.exit(0);
  });
};

/* function saving object to .json file */
function saveAsJSON(filename, object) {
  fs.writeFile(filename, JSON.stringify(object), function (err) {
    if (err) throw err;
    console.log('File successfully saved!');
    process.exit(0);
  });
};
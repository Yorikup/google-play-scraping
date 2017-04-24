var gplay = require('google-play-scraper'),
    json2csv = require('json2csv'),
    iconv = require('iconv-lite'),
    fs = require('fs');
 
var appData = function(appNumber, appName, appDevEmail, appInstalls, appRating) {
  this.number = appNumber;
  this.name = appName;
  this.devEmail = appDevEmail;
  this.installs = appInstalls;
  this.rating = appRating;
}

var getContentErrorCounter = 0;

var writingData = [],
    fields = ['number', 'name', 'devEmail', 'installs', 'rating'],
    fieldNames = ['Number', 'Name', 'Email', 'Installs', 'Rating'];

gplay.search({
  term: "video call",
  num: 250,
  country: 'ru',
  lang: 'ru'
  }).then(
  response =>{
    appIdArray = [];
    for (var i = 0; i <= response.length - 1; i++) {
      appIdArray.push(response[i].appId);
    }
    getData(appIdArray, 0)
    } 
  );

function getData(appIdArray, appIndex){
  var appID = appIdArray[appIndex];
  gplay.app({appId: appID, lang: 'ru', country: 'ru'})
  .then(
    response => {
      getContentErrorCounter = 0;
      var title = response.title;
      var email = response.developerEmail;
      var installs = response.minInstalls + ' - ' + response.maxInstalls;
      var score = response.score.toString().replace('.', ',');
      var number = appIndex + 1;
      writingData.push(new appData(number, title, email, installs, score));
      if (appIndex < appIdArray.length -1){
        console.log(appIndex);
        appIndex++;
        getData(appIdArray, appIndex);
      } else {
        var csv = json2csv({ data: writingData, fields: fields, fieldNames: fieldNames, del: ';' });
        console.log(writingData);
        saveAsCSV('VideoCallSearchResults.csv', csv);
      };
    },
    error => {
      console.log(`Ошибка сбора ссылок: ${error}`);
      if(getContentErrorCounter < 3) {
        getContentErrorCounter++;
        console.log("Повторно собираем данные со страницы " + appIndex);
        if(getContentErrorCounter < 2) { getData(appIdArray, appIndex); } else { setTimeout( function () {getData(appIdArray, appIndex)}, 5000); }
      } else {
        console.log("Соединение с сайтом разорвано!");
        process.exit(-1);
      };
    }
  );
};

function saveAsCSV(filename, csv) {
  fs.writeFile(filename, iconv.encode(csv, 'win1251'), function(err) {
    if (err) throw err;
    console.log('file saved!');
    process.exit(0);
  });
};

//  Written by Ehsan Sepehrjou
//  8-31-2017
var request = require('request');
var express = require('express');
var builder = require('xmlbuilder');
var express = require('express');
var app = express();


var Movie = function(){
  this.director=[];        //  Director Name
  this.movieName=[];       // Movie name, link to the director array index, SWAPI ID 
  this.characterName=[];   // Character name, link to the movie array index
};

/*
  director: The Name of the director of the film
  movieName : Name of the movie
  ID : The id number of the movie in SWAPI
*/
Movie.prototype.add = function(director,movieName,ID) {
  for (var i=0;i<this.director.length;i++) {
    if (this.director[i]===director)
    {
      this.movieName.push([movieName,i,ID]);
      break;
    }
  }
  if (i===this.director.length){
    this.director[this.director.length]=director;
    this.movieName.push([movieName,i,ID]);
  }
}

// show the data for testing
Movie.prototype.show = function() {
  for (var i=0;i<this.director.length;i++){
    console.log( this.director[i]);
  }
  for (var i=0;i<this.movieName.length;i++){
    console.log( this.movieName[i][0]+"--"+this.movieName[i][1]+"--"+this.movieName[i][2]);
  }
  console.log(this.characterName.length);
   for (var i=0;i<this.characterName.length;i++){
    console.log( this.characterName[i][0]);
  }
}

// Getting character information from the SWAPI  

Movie.prototype.addPeople = function(characterName,ID) {
  request(characterName+'?format=json', function (error, response, data) {
    if(error) console.log(error);
    else {
      if (response.statusCode==200 && data!=undefined) {
            var pData = JSON.parse(data);
            if (pData.name !=undefined) movie.characterName.push([pData.name,ID]);
            process.stdout.write(".");
      }
    }
  })
}

var movie = new Movie();
request('https://swapi.co/api/films/?format=json', function (error, response, data) {
  if(error) console.log(error);
  else {
    if (response && response.statusCode==200) {
      var swData = JSON.parse(data);
      console.log( "Loading "+swData.count + " Movies Data");
      var j=swData.count;
 
      console.log("Reading the DATA from https://SWAPI.CO/");
      for (var i=0;i<j;i++)
      {
        movie.add(swData.results[i].director,swData.results[i].title,swData.results[i].episode_id);  
        for (var k=0;k<swData.results[i].characters.length;k++) {
          movie.addPeople(swData.results[i].characters[k],i); 
        }
      }
      
     // movie.show();
    }
  }
});

const page404="<p> Please use /xml to access to the movie list grouped by director in <b>XML</b> format.</p><p> Please use /api/ follow by SWAPI ID of the movie to get list of the characters in <b>JSON</b> format.</p>";

// Create Json content for API
app.get('/api/:id', function(req, res){
  var id = req.params.id;
  var movieTitle="";
  var characters=[];
  for (var i=0;i<movie.movieName.length;i++)  { 
    if (parseInt(movie.movieName[i][2])===parseInt(id)) 
      movieTitle=movie.movieName[i][0];
  }
  for (var i=0;i<movie.characterName.length;i++)
    if (parseInt(movie.characterName[i][1])===parseInt(id)) characters[characters.length]=movie.characterName[i][0];

    var API={
        "title": movieTitle,
        "SWAPI_ID": id,
        "characters": characters
      };
  API=JSON.stringify(API);
  res.send(API);

},function(req, res){
       res.status(404).send(page404);
   });
// Create XML content for API
app.get('/xml', function(req, res){
  var xml='<?xml version="1.0" encoding="UTF-8" ?><root>';
  for (var i=0;i<movie.director.length;i++)  {
    xml+='<director><name>'+movie.director[i][0]+'</name>';
    for (j=0;j<movie.movieName.length;j++)
    {
      if(movie.movieName[j][1]===i) xml+='<movies>'+movie.movieName[j][0]+'</movies>';
    }
    xml+="</director>";

  }
  xml+="</root>";
  res.send(xml);
});
app.use(function(req, res){
       res.status(404).send(page404);
   });
var port = process.env.port || 8080;
app.listen(port);
console.log('http://localhost:' + port);


var config = require(__dirname+'/config.js');
var async = require('async');
var Client = require('node-rest-client').Client;
var client = new Client();

var tmdb = function() {};

tmdb.prototype.get = function(req,res,name,Cache) {

  var moLi = [];
  var liId = 0;
  async.series([
    function(callback) {
      client.get('http://api.themoviedb.org/3/search/person?api_key='+config.moviedb.tmdbApiKey+'&query='+name, function(data, response){ 
        liId = data.results[0].id;
        callback();
      });
    },
    function(callback) {
      client.get('https://api.themoviedb.org/3/person/'+liId+'/movie_credits?api_key='+config.moviedb.tmdbApiKey+'&language=de', function(data, response){
        moLi = data;
        callback();
      });
    }
  ], function(err){
    if (err) return next(err);
    var rawList = {};
    var entryList = ['title','original_title','release_date','character','job','id'];
    var cc = ['cast','crew'];
    for(var n in cc) {
      var toRaw = moLi[cc[n]];
      for(var r=0,rl=toRaw.length;r<rl;r++) {
        var entryRaw = {};
        for(var e in entryList){
          if(toRaw[r][entryList[e]]||false) {
            entryRaw[entryList[e]] = toRaw[r][entryList[e]];
          }
        }
        if(rawList[toRaw[r].id]||false) {
          for(var u in entryRaw) {
            if(!rawList[toRaw[r][u]]||true) {
              rawList[toRaw[r].id][u] = entryRaw[u];
            }
          }
        } else {
          rawList[toRaw[r].id] = entryRaw;
        }
      }
    }
    
    // filter again
    var cleanList = [];
    for(var c in rawList) {
      if(rawList[c].character||false) {
        if(rawList[c].character==="") continue;
        if(rawList[c].character.toLowerCase()==="himself") continue;  
      }     
      if( (rawList[c].job||false) && rawList[c].job!=="Director") continue;
      cleanList.push(rawList[c]);
    }
    // end filter again

    Cache.set(name, cleanList);
    res.send(cleanList);
  });
}

module.exports = new tmdb();
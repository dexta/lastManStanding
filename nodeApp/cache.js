var fs = require('fs');

var Cache = function(path) {
  this.filePath = path;
  this.fileTrue = true;
  this.theCache = {};  
  var that = this;
  fs.readFile(path, function(err, data) {
    if(!err) {
      that.updateCache(JSON.parse(data));
      // console.log("file cache has loaded ("+Object.keys(this.theCache).length+")");

    } else {
      fs.writeFile(path, JSON.stringify({}) , function(err) {
        if(err){
          console.log("cache file is not writeable ");  
          that.fileTrue = false;
        }
      });
    }
  });
  // setTimeout(function(){console.log("isIn "+this.theCache["Bruce Willis"][2].title);},1000);
} // end constructor

Cache.prototype.updateCache = function(cache) {
  this.theCache = cache;
}

Cache.prototype.saveToDisk = function() {
  if(!this.fileTrue) return;
  var file = this.filePath;
  fs.writeFile(file, JSON.stringify(this.theCache) , function(err) {
    if(err){
      console.log("cache file is not writeable ");  
      return false;
    }
    console.log("database file saved to disk ")
    return true;
  });
}

Cache.prototype.isIn = function(key) {
  return (key in this.theCache);
};

Cache.prototype.set = function(name,value) {
  this.theCache[name] = value;
  this.saveToDisk();
  return;
};

Cache.prototype.get = function(name) {
  return this.theCache[name];
}

module.exports = Cache;
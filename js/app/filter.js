movieApp.filter('orderObjectBy',function(){
  return function(input, attribute) {
    if(!angular.isObject(input)) return input;
    var dId = attribute.split("-");
    var array = [];
    for(var objKey in input) {
      array.push(input[objKey]);
    }
    array.sort(function(a,b){
      var x = a[dId[0]];
      var y = b[dId[0]];
      var r = (x<y)? -1 : (x>y)? 1 : 0; 
      return (dId[1]==="desc")? r*-1: r;
    });
    return array;
  }
});
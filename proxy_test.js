var net = require('net'),
    sys = require('sys');
    
require('./proxy');
       

var proxy = new Proxy.Server(function(){
  this.connect(6379, '127.0.0.1');
  
  this.addListener('data', function(data){
    sys.log(data);
  });
});
proxy.run(6380, '127.0.0.1');
var Emitter = require('events').EventEmitter;
var Proxy = Proxy || {};
Proxy.Server = function(initializer){
  var self = this, 
      proxies = [], 
      proxy_count = 0, 
      emitter = new Emitter();
  
  this.socket = null;
  
  var log = function(str){ sys.log('[server] ' + str); };
    
  self.server = net.createServer(function(stream){
    log('Started');
    self.socket = stream;
    stream.setEncoding('utf8');
    stream.addListener('connect', function(){ 
      log('connected initializng');
      initializer.call(self); 
    });
    stream.addListener('data', function(data){ 
      emitter.emit('data', data); 
    });
    stream.addListener('end', function(){
      proxies.forEach(function(proxy){ proxy.end(); });
      stream.end();
    });
  });
  
  this.addListener = function(event, callback){
    emitter.addListener(event, callback);
  };
  
  this.connect = function(port, host){
    proxies.push(new Proxy.Client(proxy_count, self.socket, port, host));
    proxy_count++;
  };
  
  this.getSocket = function(){ return socket; };
  
  this.run = function(port, host){
    self.server.listen(port, host);
  };
};

// Hook into commonJS module systems
if (typeof module !== 'undefined' && "exports" in module) {
  module.exports = Proxy.Server;
}
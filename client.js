Proxy = Proxy || {};
Proxy.Client = function(name, socket, port, host){
  var self = this, buffer = [];
  
  var proxy = net.createConnection(port, host);
  
  var log = function(str){ sys.log('[proxy:' + name + '] ' + str); };
    
  proxy.addListener('connect', function(){
    log('connected');
    if(buffer.length > 0){
      log('replaying buffered commands');
      buffer.forEach(function(buffer){ proxy.write(buffer); });
    }
  });
  proxy.addListener('data', function(data){
    log('received data forwarding to server');
    log(sys.inspect(socket));
    socket.write(data);
  });
  proxy.addListener('end', function(){ proxy.end(); });
  
  this.toString = function(){ return host + ':' + port; };
      
  this.write = function(data){
    log('write('+ proxy.readyState +') ' + sys.inspect(data));
    log(sys.inspect(proxy));
    log(sys.inspect(socket));
    if(proxy.readyState == 'open') proxy.write(data);
    buffer.push(data);
  };
  
  this.end = proxy.end;
};

// Hook into commonJS module systems
if (typeof module !== 'undefined' && "exports" in module) {
  module.exports = Proxy.Client;
}
var net = require('net'),
    sys = require('sys');
    
var nodes = ['127.0.0.1:6379', '127.0.0.1:6780', '127.0.0.1:6790'];
    
var Fair = function(nodes){
  var queue = [];
  var server = net.createServer(function(stream){
    var log = function(str){ sys.log('(server)[' + Date.now() + '] ' + str); };
    
    var Client = function(node){
      var buffer = [];
      var args = node.split(':');
      var client = net.createConnection(args[1], args[0]);

      var log = function(str){ sys.log('(client-' + node + ')[' + Date.now() + '] ' + str); };

      client.addListener('connect', function(){
        log('connected');
        if(buffer.length > 0){
          log('replaying buffered commands');
          buffer.forEach(function(buffer){ client.write(buffer); });
        }
      });

      client.addListener('end', function(){ 
        client.end(); 
      });
      
      client.addListener('data', function(data){
        log('received data forwarding to server');
        stream.write(data);
        if(queue.length == 0) nodes.push(node);
        else client.write(queue.shift());
      });

      var oldWrite = client.write;

      this.write = function(data){
        log('write('+ client.readyState +') ' + sys.inspect(data));
        if(client.readyState == 'open'){
          client.write = oldWrite;
          client.write(data);
        }
        buffer.push(data);
      };
    };
  
    stream.setEncoding('utf8');
    stream.addListener('connect', function (){
      log('connected');
    });
    stream.addListener('data', function (data){
      address = nodes.shift();
      log('routing to '+ address);
      if(address){
        var node = new Client(address);
        node.write(data);
      }else queue.push(data);
    });
    stream.addListener('end', function (){
      log('done');
      stream.end();
    });
  });
  this.run = function(port, host){ server.listen(port, host); };
};

var balancer = new Fair(nodes);
balancer.run(6380, 'localhost');
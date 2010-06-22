var net = require('net'),
    sys = require('sys');
    
var nodes = ['127.0.0.1:3000', '127.0.0.1:3001', '127.0.0.1:3002', '127.0.0.1:3003', '127.0.0.1:3004'];
    
var Fair = function(nodes, mode){
  var mode = mode || 'tcp';
  var queue = [];
  var server = net.createServer(function(stream){
    var log = function(str){ sys.log('(server)[' + Date.now() + '] ' + str); };
    
    var Client = function(node){
      var buffer = [];
      var args = node.split(':');
      var client = net.createConnection(args[1], args[0]);

      var log = function(str){ sys.log('(client-' + node + ')[' + Date.now() + '] ' + str); };

      client.addListener('connect', function(){
        if(buffer.length > 0) buffer.forEach(function(datum){ client.write(datum); });
      });

      client.addListener('end', client.end);
      
      client.addListener('data', function(data){
        stream.write(data);
        if(mode == 'http') stream.end();
        if(queue.length == 0) nodes.push(node);
        else client.write(queue.shift());
      });

      var oldWrite = client.write;

      this.write = function(data){
        if(client.readyState == 'open'){
          client.write = oldWrite;
          client.write(data);
        }
        buffer.push(data);
      };
    };
  
    stream.setEncoding('utf8');
    stream.addListener('connect', function(){
      log('connected');
    });
    stream.addListener('data', function(data){
      address = nodes.shift();
      log('routing to '+ address);
      if(address){
        var node = new Client(address);
        node.write(data);
      }else queue.push(data);
    });
    stream.addListener('end', stream.end);
  });
  this.run = function(port, host){ 
    sys.log('starting on ' + host + ':' + port);
    server.listen(port, host); 
  };
};

var balancer = new Fair(nodes, 'http');
balancer.run(3050, 'localhost');
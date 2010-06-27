var net = require('net'),
    sys = require('sys');
    
var nodes = ['127.0.0.1:3000', '127.0.0.1:3001', '127.0.0.1:3002', '127.0.0.1:3003', '127.0.0.1:3004'];
    
var Fair = function(nodes, mode){
  var mode = mode || 'tcp';
  var queue = [];
  var server = net.createServer(function(stream){
    var log = function(str){ sys.log('(server)[' + Date.now() + '] ' + str); };
    
    // encapsulating the client functionality
    var Client = function(node){
      var buffer = [];
      var args = node.split(':');
      var client = net.createConnection(args[1], args[0]);

      var log = function(str){ sys.log('(client-' + node + ')[' + Date.now() + '] ' + str); };
      
      client.setEncoding('binary');
      client.setKeepAlive(true);
      client.setNoDelay(true);
      client.addListener('connect', function(){
        // if some thing tried to write to the client before it was ready, replay that now
        if(buffer.length > 0) buffer.forEach(function(datum){ client.write(datum); });
      });   
      client.addListener('data', function(data){
        process.nextTick(function(){
          stream.write(data);
          // finish the request if http mode, otherwise the connection will continue
          if(mode == 'http') stream.flush();
        });
        // mark the node as available for work by pushing it back onto the stack
        if(queue.length == 0) nodes.push(node);
        // if a request was queued, set the node to start processing that
        else process.nextTick(function(){ client.write(queue.shift());});
      });
      client.addListener('drain', function(){ log('drain'); });
      client.addListener('error', function(){ log('error'); });
      
      var resetClientNode = function(){
        client.end();
        delete client;
      };
      
      client.addListener('timeout', resetClientNode);
      client.addListener('end', resetClientNode);

      var oldWrite = client.write;

      this.write = function(data){
        // this prevents the client being written to until a connection is established
        if(client.readyState == 'open'){
          process.nextTick(function(){
            (client.write = oldWrite)(data);
          });
        }
        buffer.push(data);
      };
    };
    
    stream.setEncoding('binary');
    stream.setKeepAlive(true);
    stream.setNoDelay(true);
    stream.addListener('connect', function(){ log('connect'); });
    stream.addListener('drain', function(){ log('drain'); });
    stream.addListener('error', function(){ log('error'); });
    stream.addListener('data', function(data){
      // pulls the first node of the stack if there is one and connects to that
      address = nodes.shift();
      if(address){
        process.nextTick(function(){
          var node = new Client(address);
          node.write(data);
        });
      // if there's no node available, push the request on to a queue
      }else queue.push(data);
    });
    stream.addListener('timeout', stream.end);
    stream.addListener('end', stream.end);
  });
  this.run = function(port, host){ 
    sys.log('starting on ' + host + ':' + port);
    server.listen(port, host); 
  };
};

var balancer = new Fair(nodes, 'http');
balancer.run(3050, 'localhost');
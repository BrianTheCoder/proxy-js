Proxy = Proxy || {};
Proxy.Balancer = function(nodes, strategy){
  strategy = new strategy();
  
  var log = function(str){
    sys.log('<{Balancer}>[' + Date.now() + '] ' + str);
  };
  
  nodes.forEach(function(node){ 
    log('Adding ' + node);
    strategy.addNode(node); 
  });
  
  var newClient = function(node, socket){
    host = node.split(':')[0];
    port = node.split(':')[1];
    return new Proxy.Client(node, socket, port, host);
  };
  
  var server = new Proxy.Server(function(){
    log('Initialized');
    var server = this;
    server.addListener('data', function(data){
      node = strategy.selectNode();
      log('Routing Request ' + node);
      newClient(node, server.socket).write(data);
    });
  });
  
  this.run = function(port, host){
    log('Starting on ' + host + ':' + port);
    server.run(port, host);
  };
};

// Hook into commonJS module systems
if (typeof module !== 'undefined' && "exports" in module) {
  module.exports = Proxy.Balancer;
}
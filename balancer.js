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
  
  var newClient = function(node){
    host = node.split(':')[0];
    port = node.split(':')[1];
    return new Proxy.Client(node, port, host);
  };
  
  var server = new Proxy.Server(function(){
    log('Initialized');
    var server = this, node;
    server.addListener('data', function(data){
      log('Routing Request ' + node);
      node.write(data, server.getSocket());
    });
    server.addListener('end', function(){ node.end(); });
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
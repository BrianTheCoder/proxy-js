Proxy = Proxy || {};
Proxy.Balancers = Proxy.Balancers || {};
Proxy.Balancers.RoundRobin = function(opts){
  
  var nodes = [], nodeQueuePos = 0;
  
  var log = function(str){ sys.log('(RoundRobin)[' + Date.now() + '] ' + str); };
  
  log('Initializing');
  
  this.addNode = function(node){ nodes.push(node); };
  
  this.removeNode = function(node){ 
    nodes.splice(nodes.indexOf(node),1); 
  };
  
  this.selectNode = function(){
    nodeQueuePos++;
    nodeQueuePos = nodeQueuePos % nodes.length;
    log('Select ' + nodeQueuePos + ' of ' + nodes.length);
    return nodes[nodeQueuePos];
  };
};

// Hook into commonJS module systems
if (typeof module !== 'undefined' && "exports" in module) {
  module.exports = Proxy.Balancers.RoundRobin;
}
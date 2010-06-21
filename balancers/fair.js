Proxy = Proxy || {};
Proxy.Balancers = Proxy.Balancers || {};
Proxy.Balancers.Fair = function(opts){
  this.addNode = function(){
    
  };
  
  this.removeNode = function(){
    
  };
  
  this.selectNode = function(){
    
  };
};

// Hook into commonJS module systems
if (typeof module !== 'undefined' && "exports" in module) {
  module.exports = Proxy.Balancers.Fair;
}
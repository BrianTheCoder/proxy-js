Proxy = Proxy || {};
Proxy.Balancers = Proxy.Balancers || {};
Proxy.Balancers.HashRing = function(opts){
  var replicas = replicas || 160;
  var self = this, ring = {}, sorted_keys = [], replicas, nodes = [];
  
  nodes.forEach(function(node){ self.add_node(node); });

  // Adds a `node` to the hash ring (including a number of replicas).
  this.add_node = function(node){
    nodes.push(node);
    for(var i = 0; i <= replicas; i++){
      // key = Zlib.crc32("#{node.id}:#{i}"
      ring[key] = node;
      sorted_keys.push(key);
    }
    // sort keys
  };

  this.remove_node = function(node){
    // @nodes.reject!{|n| n.id == node.id}
    for(var i = 0; i <= replicas; i++){
      // key = Zlib.crc32("#{node.id}:#{i}")
      delete ring[key];
      // @sorted_keys.reject!{|k| k == key}
    }
  };

  // get the node in the hash ring for this key
  this.get_node = function(key){ get_node_pos(key)[0]; };

  this.get_node_pos = function(key){
     if(ring.length == 0) return [null, null];
    // crc = Zlib.crc32(key)
    // idx = HashRing.binary_search(sorted_keys, crc)
    return [ring[sorted_keys[idx]], idx];
  };

  this.iter_nodes = function(key, callback){
    if (ring.length == 0) return [null, null];
    data = get_node_pos(key);
    node = data[0];
    pos = data[1];
    // sorted_keys[pos..-1].forEach(function(k){ callback(ring[k]); });
  };
  
  this.binary_search = function(array, r){
    var upper = array.length - 1, lower = 0, idx = 0;

    while (lower <= upper) {
        idx = (lower + upper) / 2;
        l = parseInt(array[idx], 10);
        if (l == r) return idx;
        else if (l > r) upper = idx - 1;
        else lower = idx + 1;
    }
    if(upper < 0) upper = array.length - 1;

    return upper;
  };
};

// Hook into commonJS module systems
if (typeof module !== 'undefined' && "exports" in module) {
  module.exports = Proxy.Balancers.HashRing;
}
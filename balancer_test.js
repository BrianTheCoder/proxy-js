var net = require('net'),
    sys = require('sys');
    
require('./proxy');
    

var servers = ['127.0.0.1:3000', '127.0.0.1:3001', '127.0.0.1:3002', '127.0.0.1:3003', '127.0.0.1:3004'];    

var balancer = new Proxy.Balancer(servers, Proxy.Balancers.RoundRobin);
balancer.run(3401, '127.0.0.1');
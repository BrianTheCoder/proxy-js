net = require('net');
sys = require('sys');

Proxy = {};
Proxy.Server = require('./server');
Proxy.Client = require('./client');
Proxy.Balancer = require('./balancer');
Proxy.Balancers = {};
Proxy.Balancers.RoundRobin = require('./balancers/round_robin');
Proxy.Balancers.Fair = require('./balancers/fair');
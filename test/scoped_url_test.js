var ScopedClient = require('../lib')
  ,       assert = require('assert')
  ,       called = false
  ,       client

client = ScopedClient.create('http://user:pass@foo.com:81/bar/baz?a=1&b[]=2&c[d]=3')
assert.equal('http:',     client.options.protocol)
assert.equal('foo.com',   client.options.hostname)
assert.equal('/bar/baz',  client.options.pathname)
assert.equal(81,          client.options.port)
assert.equal('user:pass', client.options.auth)
assert.equal(1,           client.options.query.a)
assert.deepEqual([2],     client.options.query.b)
assert.deepEqual({d:3},   client.options.query.c)

delete client.options.query.b
delete client.options.query.c
client.auth('user', 'monkey').protocol('https')
assert.equal('user:monkey', client.options.auth)
assert.equal('https',       client.options.protocol)
assert.deepEqual({a:1},     client.options.query)

client.path('qux').auth('user:pw').port(82)
assert.equal('/bar/baz/qux', client.options.pathname)
assert.equal('user:pw',      client.options.auth)
assert.equal(82,             client.options.port)

client.query('a').host('bar.com').port(443).query('b', 2).query({c: 3}).path('/boom')
assert.equal('bar.com',      client.options.hostname)
assert.equal(443,            client.options.port)
assert.deepEqual({b:2, c:3}, client.options.query)

client.auth().host('foo.com').query('b').query('c')
assert.equal(null,      client.options.auth)
assert.equal('foo.com', client.options.hostname)
assert.deepEqual({},    client.options.query)

client.scope('api', function(scope) {
  called = true
  assert.equal('/boom/api', scope.options.pathname)
})
assert.ok(called)

called = false
client.scope('http://', function(scope) {
  called = true
  assert.equal('http:',   scope.options.protocol)
  assert.equal('foo.com', scope.options.hostname)
  assert.equal('/boom',   scope.options.pathname)
})
assert.ok(called)

called = false
client.scope('https://bar.com', function(scope) {
  called = true
  assert.equal('https:',  scope.options.protocol)
  assert.equal('bar.com', scope.options.hostname)
  assert.equal('/boom',   scope.options.pathname)
})
assert.ok(called)

called = false
client.scope('/help', {protocol: 'http:'}, function(scope) {
  called = true
  assert.equal('http:',   scope.options.protocol)
  assert.equal('foo.com', scope.options.hostname)
  assert.equal('/help',   scope.options.pathname)
})
assert.ok(called)
assert.equal('https',   client.options.protocol)
assert.equal('foo.com', client.options.hostname)
assert.equal('/boom',   client.options.pathname)

assert.equal('/boom/ok', client.fullPath('ok'))
assert.equal('/ok',      client.fullPath('/ok'))
assert.equal('/boom',    client.options.pathname)
client.options.pathname = null
assert.equal('/ok',      client.fullPath('ok'))
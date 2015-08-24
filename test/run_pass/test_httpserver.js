/* Copyright 2015 Samsung Electronics Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var assert = require('assert');
var http = require('http');


// server side code
// server will return the received msg from client
// and shutdown

var server = http.createServer(function (req, res) {

  var body = '';
  var url = req.url;

  req.on('data', function (chunk) {
    body += chunk;
  });

  var endHandler = function () {

    res.writeHead(200, { 'Connection' : 'close',
                         'Content-Length' : body.length
                       });
    res.write(body);
    res.end(function(){
      if(body == 'close server') server.close();
    });
  };

  req.on('end', endHandler);

});

server.listen(3001,2);


// client side code
// 1. send POST req to server and check response msg
// 2. send GET req to server and check response msg
// 3. send 'close server' msg

// 1. POST req
var msg = 'http request test msg';
var options = {
  method : 'POST',
  port : 3001,
  headers : {'Content-Length': msg.length}
};


var postResponseHandler = function (res) {
  var res_body = '';

  assert.equal(200, res.statusCode);
  var endHandler = function(){
    assert.equal(msg, res_body);
  };
  res.on('end', endHandler);

  res.on('data', function(chunk){
    res_body += chunk.toString();
  });
};

var req = http.request(options, postResponseHandler);
req.write(msg);
req.end();


// 2. GET req
options = {
  method : 'GET',
  port : 3001
};

var getResponseHandler = function (res) {
  var res_body = '';

  assert.equal(200, res.statusCode);

  var endHandler = function(){
    // GET msg, no received body
    assert.equal('', res_body);
  };
  res.on('end', endHandler);

  res.on('data', function(chunk){
    res_body += chunk.toString();
  });
};


var getReq = http.request(options, getResponseHandler);
getReq.end();


// 3. close server req
var finalMsg = 'close server';
var finalOptions = {
  method : 'POST',
  port : 3001,
  headers : {'Content-Length': finalMsg.length}
};

var finalResponseHandler = function (res) {
  var res_body = '';

  assert.equal(200, res.statusCode);

  var endHandler = function(){
    assert.equal(finalMsg, res_body);
  };
  res.on('end', endHandler);

  res.on('data', function(chunk){
    res_body += chunk.toString();
  });
};

var finalReq = http.request(finalOptions, finalResponseHandler);
finalReq.write(finalMsg);
finalReq.end();
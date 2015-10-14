/*
 * MIT License (MIT)
 * Copyright (c) 2014 Johann Troendle
 *
 * This file is part of <grunt-dock>.
 */

var sinon = require("sinon");
var expect = require("chai").expect;
var Docker = require("dockerode");

var run = require('../lib/run.js');

var nop = function() {
};

var grunt = {
  async : nop,
  log : {
    ok : nop,
    oklns : nop,
    writeln : nop,
    subhead : nop
  }
};

var stubs = {};

var hub = {
  on : nop
};

describe("run", function() {

  it("should call done() with error", function(done) {

    stubs.run = sinon.stub(Docker.prototype, "run").yields("error", null);
    stubs.run.returns(hub);

    run(grunt, null, {
      registry : "registry:5000",
      auth : {
        username : "username1",
        password : "password1"
      },
      docker : {
        protocol : "http",
        host : "localhost",
        port : 2375
      },
      images : {
        testimage : {
          dockerfile : "./target/geoserver",
          tag : "0.2.0",
          options : {
            run : {
              registry : "registry2:5000",
              auth : {
                username : "username2",
                password : "password2"
              },
              docker : [ {
                protocol : "http",
                host : "localhost",
                port : 2375
              }],
              cmd : [],
              create : [ "port=1000" ],
              start : [ "--detach", "--name=consul", "--publish=8500:8500",
                  "--hostname=lb", "lb:5000/consul:0.3.1" ]
            }
          }
        }
      }
    }, function(e) {
      expect(e).exist;
      done();
    });
  });

});

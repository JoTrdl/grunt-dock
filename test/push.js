/*
 * MIT License (MIT)
 * Copyright (c) 2014 Johann Troendle
 *
 * This file is part of <grunt-dock>.
 */

var sinon = require("sinon");
var expect = require("chai").expect;

var push = require('../lib/push.js');

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

var docker = {
  getImage : nop
};

var stubs = {};
var image = {
  push : nop
};

var ncalls = 0;
var stream = {
  setEncoding : nop,
  on : function(event, cb) {
    if (event === "data") {
      return cb("{}");
    } else {
      ncalls++;
      return cb();
    }
  }
};

describe("push", function() {

  it("should call done() with error", function(done) {

    stubs.push = sinon.stub(image, "push").yields("error", null);
    stubs.getImage = sinon.stub(docker, "getImage").returns({
      name : "test",
      push : stubs.push
    });

    push(grunt, docker, {
      registry : "registry1:5000",
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
        test : {
          dockerfile : null,
          tag : "0.1.0"
        }
      }
    }, function(e) {
      expect(e).exist;
      done();
    });
  });

  it("should call docker.push() one time", function(done) {

    stubs.getImage.restore();
    stubs.push.restore();
    stubs.push = sinon.stub(image, "push").yields(null, stream);
    stubs.getImage = sinon.stub(docker, "getImage").returns({
      name : "test",
      push : stubs.push
    });

    push(grunt, docker, {
      registry : "registry1:5000",
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
        test : {
          dockerfile : null,
          tag : "0.1.0"
        }
      }
    }, function(e) {
      expect(ncalls).equal(1);
      done();
    });
  });

  it("should call docker.push() two times", function(done) {

    stubs.getImage.restore();
    stubs.push.restore();
    stubs.push = sinon.stub(image, "push").yields(null, stream);
    stubs.getImage = sinon.stub(docker, "getImage").returns({
      name : "test",
      push : stubs.push
    });

    ncalls = 0;
    push(grunt, docker, {
      registry : "registry1:5000",
      auth : {
        username : "username1",
        password : "password1"
      },
      images : {
        test : {
          dockerfile : null,
          tag : "0.1.0",
          push : {
            docker : {
              protocol : "http",
              host : "localhost",
              port : 2375
            }
          }
        },
        test2 : {
          dockerfile : null,
          tag : "0.2.0",
          push : {
            docker : {
              protocol : "http",
              host : "localhost",
              port : 2375
            }
          }
        }

      }
    }, function(e) {
      expect(ncalls).equal(2);
      done();
    });
  });

});

/*
 * MIT License (MIT)
 * Copyright (c) 2014 Johann Troendle
 *
 * This file is part of <grunt-dock>.
 */

var sinon = require("sinon");
var expect = require("chai").expect;

var pull = require('../lib/pull.js');

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
  pull : nop
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

describe("pull", function() {

  it("should call done() with error", function(done) {

    stubs.pull = sinon.stub(image, "pull").yields("error", null);
    stubs.getImage = sinon.stub(docker, "getImage").returns({
      name : "test",
      pull : stubs.pull
    });

    pull(grunt, null, {
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

});

/*
 * MIT License (MIT)
 * Copyright (c) 2014 Johann Troendle
 *
 * This file is part of <grunt-dock>.
 */

var sinon = require('sinon'), expect = require('chai').expect;

var push = require('../lib/push.js');

var nop = function() {
};

var grunt = {
  async : nop,
  log : {
    ok : nop,
    writeln : nop,
    subhead : nop
  }
};

var docker = {
  getImage : nop
};

var image = {
  push : nop
};

describe("push", function() {

  var stubs = {};

  it("should call done() with error", function(done) {

    stubs.push = sinon.stub(image, 'push').yields('error', null);
    stubs.getImage = sinon.stub(docker, 'getImage').returns({
      name : 'test',
      push : stubs.push
    });

    push(grunt, docker, {
      images : {
        'test' : {
          name : 'test',
          dockerfile : null,
          options : {
            push : {}
          }
        }
      }
    }, function(e) {
      expect(e).not.to.be.null;
      done();
    });
  });

  it("should call image.push()", function(done) {

    push(grunt, docker, {
      images : {
        'test' : {
          name : 'test',
          dockerfile : null,
          options : {
            push : {}
          }
        }
      }
    }, function(e) {
      expect(image.push.called).to.be.true;
      done();
    });
  });

});

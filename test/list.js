/* 
 * MIT License (MIT)
 * Copyright (c) 2014 Johann Troendle
 * 
 * This file is part of <grunt-dock>.
 */

var sinon = require('sinon'),
    expect = require('chai').expect;

var list = require('../lib/list.js');


var nop = function() {};

var grunt = {
  async: nop,
  log: {
    ok: nop,
    writeln: nop
  }
};

var docker = {
  listImages: nop,
  listContainers: nop
};

describe("list images", function() {

  before(function(done) {
    sinon.stub(docker, 'listImages').yields(null, []);
    done();
  });

  it("should call docker.listContainers for containers", function (done) {
    list.image(grunt, docker, null, function(e) {
      expect(e).to.not.exist;
      expect(docker.listImages.called).to.be.true;
      done();
    });
  });
/*
  it("should call done with error", function (done) {
    sinon.stub(docker, 'listImages').yields('error', null);
    list.image(grunt, docker, null, function(e) {
      expect(e).not.to.be.null;
      done();
    });
  });
*/
});

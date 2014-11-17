/* 
 * MIT License (MIT)
 * Copyright (c) 2014 Johann Troendle
 * 
 * This file is part of <grunt-dock>.
 */

var sinon = require('sinon'),
    expect = require('chai').expect,
    fs = require('fs');

var lifecycle = require('../lib/lifecycle.js');

var nop = function() {};

var grunt = {
  async: nop,
  log: {
    ok: nop,
    writeln: nop,
    subhead: nop
  }
};

var docker = {
  listImages: nop,
  listContainers: nop,
  buildImage: nop,
  getImage: nop,
  getContainer: nop,
  createContainer: nop
};

describe("lifecycle", function() {

  var stubs = {};

  afterEach(function(done) {
    for (s in stubs) {
      stubs[s].restore();
      delete stubs[s];
    }
    done();
  });

  ['start', 'stop', 'restart', 'pause', 'unpause', 'kill'].forEach(function(action) {
    describe(action, function() {

      it("should call " + action + "() with error", function (done) {

        stubs.listContainers = sinon.stub(docker, 'listContainers').yields('error', null);

        lifecycle[action](grunt, docker, {images: {}}, function(e) {
          expect(e).not.to.be.null;
          done();
        });
      });
      
      it("should call docker.listContainers()", function (done) {

        var getContainerData = {};
        getContainerData[action] = function(opt, cb) { cb(null); };

        stubs.listContainers = sinon.stub(docker, 'listContainers').yields(null, []);
        stubs.createContainer = sinon.stub(docker, 'createContainer').yields(null, getContainerData);

        stubs.getContainer = sinon.stub(docker, 'getContainer').returns(getContainerData);
        stubs[action] = sinon.stub(getContainerData, action).yields(null);


        lifecycle[action](grunt, docker, {images: {}}, function(e) {
          expect(e).to.not.exist;
          expect(docker.listContainers.called).to.be.true;
          done();
        });
      });

    });
  });

});



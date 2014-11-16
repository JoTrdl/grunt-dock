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

describe("list", function() {

  var stubs = {};

  afterEach(function(done) {
    for (s in stubs) {
      stubs[s].restore();
      delete stubs[s];
    }
    done();
  });

  describe("images", function() {
    it("should call done with error", function (done) {

      stubs.listImages = sinon.stub(docker, 'listImages').yields('error', null);

      list.image(grunt, docker, null, function(e) {
        expect(e).not.to.be.null;
        done();
      });
    });

    it("should call docker.listImages for images", function (done) {

      stubs.listImages = sinon.stub(docker, 'listImages').yields(null, []);

      list.image(grunt, docker, null, function(e) {
        expect(e).to.not.exist;
        expect(docker.listImages.called).to.be.true;
        done();
      });
    });
  });

  describe("containers", function() {
    it("should call done with error", function (done) {

      stubs.listContainers = sinon.stub(docker, 'listContainers').yields('error', null);

      list.container(grunt, docker, null, function(e) {
        expect(e).not.to.be.null;
        done();
      });
    });
    
    it("should call docker.listContainers for containers", function (done) {

      stubs.listContainers = sinon.stub(docker, 'listContainers').yields(null, []);

      list.container(grunt, docker, null, function(e) {
        expect(e).to.not.exist;
        expect(docker.listContainers.called).to.be.true;
        done();
      });
    });
  });

  describe("default", function() {

    it("should call list.image() && list.container()", function (done) {

      stubs.listImage = sinon.stub(list, 'image').yields(null);
      stubs.listContainer = sinon.stub(list, 'container').yields(null);

      list.default(grunt, docker, null, function(e) {
        expect(e).to.not.exist;
        expect(list.image.called).to.be.true;
        expect(list.container.called).to.be.true;
        done();
      });
    });

  });
});


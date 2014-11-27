/* 
 * MIT License (MIT)
 * Copyright (c) 2014 Johann Troendle
 * 
 * This file is part of <grunt-dock>.
 */

var sinon = require('sinon'),
    expect = require('chai').expect;

var clean = require('../lib/clean.js');

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
  listContainers: nop,
  getImage: nop,
  getContainer: nop
};

describe("clean", function() {

  var stubs = {};

  afterEach(function(done) {
    for (s in stubs) {
      stubs[s].restore();
      delete stubs[s];
    }
    done();
  });

  describe("images", function() {

    it("should call done() with error", function (done) {

      stubs.listImages = sinon.stub(docker, 'listImages').yields('error', null);

      clean.image(grunt, docker, null, function(e) {
        expect(e).not.to.be.null;
        done();
      });
    });

    it("should call docker.listImages() for images", function (done) {

      stubs.listImages = sinon.stub(docker, 'listImages').yields(null, []);

      clean.image(grunt, docker, null, function(e) {
        expect(e).to.not.exist;
        expect(docker.listImages.called).to.be.true;
        done();
      });
    });

    it("should call docker.getImage() then image.remove() for each image", function (done) {

      var getImageData = {
        remove: function(opt, cb) { cb('error'); } 
      };

      stubs.listImages = sinon.stub(docker, 'listImages').yields(null, [{}]);
      stubs.getImage = sinon.stub(docker, 'getImage').returns(getImageData);
      stubs.remove = sinon.stub(getImageData, 'remove').yields('error');

      clean.image(grunt, docker, null, function(e) {
        expect(e).to.not.exist;
        expect(docker.getImage.called).to.be.true;
        expect(getImageData.remove.called).to.be.true;
        expect(docker.getImage.calledBefore(getImageData.remove)).to.be.true;
        done();
      });
    });

  });

  describe("containers", function() {
    it("should call done() with error", function (done) {

      stubs.listContainers = sinon.stub(docker, 'listContainers').yields('error', null);

      clean.container(grunt, docker, null, function(e) {
        expect(e).not.to.be.null;
        done();
      });
    });
    
    it("should call docker.listContainers() for containers", function (done) {

      stubs.listContainers = sinon.stub(docker, 'listContainers').yields(null, []);

      clean.container(grunt, docker, null, function(e) {
        expect(e).to.not.exist;
        expect(docker.listContainers.called).to.be.true;
        done();
      });
    });

    it("should call docker.getContainer() then container.remove() for each container", function (done) {

      var getContainerData = {
        remove: function(opt, cb) { cb('error'); } 
      };

      stubs.listContainers = sinon.stub(docker, 'listContainers').yields(null, [{}]);
      stubs.getContainer = sinon.stub(docker, 'getContainer').returns(getContainerData);
      stubs.remove = sinon.stub(getContainerData, 'remove').yields('error');

      clean.container(grunt, docker, null, function(e) {
        expect(e).to.not.exist;
        expect(docker.getContainer.called).to.be.true;
        expect(getContainerData.remove.called).to.be.true;
        expect(docker.getContainer.calledBefore(getContainerData.remove)).to.be.true;
        done();
      });
    });

  });


  describe("default", function() {
    
    it("should call clean.image() && clean.container()", function (done) {

      stubs.cleanImage = sinon.stub(clean, 'image').yields(null);
      stubs.cleanContainer = sinon.stub(clean, 'container').yields(null);

      clean.default(grunt, docker, null, function(e) {
        expect(e).to.not.exist;
        expect(clean.image.called).to.be.true;
        expect(clean.container.called).to.be.true;
        done();
      });
    });

  });

});



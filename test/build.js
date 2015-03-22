/* 
 * MIT License (MIT)
 * Copyright (c) 2014 Johann Troendle
 * 
 * This file is part of <grunt-dock>.
 */

var sinon = require('sinon'),
    expect = require('chai').expect,
    fs = require('fs');

var build = require('../lib/build.js');

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
  getContainer: nop
};

describe("build", function() {

  var stubs = {};

  before(function(done) {
    fs.writeFile("./test.tar", "Test file", function(e) {
      if(e) {
        console.log(err);
      }
      done();
    });
  });

  after(function(done) {
    fs.unlink('./test.tar', function (err) {
      if (err) {
        console.log(err);
      }
      done();
    });
  });

  afterEach(function(done) {
    for (s in stubs) {
      stubs[s].restore();
      delete stubs[s];
    }
    done();
  });

  it("should call done() with error", function (done) {

    stubs.buildImage = sinon.stub(docker, 'buildImage').yields('error', null);

    build(grunt, docker, {images: {'test' : {dockerfile: null}}}, function(e) {
      expect(e).not.to.be.null;
      done();
    });
  });

  it("should call docker.buildImage()", function (done) {

    stubs.buildImage = sinon.stub(docker, 'buildImage').yields('error', null);

    build(grunt, docker, {images: {'test' : {dockerfile: './test.tar'}}}, function(e) {
      expect(docker.buildImage.called).to.be.true;
      done();
    });
  });

});



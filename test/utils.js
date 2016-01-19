/*
 * MIT License (MIT)
 * Copyright (c) 2014 Johann Troendle
 *
 * This file is part of <grunt-dock>.
 */

"use strict";

var sinon = require('sinon'), expect = require('chai').expect;

var utils = require('../lib/utils.js');

describe("utils", function() {

      describe("toArray", function() {

        it("should transform a primitive type in an Array", function(done) {
          var result = utils.toArray(1);
          expect(result).to.eql([ 1 ]);
          done();
        });

        it("should keep an Array an Array", function(done) {
          var result = utils.toArray([ 1 ]);
          expect(result).to.eql([ 1 ]);
          done();
        });

      });

      describe("getContainerStatus", function() {

        it("should return RUNNING when the container is up", function(done) {
          var result = utils.getContainerStatus({
            Status : "Up 1 seconds"
          });
          expect(result).to.eql("RUNNING");
          done();
        });

        it("should return STOPPED when the container is stoped",
            function(done) {
              var result = utils.getContainerStatus({
                Status : "Exited (137) 11 minutes ago"
              });
              expect(result).to.eql("STOPPED");
              done();
            });

        it("should return OTHER when the container is in another state",
            function(done) {
              var result = utils.getContainerStatus({
                Status : "xxx"
              });
              expect(result).to.eql("OTHER");
              done();
            });

        it("should return OTHER when the container has no status", function(
            done) {
          var result = utils.getContainerStatus({});
          expect(result).to.eql("OTHER");
          done();
        });

      });

      describe(
          "qualifiedImageName",
          function() {

            it(
                "should keep unchanged an image name when registry and version are null",
                function(done) {
                  var result = utils.qualifiedImageName("image", null, null);
                  expect(result).to.equal("image");
                  done();
                });

            it(
                "should keep unchanged an image name when registry and version are undefined",
                function(done) {
                  var result = utils.qualifiedImageName("image", undefined,
                      undefined);
                  expect(result).to.equal("image");
                  done();
                });
            it(
                "should add registry to an image name when registry is defined but version is null",
                function(done) {
                  var result = utils.qualifiedImageName("image",
                      "registry.com:5000", null);
                  expect(result).to.equal("registry.com:5000/image");
                  done();
                });

            it(
                "should add version to an image name when registry is null but version is defined",
                function(done) {
                  var result = utils.qualifiedImageName("image", null, "1.2.3");
                  expect(result).to.equal("image:1.2.3");
                  done();
                });

            it(
                "should add registry and version to an image name when both are specified",
                function(done) {
                  var result = utils.qualifiedImageName("image",
                      "registry.com:5000", "1.2.3");
                  expect(result).to.equal("registry.com:5000/image:1.2.3");
                  done();
                });
          });

      describe(
          "composePushOptions",
          function() {

            it(
                "should keep generic options when push-specific ones are not defined",
                function(done) {
                  var options = {
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
                      }
                    }
                  };
                  var expOptions = {
                    registry : "registry:5000",
                    auth : {
                      username : "username1",
                      password : "password1"
                    },
                    tag : "0.2.0",
                    docker : {
                      protocol : "http",
                      host : "localhost",
                      port : 2375
                    },
                    name : "registry:5000/testimage",
                    repo : "registry:5000/testimage:0.2.0"
                  };
                  var pushOptions = utils.composePushOptions(options,
                      "testimage");
                  expect(pushOptions).to.eql(expOptions);
                  done();
                });

            it("should overwrite generic options with the push-specific ones",
                function(done) {
                  var options = {
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
                          push : {
                            registry : "registry2:5000",
                            auth : {
                              username : "username2",
                              password : "password2"
                            },
                            docker : {
                              protocol : "https",
                              host : "localhost2",
                              port : 2376
                            }
                          }
                        }
                      }
                    }
                  };
                  var expOptions = {
                    registry : "registry2:5000",
                    auth : {
                      username : "username2",
                      password : "password2"
                    },
                    tag : "0.2.0",
                    docker : {
                      protocol : "https",
                      host : "localhost2",
                      port : 2376
                    },
                    name : "registry2:5000/testimage",
                    repo : "registry2:5000/testimage:0.2.0"
                  };
                  var pushOptions = utils.composePushOptions(options,
                      "testimage");
                  expect(pushOptions).to.eql(expOptions);
                  done();
                });

          });

      describe(
          "composePullOptions",
          function() {

            it(
                "should keep generic options when pull-specific ones are not defined",
                function(done) {
                  var options = {
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
                      }
                    }
                  };
                  var expOptions = {
                    registry : "registry:5000",
                    auth : {
                      username : "username1",
                      password : "password1"
                    },
                    tag : "0.2.0",
                    docker : [ {
                      protocol : "http",
                      host : "localhost",
                      port : 2375
                    } ],
                    name : "registry:5000/testimage",
                    repo : "registry:5000/testimage:0.2.0"
                  };
                  var pullOptions = utils.composePullOptions(options,
                      "testimage");
                  expect(pullOptions).to.eql(expOptions);
                  done();
                });

            it("should overwrite generic options with the pull-specific ones",
                function(done) {
                  var options = {
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
                          pull : {
                            registry : "registry2:5000",
                            auth : {
                              username : "username2",
                              password : "password2"
                            },
                            docker : [ {
                              protocol : "http",
                              host : "localhost",
                              port : 2375
                            }, {
                              protocol : "https",
                              host : "localhost2",
                              port : 2376
                            } ]
                          }
                        }
                      }
                    }
                  };
                  var expOptions = {
                    registry : "registry2:5000",
                    auth : {
                      username : "username2",
                      password : "password2"
                    },
                    tag : "0.2.0",
                    docker : [ {
                      protocol : "http",
                      host : "localhost",
                      port : 2375
                    }, {
                      protocol : "https",
                      host : "localhost2",
                      port : 2376
                    } ],
                    name : "registry2:5000/testimage",
                    repo : "registry2:5000/testimage:0.2.0"
                  };
                  var pullOptions = utils.composePullOptions(options,
                      "testimage");
                  expect(pullOptions).to.eql(expOptions);
                  done();
                });

          });

      describe(
          "composeRunOptions",
          function() {

            it(
                "should keep generic options when run-specific ones are not defined",
                function(done) {
                  var options = {
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
                            cmd : [ "ls", "pwd" ],
                            create : {
                              ExposedPorts : {
                                "80/tcp" : {}
                              },
                              HostConfig : {
                                PortBindings : {
                                  "8080/tcp" : [ {
                                    HostPort : "80"
                                  } ]
                                }
                              }
                            },
                            start : {
                              ExposedPorts : {
                                "81/tcp" : {}
                              }
                            }
                          }
                        }
                      }
                    }
                  };
                  var expOptions = {
                    registry : "registry:5000",
                    auth : {
                      username : "username1",
                      password : "password1"
                    },
                    tag : "0.2.0",
                    docker : [ {
                      protocol : "http",
                      host : "localhost",
                      port : 2375
                    } ],
                    name : "registry:5000/testimage",
                    repo : "registry:5000/testimage:0.2.0",
                    cmd : [ "ls", "pwd" ],
                    create : {
                      ExposedPorts : {
                        "80/tcp" : {}
                      },
                      HostConfig : {
                        PortBindings : {
                          "8080/tcp" : [ {
                            HostPort : "80"
                          } ]
                        }
                      }
                    },
                    start : {
                      ExposedPorts : {
                        "81/tcp" : {}
                      }
                    }
                  };
                  var runOptions = utils
                      .composeRunOptions(options, "testimage");
                  expect(runOptions).to.eql(expOptions);
                  done();
                });

            it("should overwrite generic options with the run-specific ones",
                function(done) {
                  var options = {
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
                            }, {
                              protocol : "https",
                              host : "localhost2",
                              port : 2376
                            } ],
                            cmd : [ "ls", "pwd" ],
                            create : {
                              ExposedPorts : {
                                "80/tcp" : {}
                              },
                              HostConfig : {
                                PortBindings : {
                                  "8080/tcp" : [ {
                                    HostPort : "80"
                                  } ]
                                }
                              }
                            },
                            start : {
                              ExposedPorts : {
                                "81/tcp" : {}
                              }
                            }
                          }
                        }
                      }
                    }
                  };
                  var expOptions = {
                    registry : "registry2:5000",
                    auth : {
                      username : "username2",
                      password : "password2"
                    },
                    tag : "0.2.0",
                    docker : [ {
                      protocol : "http",
                      host : "localhost",
                      port : 2375
                    }, {
                      protocol : "https",
                      host : "localhost2",
                      port : 2376
                    } ],
                    name : "registry2:5000/testimage",
                    repo : "registry2:5000/testimage:0.2.0",
                    cmd : [ "ls", "pwd" ],
                    create : {
                      ExposedPorts : {
                        "80/tcp" : {}
                      },
                      HostConfig : {
                        PortBindings : {
                          "8080/tcp" : [ {
                            HostPort : "80"
                          } ]
                        }
                      }
                    },
                    start : {
                      ExposedPorts : {
                        "81/tcp" : {}
                      }
                    }
                  };
                  var runOptions = utils
                      .composeRunOptions(options, "testimage");
                  expect(runOptions).to.eql(expOptions);
                  done();
                });

          });

  describe("shouldIgnore", function() {

    it("should pass the Go match expressions", function(done) {
      // from https://golang.org/src/path/filepath/match_test.go
      var testcases = [
        ["abc", "abc", true],
        ["*", "abc", true],
        ["*c", "abc", true],
        ["a*", "a", true],
        ["a*", "abc", true],
        ["a*", "ab/c", false],
        ["a*/b", "abc/b", true],
        ["a*/b", "a/c/b", false],
        ["a*b*c*d*e*/f", "axbxcxdxe/f", true],
        ["a*b*c*d*e*/f", "axbxcxdxexxx/f", true],
        ["a*b*c*d*e*/f", "axbxcxdxe/xxx/f", false],
        ["a*b*c*d*e*/f", "axbxcxdxexxx/fff", false],
        ["a*b?c*x", "abxbbxdbxebxczzx", true],
        ["a*b?c*x", "abxbbxdbxebxczzy", false],
        ["ab[c]", "abc", true],
        ["ab[b-d]", "abc", true],
        ["ab[e-g]", "abc", false],
        ["ab[^c]", "abc", false],
        ["ab[^b-d]", "abc", false],
        ["ab[^e-g]", "abc", true],
        ["a\\*b", "a*b", true],
        ["a\\*b", "ab", false],
        ["a?b", "a☺b", true],
        ["a[^a]b", "a☺b", true],
        ["a???b", "a☺b", false],
        ["a[^a][^a][^a]b", "a☺b", false],
        ["[a-ζ]*", "α", true],
        ["*[a-ζ]", "A", false],
        ["a?b", "a/b", false],
        ["a*b", "a/b", false],
        ["[\\]a]", "]", true],
        ["[\\-]", "-", true],
        ["[x\\-]", "x", true],
        ["[x\\-]", "-", true],
        ["[x\\-]", "z", false],
        ["[\\-x]", "x", true],
        ["[\\-x]", "-", true],
        ["[\\-x]", "a", false],
        ["*x", "xxx", true]
      ];

      for (var i = 0; i < testcases.length; i++) {
        var test = testcases[i],
            pattern = test[0],
            s = test[1],
            result = test[2];

        expect(utils.shouldIgnore([pattern], s)).to.eql(result);
      }

      done();
    });

    it("should pass the base exemple", function(done) {

      // https://docs.docker.com/engine/reference/builder/#dockerignore-file
      var dockerignore = [
        '*/temp*',
        '*/*/temp*',
        'temp?'
      ];

      expect(utils.shouldIgnore(dockerignore, 'somedir/temporary.txt')).to.be.true;
      expect(utils.shouldIgnore(dockerignore, 'somedir/subdir/temporary.txt')).to.be.true;
      expect(utils.shouldIgnore(dockerignore, 'tempa')).to.be.true;
      expect(utils.shouldIgnore(dockerignore, 'tempb')).to.be.true;

      done();
    });

    it("should not ignore exception rules - 1", function(done) {

      // https://docs.docker.com/engine/reference/builder/#dockerignore-file
      var dockerignore = [
        '*.md',
        '!README*.md',
        'README-secret.md'
      ];

      expect(utils.shouldIgnore(dockerignore, 'file1.md')).to.be.true;
      expect(utils.shouldIgnore(dockerignore, 'file2.md')).to.be.true;
      expect(utils.shouldIgnore(dockerignore, 'README-secret.md')).to.be.true;
      expect(utils.shouldIgnore(dockerignore, 'README-ok.md')).to.be.false;

      done();
    });

    it("should not ignore exception rules - 2", function(done) {

      // https://docs.docker.com/engine/reference/builder/#dockerignore-file
      var dockerignore = [
        '*.md',
        'README-secret.md',
        '!README*.md'
      ];

      expect(utils.shouldIgnore(dockerignore, 'file1.md')).to.be.true;
      expect(utils.shouldIgnore(dockerignore, 'file2.md')).to.be.true;
      expect(utils.shouldIgnore(dockerignore, 'README-secret.md')).to.be.false;
      expect(utils.shouldIgnore(dockerignore, 'README-ok.md')).to.be.false;

      done();
    });

  });
});

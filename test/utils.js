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

  describe("composePushOptions", function() {

    it("should keep generic options when push-specific ones are not defined",
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
          var pushOptions = utils.composePushOptions(options, "testimage");
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
          var pushOptions = utils.composePushOptions(options, "testimage");
          expect(pushOptions).to.eql(expOptions);
          done();
        });

  });

  describe("composePullOptions", function() {

    it("should keep generic options when pull-specific ones are not defined",
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
          var pullOptions = utils.composePullOptions(options, "testimage");
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
          var pullOptions = utils.composePullOptions(options, "testimage");
          expect(pullOptions).to.eql(expOptions);
          done();
        });

  });

  describe("composeRunOptions", function() {

    it("should keep generic options when run-specific ones are not defined",
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
          var runOptions = utils.composeRunOptions(options, "testimage");
          expect(runOptions).to.eql(expOptions);
          done();
        });

    it("should overwrite generic options with the run-specific ones", function(
        done) {
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
      var runOptions = utils.composeRunOptions(options, "testimage");
      expect(runOptions).to.eql(expOptions);
      done();
    });

  });

});

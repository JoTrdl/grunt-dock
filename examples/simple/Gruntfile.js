'use strict';


var fs = require('fs');


module.exports = function(grunt) {

console.log(__dirname);

  grunt.initConfig({
    dock: {
      // Apply to All
      options: {

        docker: {
          version: 'v1.15',
          protocol: 'https',
          host: '192.168.59.103',
          port: '2376',

          ca: fs.readFileSync('/Users/JohannTDL/.boot2docker/certs/boot2docker-vm/ca.pem'),
          cert: fs.readFileSync('/Users/JohannTDL/.boot2docker/certs/boot2docker-vm/cert.pem'),
          key: fs.readFileSync('/Users/JohannTDL/.boot2docker/certs/boot2docker-vm/key.pem')
        },
        
        images: {
          'node': {
            dockerfile: 'Dockerfile',
            options: { 
              build:  { /* extra options to docker build  */ },
              create: { /* extra options to docker create */ },
              start:  { 
                "PortBindings": { "8080/tcp": [ { "HostPort": "8080" } ] },
                "Binds":["/tmp:/tmp"]
//                __dirname
              },
              stop:   { /* extra options to docker stop   */ },
              kill:   { /* extra options to docker kill   */ },
              logs:   { stdout: true }
            }
          }
        }
      }
    }
  });
  
  require('../../task/dock')(grunt);

};
'use strict';


var fs = require('fs');


module.exports = function(grunt) {


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
          'simple': {
            dockerfile: 'Dockerfile',
            options: { 
              start:  { 
                "PortBindings": { "8080/tcp": [ { "HostPort": "8080" } ] },
                "Binds":[__dirname + "/bundle:/bundle"]
              },
              logs:   { stdout: true }
            }
          }
        }
      }
    }
  });
  
  require('../../task/dock')(grunt);

};
grunt-dock
==========

[![Build Status](http://img.shields.io/travis/JoTrdl/grunt-dock.svg?style=flat-square)](https://travis-ci.org/JoTrdl/grunt-dock) [![Code Climate](http://img.shields.io/codeclimate/JoTrdl/grunt-dock.svg?style=flat-square)](https://codeclimate.com/github/JoTrdl/grunt-dock)

> A Grunt dock for Docker.

Grunt plugin to manage your Docker images & containers.

The main goal of this plugin is to accelerate the development flow with Docker. But it can also be used to deploy your app in a production environment.

Last but not least, Grunt-dock is based on the module [Dockerode](https://github.com/apocas/dockerode). Input options can be passed to this module and return values are unchanged.

Installation
------------

```bash
npm install grunt-dock
```

Commands
--------

Grunt-dock supports these commands:

 * list images or containers
 * build images
 * remove images
 * clean dangling images and exited containers
 * lifecycle containers (start/stop/restart)
 * more to come...

Grunt configuration
-------------------

TODO


Typical workflow
----------------

Using this Grunt config file: 

```javascript
dock: {
  options: {
  
    docker: {
      // docker connection
    }
 
  }, // options
  
  dev: {
    options: {
    
      	images: {
	        'app/node': {
	          dockerfile: 'Dockerfile_node'
	        },
	        
	        'app/redis': {
	          dockerfile: 'Dockerfile_nginx'
	        }
      	}
    }
  } // dev
} // dock
```

There are 2 images: one for redis and another one for node js.

1. First we need to build these 2 images:

  ```bash
  grunt dock:dev:build
  ```

2. We can list them using the list command:
  
  ```bash
  grunt dock:dev:list:image
  ``` 

Contributing
-------

Pull requests are welcome.

Please update the tests and the documentation.

License
-------

The MIT License (MIT)

Copyright (c) 2014 Johann Troendle

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

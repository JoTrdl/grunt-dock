grunt-dock
==========

[![Build Status](http://img.shields.io/travis/JoTrdl/grunt-dock.svg?style=flat-square)](https://travis-ci.org/JoTrdl/grunt-dock) [![Code Climate](http://img.shields.io/codeclimate/JoTrdl/grunt-dock.svg?style=flat-square)](https://codeclimate.com/github/JoTrdl/grunt-dock)

> A Grunt dock for Docker.

Grunt plugin to manage your Docker images & containers.

The main goal of this plugin is to accelerate the development flow with Docker. But it can also be used to deploy your app in a production environment.

Last but not least, Grunt-dock is based on the module [Dockerode](https://github.com/apocas/dockerode). Input options can be passed to this module and return values are unchanged.

Why a Grunt plugin?
-------------------

The idea came when I was developping a Docker container. I used to enter a lot of commands like build/start/kill then cleaning all the stuff and restarting the workflow.

Before Grunt-Dock, to clean Docker images/containers:

```bash
docker ps -a -q --filter "status=exited" | xargs docker rm
docker rmi `docker images -q --filter "dangling=true"`
```
After:

```bash
grunt dock:clean
```

Installation
------------

```bash
npm install grunt-dock
```

Commands
--------

Grunt-dock supports these commands:

 * **list** images or containers
 * **build** images
 * **clean** dangling images and exited containers
 * **start**/**stop**/**restart**/**kill**/**pause**/**unpause** containers
 * **logs** containers

Grunt configuration
-------------------

Grunt-Dock supports main and targets level configuration.

Here is basic Grunt configuration:

```javascript
dock: {
  options: {
  
    docker: {
      // docker connection
      // See Dockerode for options
    }
  
    // It is possible to define images in the 'default' grunt option
    // The command will look like 'grunt dock:build'
    images: {
      'dockerapp': { // Name to use for Docker
        dockerfile: 'Dockerfile',
        options: { 
          build:   { /* extra options to docker build   */ },
          create:  { /* extra options to docker create  */ },
          start:   { /* extra options to docker start   */ },
          stop:    { /* extra options to docker stop    */ },
          kill:    { /* extra options to docker kill    */ },
          logs:    { /* extra options to docker logs    */ },
          pause:   { /* extra options to docker pause   */ },
          unpause: { /* extra options to docker unpause */ }
        }
      }
    }
  }, // options
  
  dev: {
    options: {
    
      // You can also define images by target
      // This case, to invoke a command: 'grunt dock:dev:build'
      images: {
      'appname': { // Name to use for Docker
           dockerfile: 'Dockerfile',
           options: { 
             build:   { /* extra options to docker build   */ },
             create:  { /* extra options to docker create  */ },
             start:   { /* extra options to docker start   */ },
             stop:    { /* extra options to docker stop    */ },
             kill:    { /* extra options to docker kill    */ },
             logs:    { /* extra options to docker logs    */ },
             pause:   { /* extra options to docker pause   */ },
             unpause: { /* extra options to docker unpause */ }
           }
        }
      }
    }
  } // dev env
} // dock
```

The property 'dockerfile' can be any supported Docker formats plus plain format (this case, Grunt-Dock will create a tar.gz stream to pass to Docker - very usefull for development -). 

You can define some specifics options to pass for each commands of each images (start, stop, build, etc.).
See Docker API/Dockerode documentations.

To use it, simply enter these commands:

```bash
# Build
grunt dock:build
grunt dock:dev:build

# Start, stop, restart, kill, pause, unpause, logs (replace sample action by right one)
grunt dock:start
grunt dock:dev:start

# List
grunt dock:list
grunt dock:dev:list

# Clean
grunt dock:clean
grunt dock:dev:clean
```

It is possible to only apply a command for a specific image. For instance, to only start the container 'appname', enter:
```bash
# Start only appname container
grunt dock:start:appname
# for 'dev' target:
grunt dock:dev:start:appname
```

**list** and **clean** commands allow a third param: *image* or *container* to only list/clean this type:   

```bash
# List only images
grunt dock:list:image
grunt dock:dev:list:image

# List only containers
grunt dock:list:container
grunt dock:dev:list:container
```
Samples
-------

See the [examples](https://github.com/JoTrdl/grunt-dock/tree/master/examples) directory.

Coming next
-----------

* Add some better tests
* Add or create some Docker useful features!

Contributing
------------

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

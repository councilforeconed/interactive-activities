# CEE Web Activities

Interactive educational activities by Bocoup and the Council for Economic
Education.

## Setup

Install this project's external dependencies:

   $ npm install

(*Optional*) Install the [Grunt](http://gruntjs.com) CLI globally. This enable
the use of the `grunt` commands detailed below:

    $ npm install -g grunt-cli

## Usage

This application supports two usage modes: development and production.

In **development mode**, server-side logging is enabled and client-side assets
are executed directly from their respective source files. This means any
changes to the client-side source files will be reflected each time the browser
is refreshed (provided caching is disabled).

In **production mode**, server-side logging is limited and client-side assets
are served from optimized files in the output directory. (These optimized files
must first be built before the project can operate in production mode, and any
change to the source files will require another build operation.)

### Development Mode

Simply run the server from the `src/` directory:

```sh
Usage: cd src && node . [options]

Options:
  --help, -h        Display this help info.
  --port, -p        Port to listen on.
  --hostname, -b    Address to bind to. (eg. "0.0.0.0")
  --activities, -a  Comma separated list of activities to start.
```

Alternatively, you may use [Grunt](http://gruntjs.com) to execute the same
task:

```sh
grunt dev
```

### Production Mode

To build a production-ready version of the project, run the following command:

```sh
grunt build
```

Then, you may run the server from the `out/` directory, using the same flags
that are available when running in production (see above):

```sh
cd out && node . [options]
```

Alternatively, you may use [Grunt](http://gruntjs.com) to build and run the
server in production mode:

```sh
grunt prod
```

## Testing

1. `grunt test`

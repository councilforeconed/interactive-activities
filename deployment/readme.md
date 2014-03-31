# Deployment Guide

This web application can be deployed on an Ubuntu Linux system that has the
bash shell, `apt-get`, and [Node.JS](http://nodejs.org) version 0.10 installed.

The `setup.sh` script will install the web application. This script will
function correctly as-is, but it may be configured by setting the following
environmental variables:

    NODE_USER:   a name for the user that should run the application
    PROJECT_DIR: an absolute path to the directory in which to initialize the
                 project
    GIT_URL:     the URL of the git directory
    KEY_DIR:     (optional) a directory containing SSH keys necessary for git
                 access; if the project is open-source, this is not necessary

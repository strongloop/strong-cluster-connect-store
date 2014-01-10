# Connect Session Store for Cluster

[![Build Status](https://travis-ci.org/strongloop/strong-cluster-connect-store.png?branch=master)](https://travis-ci.org/strongloop/strong-cluster-connect-store)
[![NPM version](https://badge.fury.io/js/strong-cluster-connect-store.png)](http://badge.fury.io/js/strong-cluster-connect-store)

## Overview

Strong-cluster-connect-store is an implementation of connect session store
using node's native cluster messaging. It provides an easy way for using
sessions in connect/express based applications running in a node cluster.

Features:

- Supports both connect and express.
- No dependencies on external services.
- Module is shipped without connect, it will use *your* version of connect
  or express.
- Covered by unit-tests.
 
## Documentation

For complete documentation, see [StrongLoop Documentation | Strong Cluster Connect Store](http://docs.strongloop.com/display/DOC/Strong+Cluster+Connect+Store).

## Installation

```sh
$ npm install strong-cluster-connect-store
```

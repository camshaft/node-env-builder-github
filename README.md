node-env-builder-github
=======================

GitHub backend for env-builder

Usage
-----

```js
var builder = require('env-builder');
var github = require('env-builder-github');

var env = 'prod';
var types = ['ui', 'api'];
var app = 'my-app';
var path = 'my-org/my-config-repo';

var conf = github(path);

builder(env, types, app, conf, function(err, ENV) {

});
```

Authentication
--------------

To access a private repo use one of the following combinations:

### Username/password

Set the following in the environment:

```sh
GITHUB_USERNAME=camshaft
GITHUB_PASSWORD=my-pass-123
```

### Auth token

Set the following in the environment:

```sh
GITHUB_TOKEN=github-auth-token-123
```

### Options

Pass `auth` in as an option:

```js
var github = require('env-builder-github');

var conf = github(path, {
  auth: {
    username: 'camshaft',
    password: 'my-pass-123'
  }
});
```

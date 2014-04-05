/**
 * Module dependencies
 */

var superagent = require('superagent');
var envs = require('envs');
var netrc = require('netrc');
var join = require('path').join;

var USERNAME = envs('GITHUB_USERNAME');
var PASSWORD = envs('GITHUB_PASSWORD');
var TOKEN = envs('GITHUB_TOKEN');

/**
 * Initialize ENV from source on github
 *
 * @param {String} source
 * @param {Object} opts
 * @return {Function}
 */

module.exports = function(source, opts) {
  var client = init(source, opts || {});
  return function() {
    return function(key) {
      return dirHandle(key, client, key === 'default');
    };
  };
};

function dirHandle(dir, client, stop) {
  return function() {
    return function(key) {
      var path = join(dir, key);
      if (stop) return readEnv(path, client);
      return dirHandle(path, client, true);
    };
  };
}

function readEnv(path, client) {
  return function(fn) {
    client(path, function(err, ENV) {
      if (err) return fn(err);
      fn(null, ENV);
    });
  };
}

function init(source, opts) {
  source = source.replace(/^http(s)?:\/\/github\.com/, '');
  var version = require('./package.json').version;
  var host = envs('GITHUB_HOST', 'https://api.github.com');
  var auth = authenticate(opts);

  return function(path, fn) {
    var url = host + '/repos/' + source + '/contents/' + path;
    superagent
      .get(url)
      .set('accept', 'application/vnd.github.3.raw')
      .set('user-agent', 'node-env-builder/' + version)
      .auth(auth.username, auth.password)
      .buffer(true)
      .end(function(err, res) {
        if (err) return fn(err);
        process.stderr.write('.');
        if (res.status === 403) return fn(new Error('Could not authenticate ' + source));
        if (res.status === 404) return fn(null, {});
        if (res.error) return fn(res.error);
        var ENV = parse(res.text);
        fn(null, ENV);
      });
  };
}

function parse(contents) {
  if (!contents) return {};
  return contents.split('\n').reduce(function(ENV, line) {
    var parts = line.split('=');
    ENV[parts[0]] = parts[1];
    return ENV;
  }, {});
}

function authenticate(opts) {
  if (opts.auth) return opts.auth;
  if (USERNAME && PASSWORD) return {username: USERNAME, password: PASSWORD};
  if (TOKEN) return {username: TOKEN, password: 'x-oauth-basic'};
  var auth = netrc()['github.com'];
  if (auth) return {username: auth.login, password: auth.password};
}

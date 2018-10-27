var path = require('path');
var spawn = require('child_process').spawn;
var debug = require('debug')('electron-squirrel-startup');
var app = require('electron').app;
var fs = require('fs');
var os = require('os');

var desktopLinkExists = function(channel) {
  var linkName
  switch (channel) {
    case 'nightly':
      linkName = 'BraveNightly'
      break
    case 'developer':
      linkName = 'BraveDeveloper'
      break
    case 'beta':
      linkName = 'BraveBeta'
      break
    case 'dev':
      linkName = 'Brave'
      break
    default:
      linkName = 'Brave'
  }
  return fs.existsSync(path.join(os.homedir(), 'desktop', `${linkName}.lnk`))
}

var run = function(args, done) {
  var updateExe = path.resolve(path.dirname(process.execPath), '..', 'Update.exe');
  debug('Spawning `%s` with args `%s`', updateExe, args);
  spawn(updateExe, args, {
    detached: true
  }).on('close', done);
};

var check = function(channel = 'dev') {
  if (process.platform === 'win32') {
    var cmd = process.argv[1];
    debug('processing squirrel command `%s`', cmd);
    var target = path.basename(process.execPath);

    let userDataDirArg = '--user-data-dir-name=brave-' + channel

    if (cmd === '--squirrel-install') {
      if (channel === 'dev') {
        run(['--createShortcut=' + target + ''], app.quit);
        run(['--createShortcut=' + target + '', '--shortcut-locations=DuplicateDesktop', '--process-start-args=--launch-muon'], app.quit);
      } else {
        run(['--createShortcut=' + target + '', '--process-start-args=' + userDataDirArg], app.quit);
        run(['--createShortcut=' + target + '', '--shortcut-locations=DuplicateDesktop', '--process-start-args=' + userDataDirArg + ' --launch-muon'], app.quit);
      }
      return true;
    }
    if (cmd === '--squirrel-updated') {
      if (desktopLinkExists(channel)) {
        if (channel === 'dev') {
          run(['--createShortcut=' + target + ''], app.quit);
          run(['--createShortcut=' + target + '', '--shortcut-locations=DuplicateDesktop', '--process-start-args=--launch-muon'], app.quit);
        } else {
          run(['--createShortcut=' + target + '', '--process-start-args=' + userDataDirArg], app.quit);
          run(['--createShortcut=' + target + '', '--shortcut-locations=DuplicateDesktop', '--process-start-args=' + userDataDirArg + ' --launch-muon'], app.quit);
      }
      }
      return true;
    }
    if (cmd === '--squirrel-uninstall') {
      run(['--removeShortcut=' + target + '', '--shortcut-locations=Desktop,StartMenu,DuplicateDesktop'], app.quit);
      return true;
    }
    if (cmd === '--squirrel-obsolete') {
      app.quit();
      return true;
    }
  }
  return false;
};

module.exports = check;

#!/usr/bin/env node

/**
 * TODO:
 * 
 * Välja vilken mapp/fil man ska kolla eller plocka cwd
 * Snygga till kod
 * Felhantering
 *
 * 
 * Olika inställningar för att använda prefix eller ej
 * Options för komprimering
 *
 * Testfall för modulen
 * 
 */



var watch = (function() {
  // Require modules
  var fs = require('fs'),
      crypto = require('crypto'),
      m_path = require('path'); // Module path => m_path

  // Exposed function
  function fn(path, callback, filter) {
    console.log(col('Watching: ', 'c') + path);


    // Check if path exists
    if(!fs.existsSync(path)) {
      throw 'No such file or directory exists:\n\t' + path;
    }

    var stat = fs.lstatSync(path);

    var obj = {
      path: path,
      callback: callback,
      filter: filter,
      fn: cb,
      stat: stat,
      fileHash: {}
    };


    // Unique function for every path
    // Perhaps created before
    function cb(event, filename) {

      // #Note
      // If filename === null , the file has been removed

      if(!obj)
        throw 'Could not fetch object associated with function.';

      // Resolve full path
      var path = obj.stat.isFile() ? filename : m_path.resolve(obj.path, filename);



      // Check if file still exists
      if(!fs.existsSync(path)) {
        // Call callback with information
        // or just return ???????
        return;
      }


      // Check options to filter out file-types
      if(obj.filter) {
        var ext = m_path.extname(filename).replace('.', '');

        // If extension is not in options we return;
        if(obj.filter.indexOf(ext) === -1) {
          return;
        }
      }


      // If there doesn't exist any hash in our cache for the file
      // we create it to default empty
      if(!obj.fileHash[path])
        obj.fileHash[path] = '';


      // Change to Async stream into crypto
      var file_str = fs.readFileSync(path, 'utf8');
      var hash = crypto.createHash('sha1').update(file_str).digest('hex');

      // If nothing has changed
      if(obj.fileHash[path] === hash) {

        return;
      }


      // Update the hash value
      obj.fileHash[path] = hash;


      // File has changed -> call the callback
      obj.callback(event, {
        filename: filename,
        fullPath: path,
        fileString: file_str
      });
    }


    // Bind the watch
    fs.watch(path, cb);
  }

  return fn;
})();



function parseLess(event, data) {

  var less = require('less'),
      fs = require('fs'),
      prefixr = require('./prefixr.js');


  try {

    // Render less to css
    less.render(data.fileString, function(e, css_data) {

      // Prefix css
      var css;
      try {
        css = prefixr.parseCSS(css_data, Options.compress);
      } catch(ex) {
        css = css_data;
      }

      var css_file_name = data.fullPath.substr(0, data.fullPath.lastIndexOf('.')) + '.css';

      fs.writeFile(css_file_name, css, function(err) {
        if(err)
          throw err;
      });
    });
  } catch(ex) {
    console.log(ex);
  }
}


/////////////
// OPTIONS //
/////////////
// 
// // Arguments from command line when invoked
// args = process.argv.splice(2);
// 
// if no args:
//   Watch process.cwd()
// else:
//   Watch each path in args relative to process.cwd() (alt. full path)
// 
// Alternatively use some sort of config file to determine watch paths
// 
function checkArgs() {
  var args = process.argv.splice(2);

  if(args.length === 0) {
    Options.paths[0] = '.';
  }
  else {
    Options.paths.push.apply(Options.paths, args);
  }
}


// Start watching
// Uses Options-object
function startWatch() {
  var resolve = require('path').resolve;


  if(!Options.paths)
    Options.paths = ['.'];

  // For each path in Options.paths
  for(var path_n = 0, path_len = Options.paths.length; path_n < path_len; ++path_n){
    var path = Options.paths[path_n];
    
    watch(resolve(path), parseLess, Options.filter);
  }
}

var col = (function() {
  var colors = {
    'black': '\033[31m',
    'r': '\033[31m',
    'g': '\033[32m',
    'y': '\033[33m',
    'b': '\033[34m',
    'm': '\033[35m',
    'c': '\033[36m',
    'w': '\033[37m',
    'reset': '\033[0m'
  };

  return function(str, c) {
    var r = colors[c] || colors['reset'];
    return r + str + colors['reset'];
  };
})();



var Options = {
  paths: [],
  filter: ['less'],
  compress: true
};


checkArgs();


///////////
// Start //
///////////
startWatch();
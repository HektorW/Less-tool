var watch = (function() {
  // Require modules
  var fs = require('fs'),
      crypto = require('crypto'),
      m_path = require('path'); // Module path => m_path



  // Storage for all objects
  var cache = {};
  // Function to fetch the object associated with arguments.callee
  cache.get = function(fn) {
    for(var v in this) {
      if(this[v].fn === fn) {
        return this[v];
      }
    }

    return null;
  };


  // Exposed function
  function fn(path, callback, opt) {
    console.log('Watching: ' + path);


    // Check if path exists
    if(!fs.existsSync(path)) {
      throw 'No such file or directory exists:\n\t' + path;
    }

    var stat = fs.lstatSync(path);

    // Add a new object bound with path, opts and callback
    // if(!cache[path]) {
    //   cache[path] = {
    //     path: path,
    //     callback: callback,
    //     opt: opt,
    //     fn: cb,
    //     stat: stat,
    //     fileHash: {}
    //   };
    // }

    var obj = {
      path: path,
      callback: callback,
      opt: opt,
      fn: cb,
      stat: stat,
      fileHash: {}
    };


    // Unique function for every path
    // Perhaps created before
    function cb(event, filename) {

      // #Note
      // If filename === null , the file has been removed


      // Get our object correct object
      // var obj = cache.get(cb);

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
      if(obj.opt) {
        var ext = m_path.extname(filename).replace('.', '');

        // If extension is not in options we return;
        if(obj.opt.indexOf(ext) === -1) {
          
          return;
        }
      }

      
      // If there doesn't exist any hash in our cache for the file
      // we create it to default empty
      if(!obj.fileHash[path])
        obj.fileHash[path] = '';


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
        fullpath: path,
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
      prefix = require('./prefixr.js');

  var vendors = ['-webkit-', '-moz-', '-ms-'];
  var styles = [
    '@keyframes', 'transform', 'border-radius'
  ];


  // Render less to css
  less.render(data.fileString, function(e, css_data) {

    // Prefix css
    var css;
    try {
      css = prefix(css_data, false);
    } catch(ex) {
      css = css_data;
    }

    var css_file = data.fullpath.substr(0, data.fullpath.lastIndexOf('.')) + '.css';

    fs.writeFile(css_file, css, function(err) {
      if(err)
        throw err;
    });
  });

  
}


watch('c:/users/hektor/dropbox/webb/linkpage/', parseLess, ['less']);
// watch('style.less', parseLess);
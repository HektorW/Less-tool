var css = require('css'),
    fs = require('fs');




var properties = {
  'transform': ['-webkit', '-ms'],
  'transition': ['-webkit'],
  'border-radius': ['-webkit'],
  'animation': ['-webkit'],
  'border-image': ['-webkit'],
  'box-shadow': ['-webkit'],
  'box-sizing': ['-webkit', '-moz'],
  'linear-gradient': ['-webkit'],
  'perspective': ['-webkit'],
  'transform-style': ['-webkit']
};
properties.get = function(p) {
  for(var v in this) {
    if(v === p)
      return this[v];
  }
  return null;
};

var values = {
  'linear-gradient': ['-webkit']
};
values.get = function(v) {
  for(var i in this) {
    if(i === v)
      return this[v];
  }
  return null;
};




function parseCSS(data, compressed) {
  var o = css.parse(data);

  // console.log(JSON.stringify(o, null, '  '));


  var stylesheet = o.stylesheet,
      rules = stylesheet.rules;

  for(var r in rules) {
    var rule = rules[r];
    // console.log(rule.declarations );

    switch(rule.type) {
      case 'rule': {

        var dec = parseRule(rule);
        rule.declarations = dec;

      } break;
      case 'keyframes': {
        var k = parseKeyframe(rule);
        // console.log(rules);
        // console.log(k[0]);
        if(k.length > 0) {
          rules.push.apply(rules, k);
        }
        // console.log(rules);
      } break;
    }
  }

  
  return css.stringify(o, {compress: compressed || false});
}


// Rule
function parseRule(rule) {

  var declarations = [];


  for(var d in rule.declarations) {

    var dec = rule.declarations[d],
        property = dec.property,
        value = dec.value;



    // Check if property needs prefix
    var a = prefixProperty(dec);
    declarations.push.apply(declarations, a);


    // Check if value needs prefix
    var v = values.get(value);
    if(v !== null) {

    }
  }

  // console.log(rule.declarations);
  // console.log(declarations);
  return declarations;
}


function prefixProperty(dec, filter) {
  var prop = dec.property;
  var p = properties.get(prop);
  var d = [];
  if(p) {

    for(var i = 0; i < p.length; i++) {
      if(filter && filter.indexOf(p[i]) === -1)
        continue;

      d.push({
        type: dec.type,
        property: p[i] + '-' + prop,
        value: dec.value
      });
    }

  }

  d.push({
    type: dec.type,
    property: prop,
    value: dec.value
  });

  return d;
}


// Keyframe
function parseKeyframe(keyframe) {

  var prefixes = [
    '-webkit'
  ];

  var extras = [];
  
  for(var p in prefixes) {

    var k = {
      type: 'keyframes',
      name: keyframe.name,
      vendor: prefixes[p] + '-',
      keyframes: []
    };

    for(var i in keyframe.keyframes) {

      var key = {
        type: 'keyframe',
        values: keyframe.keyframes[i].values
      };

      var dec = [];

      for(var d in keyframe.keyframes[i].declarations) {

        var dp = prefixProperty(keyframe.keyframes[i].declarations[d], prefixes[d]);
        dec.push.apply(dec, dp);

      }

      key.declarations = dec;

      k.keyframes.push(key);
    }

    extras.push(k);

  }

  return extras;
}



function prefix(css, compress){
  if(compress === undefined)
    compress = true;
  return parseCSS(css, compress);
}


function test(){
  var path = "c:/users/hektor/dropbox/webb/linkpage/bump.css";

  fs.readFile(path, 'utf8', function(err, data) {
    var s = parseCSS(data);

    console.log(s);
  });
}



module.exports = prefix;
/**
 * TODO:
 *
 * Strukturera upp koden / snygga till
 *
 * Hantera values & properties
 *  
 * Lägga till fler properties
 *
 * Se efter prefixes för diverse properties
 *
 * Skapa en json fil som innehåller alla prefix-regler
 * 
 */


// Options för vendor-prefixes
// Lokala / Globala


/**
 * ##########
 * Parse(css) -> obj-tree
 * obj = {
 *   type: 'stylesheet',
 *   stylesheet: {
 *     rules: []
 *   }
 * }
 * 
 * ##########
 * Gå igenom all rules i obj.stylesheet
 * rules: [
 *   {
 *     type: 'rule',
 *     selectors: ['div'],
 *     declarations: []
 *   },
 *   {
 *     type: 'comment',
 *     comment: '...'
 *   },
 *   {
 *     type: 'keyframes',
 *     name: 'spinning-animation',
 *     vendor: '-webkit-' || undefined
 *     keyframes: []
 *   }
 * ]
 *
 *
 * ##########
 * # TYPE: RULE
 * För varje declaration i rule.declarations
 *   Se om property och/eller value behöver prefix
 *
 *  declarations: [
 *    {
 *      type: 'declaration',
 *      property: 'top',
 *      value: '10px'
 *    }
 *  ]
 *
 * Pesudo:
 *   dec = []
 *   for d in declarations:
 *     if d.propetry need prefix:
 *       if not dec.containts -> prefixed
 *         dec.add -> prefixed
 *     dec.add d.property
 *       
 *   for d in dec:
 *     if d.value needs prefix:
 *
 *
 * if d.property needs prefix:
 *   if d.value needs prefix:
 *     prefix value
 *   prefix property
 * else
 *   if d.value needs prefix:
 *     prefix value
 *
 *
 *
 * #########
 * # TYPE: KEYFRAMES
 * Gå igenom varje keyframe i rule.keyframes
 *
 * keyframes: [
 *   {
 *     type: 'keyframe',
 *     values: ['0%'],
 *     declarations: []
 *   },
 *   {
 *     type...
 *   }
 *   ...
 * ]
 *
 * För varje declaration i keyframes[n].declarations
 *   -> samma som för rule[n].declarations
 * 
 */



/**
 * Properties:
 * Antingen har den vendor prefix:
 *   Se om värdet behöver samma prefix
 * Eller behöver den prefix:
 *   För varje prefix:
 *     Se så prefixad property inte redan finns
 *     Se om värdet behöver samma prefix
 *   Lägg till prefixade properties + values
 * Eller behöver den inte prefix:
 *   Se om värde behöver prefix:
 *     Hämta alla properties av samma typ
 *     För varje property:
 *       Om prefixat värde inte finns:
 *         Lägg till prefixat värde i en ny property
 *       
 * 
 */




log = console.log;


var css = require('css');


module.exports = function prefix(css, compress) {
  return Prefixr.parseCSS(css, compress);
};






var PrefixrNew = {

  prefixes: {
    'transform': ['-webkit', '-ms'],
    'transition': ['-webkit'],
    'border-radius': ['-webkit'],
    'animation': ['-webkit'],
    'border-image': ['-webkit'],
    'box-shadow': ['-webkit'],
    'box-sizing': ['-webkit', '-moz'],
    'linear-gradient': ['-webkit'],
    'perspective': ['-webkit'],
    'transform-style': ['-webkit'],
    'transform-origin': ['-webkit']
  },

  vendors: [
    '-webkit',
    '-moz',
    '-ms',
    '-o'
  ],


  parseRule: function(rule, filter) {

    var properties = {};

    // For each declaration in rule.declarations
    for(var declaration_n = 0, declaration_len = rule.declarations.length; declaration_n < declaration_len; declaration_n++){
      var declaration = rule.declarations[declaration_n];
      this.parseDeclaration(properties, declaration);
    }


    var declarations = [];

    // For each property in properties
    for(var p in properties) {
      var property = properties[p];
     
      // For each prefix in property
      for(var prefix in property) {
        // var prefix = property[prefix_n];
        
        var value = property[prefix];

        // De vars property inte har prefix
        if(prefix == 'noprefix') {

          // For each value_prefix in value
          for(var value_prefix in value) {

            declarations.push({
              type: 'declaration',
              property: property,
              value: value[value_prefix]
            });

          }
        }


        // Properties som har prefix
        else {
          declarations.push({
            type: 'declaration',
            property: prefix + property,
            value: value
          });
        }
      }
    }
  },


  // Tar hand om enstaka deklaration
  parseDeclaration: function(properties, declaration) {
    var name     = this.getName(declaration.property),
        prefix   = this.getPrefix(declaration.property) || null,
        value    = declaration.value,
        property = properties[name],
        unprefixed, value_prefix;

    if(!property) {
      unprefixed = this.unprefix(value);
      property = properties[name] = this.initPrefixedProperties(name, unprefixed);
    }

    // If property has a prefix just overwrite whatever stands
    if(prefix){
      property[prefix] = this.prefixValue(value, prefix);
    }
    else {
      value_prefix = this.getPrefix(value);
      property['noprefix'][value_prefix || 'noprefix'] = this.prefixValue(value);
      // this.parseValue(property['noprefix'], declaration.value);
    }
  },




  /**
   * { Parse Value }
   * @param  {Object} property  Property where we add the data
   * @param  {String} value     Value we are parsing
   */
  parseValue: function(property, value) {
    var values = this.getValues(value),
        prefix = this.getPrefix(values),
        unprefixed,
        prefixed_values;


    // Om något värde redan har prefix lägg till det först
    if(prefix)  // Anropa prefixValue för att säkerhetsställa prefix på alla values som behöver
      property[prefix] = prefixValue(value, prefix);


    // // Plocka fram en helt oprefixad version av value
    // unprefixed = this.unprefix(value);
    // // Om det inte redan är tillagt en oprefixad eller detta värde inte har prefix
    // // så lägger vi till värdet i property
    // if(!prefix || !property['noprefix'])
    //   property['noprefix'] = unprefixed;

    
    // // Gå igenom alla vendors
    // vendors = [ '...' ];

    // // For each vendor in vendors:
    // for(var vendor_n = 0, vendor_len = vendors.length; vendor_n < vendor_len; vendor_n++){
    //   var vendor = vendors[vendor_n];
      
    //   // Om vi redan har ett värde för denna vendor så lägger vi inte till ett standard-värde
    //   if(property[vendor])
    //     continue;

    //   // Testa prefixa värdet med vendorn
    //   prefixed_values = prefixValue(unprefixed, vendor);
    //   // Om värdet är förändrat så lägger vi till det
    //   if(prefixed_values != unprefixed)
    //     property[vendor] = prefixed_value;
    // }
  },



  // Ger tillbaka ett objekt med alla prefixes för property-typen
  // Value ska inte ha några prefix
  initPrefixedProperties: function(name, value) {
    // value = this.unprefix(value);

    var prefixes = prefix_rules[name];

    var obj = {
      noprefix: {
      }
    };

    // For each prefix in prefixes
    for(var prefix_n = 0, prefix_len = prefixes.length; prefix_n < prefix_len; prefix_n++){
      var prefix = prefixes[prefix_n];
      
      // Ge den ett standardvärde med potentiell prefix
      obj[prefix] = prefixValue(value, prefix);
    }


    // Gå igenom alla vendors
    var vendors =  this.vendors; //[ '...' ]; // # Ge värde

    // For each vendor in vendors:
    for(var vendor_n = 0, vendor_len = vendors.length; vendor_n < vendor_len; vendor_n++){
      var vendor = vendors[vendor_n];
      
      // Om vi har en property med denna vendor så lägger vi inte till
      if(obj[vendor])
        continue;

      // Testa prefixa värdet med vendorn
      prefixed_value = prefixValue(value, vendor);

      // Om värdet är förändrat så lägger vi till det
      if(prefixed_value != value)
        obj[vendor] = prefixed_value;
    }

    return obj;
  },


  // Returnerar namnet utan prefix
  getName: function(prop) {

  },

  // Returnerar prefixet från propertien eller null om ingen finns
  getPrefix: function(prop) {
    return getPrefixed(prop);
  },

  getPrefixed: function(property) {
    for(var v in this.vendors) {
      if(property.indexOf(this.vendors[v]) !== -1)
        return this.vendors[v];
    }
    return undefined;
  },

  getPrefixes: function(value, filter) {
    var v = this.prefixes[value];

    if(v && filter) {
      var f = [];
      for(var n in v)
        if(filter.indexOf(v[n]) !== -1)
          f.push(v[n]);

      return (f.length > 0)? f : undefined;
    }

    return v;
  },

  replaceValue: function(str, value, replacer) {
    var rgx = new RegExp("(^| |,)"+value);

    return str.replace(rgx, function(match) {
      return ((match[0] === ' ' || match[0] === ',')? match[0] : '') + replacer;
    });
  },

  // Ska returnera en sträng antingen med det inskickade prefixet eller
  // utan prefix
  prefixValue: function(value, prefix) {
    // Gets the relevant information from value-string
    var value_select_rgx = /(^| |,)(-?[A-z]+)+/g;
    // And stores in @values
    var values = value.match(value_select_rgx);


    // If there were no relevant values we return
    if(!values)
      return [value];

    // Lazy-isch evaluation of function
    var mapValues = function(e){ return e.replace(' ', '').replace(',', ''); };
    // Trim leftovers (space or ,) from RegExp capture
    values = values.map(mapValues);

    // Resulting array that is returned
    var res = [];

    for(var ven in this.vendors) {
      var indices = [];
      var vendor = this.vendors[ven];

      // Check filter
      if(filter && filter.indexOf(vendor) === -1)
        continue;

      for(var v in values) {
        var val = values[v];

        var prefixes = this.getPrefixes(val, vendor);

        if(!prefixes)
          continue;

        indices.push(v);
      }

      if(indices.length > 0) {
        var str = value;

        for(var i in indices) {
          str = this.replaceValue(str, values[i], vendor+'-'+values[i]);
        }

        res.push(str);
      }
    }

    if(res.length === 0 || !filter)
      res.push(value);



    return res;

  },

  // Returnerar en sträng utan prefixes
  unprefix: function(value) {
    // #Untested
    // For each vendor in this.vendors
    for(var vendor_n = 0, vendor_len = this.vendors.length; vendor_n < vendor_len; ++vendor_n){
      var vendor = this.vendors[vendor_n];
      value.replace(vendor, '');
    }
  }
};






var Prefixr = {
  prefixes: {
    'transform': ['-webkit', '-ms'],
    'transition': ['-webkit'],
    'border-radius': ['-webkit'],
    'animation': ['-webkit'],
    'border-image': ['-webkit'],
    'box-shadow': ['-webkit'],
    'box-sizing': ['-webkit', '-moz'],
    'linear-gradient': ['-webkit'],
    'perspective': ['-webkit'],
    'transform-style': ['-webkit'],
    'transform-origin': ['-webkit']
  },

  vendors: [
    '-webkit',
    '-moz',
    '-ms',
    '-o'
  ],


  keyframes_prefixes: [
    '-webkit'
  ],



  // #Kommentar:
  // Lägger inte till fler properties om en redan är prefixad
  // Behöver fixas
  // 
  // En tanke är följande pseudo:
  // 
  // Lägg till alla properties som finns prefix + oprefix i R
  // För varje prop i R:
  //   Hämta alla prefix för values i V
  //   För varje val i V:
  //     Se om val redan finns


  // Om en property behöver prefix  kollar den inte alla values för prefix
  // Ex:
  //  transition: transform 1s;
  //  
  //  Transition behöver -webkit prefix
  //  transform behöver -webkit och -ms prefix
  //  -ms missas i detta fallet


  // Angående keyframes
  // Just nu finns inget sätt att filtrera bort prefixes
  // Dvs. om det finnns @-webkit-keyframes så behöver webkit inte finnas med i @keyframes
  // Parsern ser heller inte om det redans finns en keyframe med samma namn och prefixes

  parseCSS: function(data, compress) {
    if(compress === undefined)
      compress = true;

    var tree = css.parse(data);

    if(!tree)
      throw "Couldn't parse css data.";

    var stylesheet = tree.stylesheet;

    // Loop through rules in stylesheet
    for(var r in stylesheet.rules) {
      var rule = stylesheet.rules[r];


      // Check typ of rule
      switch(rule.type) {

        case 'rule': {

          this.parseRule(rule);

        } break;


        case 'keyframes': {

          this.parseKeyframes(stylesheet, rule);

        } break;


        case 'comment': {
          // Don't parse
        } break;
      }
    }


    // Stringify and return
    return css.stringify(tree);
  },

  parseRule: function(rule) {
    var dec = this.parseDeclarations(rule.declarations);

    rule.declarations = dec;
  },

  parseKeyframes: function(stylesheet, keyframes) {
    if(keyframes.vendor)


    // Loop through keyframes in keyframe
    for(var k in keyframes.keyframes) {
      var keyframe = keyframes.keyframes[k];

      var dec = this.parseDeclarations(keyframe.declarations);
      keyframe.declarations = dec;


    }

  },

  parseKeyframe: function(keyframe) {

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
  },

  parseDeclarations: function(declarations, filter) {

    // Storage for the prefixed declaration
    var new_declarations = [];

    // Loop through declarations
    for(var d in declarations) {
      var declaration = declarations[d];

      var property = declaration.property,
          value = declaration.value,
          current_prefix = this.getPrefixed(property);



      // Hämta alla prefix för property
      // Även om den redan har prefix
      











      // If property already is prefixed
      // And the prefix is the same as filter
      if(current_prefix !== undefined &&  (!filter || current_prefix == filter)) {


        // See if values need the same prefix
        var prefixed_value = this.prefixValue(declaration.value, current_prefix);

        new_declarations.push({
          type: declaration.type,
          property: property,
          // The first element should be the one with the right filter
          value: prefixed_value[0]
        });


        // Continue with the loop
        continue;
      }

      // See if property needs prefix
      var property_prefixes = this.getPrefixes(property, filter);

      // If we got something to prefix
      if(property_prefixes !== undefined) {

        // For each prefix
        for(var p in property_prefixes) {
          var prefix = property_prefixes[p];
          var prefixed_property = prefix + '-' + property;

          // See if we already have this property in declaration
          if(this.declarationHasProperty(declaration, prefixed_property))
            continue;

          var fixed_value = this.prefixValue(declaration.value, prefix);

          // See if value needs the same prefix as the property
          new_declarations.push({
            type: declaration.type,
            property: prefixed_property,
            value: fixed_value[0]
          });




        }

        // Push the standard as well if we don't filter
        if(!filter)
          new_declarations.push(declaration);

      }


      // Else we check for value prefixes
      else {
        // Check if value needs to be prefixed
        var values = this.prefixValue(declaration.value, filter);

        var prop = declaration.property;

        for(var v in values) {
          var val = values[v];

          if(this.declarationHasPropertyAndValue(declaration, prop, val))
            continue;

          new_declarations.push({
            type: declaration.type,
            property: prop,
            value: val
          });

        }

      }

    }


    return new_declarations;
  },

  declarationHasPropertyAndValue: function(dec, prop, val) {
    var i, len;
    for(i = 0, len = dec.length; i < len; i++){
      if(dec[i].property == prop && dec[i].value == val)
        return true;
    }
    return false;
  },

  declarationHasProperty: function(dec, prop) {
    var i, len;
    for(i = 0, len = dec.length; i < len; i++){
      if(dec[i].property == prop)
        return true;
    }
    return false;
  },

  replaceValue: function (str, v, r) {
    var rgx = new RegExp("(^| |,)"+v);

    return str.replace(rgx, function(match) {
      return ((match[0] === ' ' || match[0] === ',')? match[0] : '') + r;
    });
  },

  // Prefix the values
  prefixValue: function(value, filter) {

    // Gets the relevant information from value-string
    var value_select_rgx = /(^| |,)(-?[A-z]+)+/g;
    // And stores in @values
    var values = value.match(value_select_rgx);


    // If there were no relevant values we return
    if(!values)
      return [value];


    // Lazy-isch evaluation of function
    var mapValues = function(e){ return e.replace(' ', '').replace(',', ''); };
    // Replace leftovers (space or ,) from RegExp capture
    values = values.map(mapValues);

    // Resulting array that is returned
    var res = [];

    /**
     *
     * Values:
     * Skapa en array för prefixes
     *
     * res = []
     * För varje vendor:
     *   A = []
     *   För varje value:
     *     Om värdet behöver prefixet:
     *       Lägg till värdets index i A
     *   Om len(A) != 0:
     *     str = ''
     *     För a in A:
     *       str = str.replace(a, prefix+a)
     *     res.add(str)
     *     
     * 
     */

    for(var ven in this.vendors) {
      var indices = [];
      var vendor = this.vendors[ven];

      // Check filter
      if(filter && filter.indexOf(vendor) === -1)
        continue;

      for(var v in values) {
        var val = values[v];

        var prefixes = this.getPrefixes(val, vendor);

        if(!prefixes)
          continue;

        indices.push(v);
      }

      if(indices.length > 0) {
        var str = value;

        for(var i in indices) {
          str = this.replaceValue(str, values[i], vendor+'-'+values[i]);
        }

        res.push(str);
      }
    }

    if(res.length === 0 || !filter)
      res.push(value);



    return res;



    // for(var v in values) {

    //   // Prefixes for the value
    //   var prefixes = this.getPrefixes(values[v], filter);

    //   if(!prefixes)
    //     continue;

    //   for(var p in prefixes) {

    //     // Replacement
    //     var rep = prefixes[p] + '-' + values[v];

    //     // If it's already in the string we skip it
    //     if(value.indexOf(rep) !== -1)
    //       continue;

    //     // res.push(value.replace(values[v], prefixes[p]+'-'+values[v]));
    //     res.push(
    //       this.replaceValue(value, values[v], rep)
    //     );

    //   }

    // }

    // // Lastly we add the supplied value
    // res.push(value);

    // return res;
  },

  getPrefixed: function(property) {
    for(var v in this.vendors) {
      if(property.indexOf(this.vendors[v]) !== -1)
        return this.vendors[v];
    }
    return undefined;
  },

  getPrefixes: function(value, filter) {
    var v = this.prefixes[value];

    if(v && filter) {
      var f = [];
      for(var n in v)
        if(filter.indexOf(v[n]) !== -1)
          f.push(v[n]);

      return (f.length > 0)? f : undefined;
    }

    return v;
  }
};






//////////
// TEST //
//////////
function test() {
  var log = console.log;

  // function getPrefixes(p, f) {
  //   log(p + '('+(f||'none')+'): ' + Prefixr.getPrefixes(p, f));
  // }

  // log('----Prefixes----');
  // getPrefixes('transform', '-webkit');
  // getPrefixes('linear-gradient');
  // getPrefixes('top');
  // getPrefixes('width');



  // function getPrefixed(p) {
  //   // return;
  //   log(p + ': ' + Prefixr.getPrefixed(p));
  // }

  // log();log();
  // log('----Prefixed----');
  // getPrefixed('transform');
  // getPrefixed('-webkit-transform');
  // getPrefixed('top');
  // getPrefixed('-moz-animation');
  // getPrefixed('-ms-animation');

  

  // function prefixValue(v, f) {
  //   // return;  
  //   log(v + '('+(f||'none')+'): ' + JSON.stringify(Prefixr.prefixValue(v, f)));
  // }

  // log();log();
  // log('----Prefix Value----');
  // prefixValue('top 30ms');
  // prefixValue('10px');
  // prefixValue('20%');
  // prefixValue('0');
  // prefixValue('linear-gradient');
  // prefixValue('transform 3s');
  // prefixValue('transform 3s', '-webkit');
  // prefixValue('transform 3s, transition 2s');
  // prefixValue('transform 3s, transition 2s', '-webkit');
  // prefixValue('10px', '-webkit');
  // prefixValue('top 30ms', '-webkit');


  // function replaceValue(str, v, r) {
  //   log(str + '('+v+' -> '+r+'): ' + Prefixr.replaceValue(str, v, r));
  // }

  // log();log();
  // log('----Replace value----');
  // replaceValue('transform 3s', 'transform', '-moz-transform');
  // replaceValue('top 3s, left 2s', 'bottom', '-ms-bottom');
  // replaceValue('top 3s,left 2s', 'left', '-ms-left');
  // replaceValue('linear-gradient(top, left, 300, 200)', 'linear-gradient', '-o-linear-gradient');
  // replaceValue('transform 2s, -webkit-transform 2s', 'transform', '-ms-transform');




  // function parseDeclarations(d, f) {
  //   log('#######');
  //   // log(JSON.stringify(d, null, ' ') + f + ' --->');
  //   log(JSON.stringify(Prefixr.parseDeclarations(d, f), null, ' '));
  // }

  // log();log();
  // log('----Parse Declarations----');
  // parseDeclarations(
  //   [
  //     {
  //       type: 'declaration',
  //       property: 'transition',
  //       value: 'transform 1s'
  //     },
  //     {
  //       type: 'declaration',
  //       property: 'background-image',
  //       value: 'linear-gradient(top, left, 300, 200)'
  //     }
  //   ]
  // );
  // parseDeclarations(
  //   [
  //     {
  //       type: 'declaration',
  //       property: 'transition',
  //       value: 'transform 1s'
  //     },
  //     {
  //       type: 'declaration',
  //       property: 'background-image',
  //       value: 'linear-gradient(top, left, 300, 200)'
  //     }
  //   ], '-webkit'
  // );


  // function decHasProp(d, p) {
  //   log(JSON.stringify(d, null, ' '));
  //   log(p + ': ' + Prefixr.declarationHasProperty(d, p));
  // }

  // log();log();
  // log('----Declaration Has Property----');
  // decHasProp(
  //   [
  //     {
  //       type: 'declaration',
  //       property: '-webkit-transition',
  //       value: 'transform 1s'
  //     },
  //     {
  //       type: 'declaration',
  //       property: 'left',
  //       value: '10s'
  //     }
  //   ], 'left'
  // );
  // 


  log();log();
  log('----Parse file----');
  var fs = require('fs');
  fs.readFile('c:/users/hektor/dropbox/webb/linkpage/bump.css', 'utf8', function(e, data){
    log(Prefixr.parseCSS(data));
  });
}


test();
















// var css = require('css'),
//     fs = require('fs');




// var properties = {
//   'transform': ['-webkit', '-ms'],
//   'transition': ['-webkit'],
//   'border-radius': ['-webkit'],
//   'animation': ['-webkit'],
//   'border-image': ['-webkit'],
//   'box-shadow': ['-webkit'],
//   'box-sizing': ['-webkit', '-moz'],
//   'linear-gradient': ['-webkit'],
//   'perspective': ['-webkit'],
//   'transform-style': ['-webkit']
// };
// properties.get = function(p) {
//   for(var v in this) {
//     if(v === p)
//       return this[v];
//   }
//   return null;
// };

// var values = {
//   'linear-gradient': ['-webkit']
// };
// values.get = function(v) {
//   for(var i in this) {
//     if(i === v)
//       return this[v];
//   }
//   return null;
// };




// function parseCSS(data, compressed) {
//   var o = css.parse(data);

//   console.log(JSON.stringify(o, null, '  '));


//   var stylesheet = o.stylesheet,
//       rules = stylesheet.rules;

//   for(var r in rules) {
//     var rule = rules[r];
//     // console.log(rule.declarations );

//     switch(rule.type) {
//       case 'rule': {

//         var dec = parseRule(rule);
//         rule.declarations = dec;

//       } break;
//       case 'keyframes': {
//         var k = parseKeyframe(rule);
//         // console.log(rules);
//         // console.log(k[0]);
//         if(k.length > 0) {
//           rules.push.apply(rules, k);
//         }
//         // console.log(rules);
//       } break;
//     }
//   }

  
//   return css.stringify(o, {compress: compressed || false});
// }


// // Rule
// function parseRule(rule) {

//   var declarations = [];


//   for(var d in rule.declarations) {

//     var dec = rule.declarations[d],
//         property = dec.property,
//         value = dec.value;



//     // Check if property needs prefix
//     var a = prefixProperty(dec);
//     declarations.push.apply(declarations, a);


//     // Check if value needs prefix
//     var v = values.get(value);
//     if(v !== null) {

//     }
//   }

//   // console.log(rule.declarations);
//   // console.log(declarations);
//   return declarations;
// }


// function prefixProperty(dec, filter) {
//   var prop = dec.property;
//   var p = properties.get(prop);
//   var d = [];
//   if(p) {

//     for(var i = 0; i < p.length; i++) {
//       if(filter && filter.indexOf(p[i]) === -1)
//         continue;

//       d.push({
//         type: dec.type,
//         property: p[i] + '-' + prop,
//         value: dec.value
//       });
//     }

//   }

//   d.push({
//     type: dec.type,
//     property: prop,
//     value: dec.value
//   });

//   return d;
// }


// // Keyframe
// function parseKeyframe(keyframe) {

//   var prefixes = [
//     '-webkit'
//   ];

//   var extras = [];
  
//   for(var p in prefixes) {

//     var k = {
//       type: 'keyframes',
//       name: keyframe.name,
//       vendor: prefixes[p] + '-',
//       keyframes: []
//     };

//     for(var i in keyframe.keyframes) {

//       var key = {
//         type: 'keyframe',
//         values: keyframe.keyframes[i].values
//       };

//       var dec = [];

//       for(var d in keyframe.keyframes[i].declarations) {

//         var dp = prefixProperty(keyframe.keyframes[i].declarations[d], prefixes[d]);
//         dec.push.apply(dec, dp);

//       }

//       key.declarations = dec;

//       k.keyframes.push(key);
//     }

//     extras.push(k);

//   }

//   return extras;
// }



// function prefix(css, compress){
//   if(compress === undefined)
//     compress = true;
//   return parseCSS(css, compress);
// }


// function test(){
//   var path = "c:/users/hektor/dropbox/webb/linkpage/bump.css";

//   fs.readFile(path, 'utf8', function(err, data) {
//     var s = parseCSS(data);

//     // console.log(s);
//   });
// }


// test();



// module.exports = prefix;
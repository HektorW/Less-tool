/**
 * TODO:
 *
 * Keyframes
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


// module.exports = function prefix(css, compress) {
//   return Prefixr.parseCSS(css, compress);
// };






var PrefixrNew = {

  // Testa regler
  prefixes: {
    'transform': ['-webkit', '-ms'],
    'transition': ['-webkit'],
    'border-radius': ['-webkit'],
    'animation': ['-webkit'],
    'border-image': ['-webkit'],
    'box-shadow': ['-webkit'],
    'box-sizing': ['-webkit', '-moz'],
    'linear-gradient': ['-webkit', '-moz', '-ms'],
    'perspective': ['-webkit'],
    'transform-style': ['-webkit'],
    'transform-origin': ['-webkit'],
    'appearance': ['-webkit', '-moz'],
    'sticky': ['-webkit'],
    'text-stroke': ['-webkit'],
    'flex': ['-webkit'],
    'flex-flow': ['-webkit'],
    'flex-direction': ['-webkit'],
    'order': ['-webkit']
  },

  vendors: [
    '-webkit',
    '-moz',
    '-ms',
    '-o'
  ],

  keyframe_prefixes: [
    '-webkit'
  ],


  // Used in unprefix() and getPrefix()
  prefix_regexp: /-(?:webkit|moz|ms|o)-/g,


  parseCSS: function(css_string, compress) {
    if(compress !== false)
      compress = true;

    var tree = css.parse(css_string);

    if(!tree)
      throw "Couldn't parse css string.";

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

          this.parseKeyframe(stylesheet, rule);

        } break;


        case 'comment': {
          // Don't parse
        } break;
      }
    }


    // Stringify and return
    return css.stringify(tree, {compress: compress});
  },

  parseKeyframe: function() {
  },

  // #Input
  // rule: {
  //   type: "rule",
  //   selectors: ['div'],
  //   declarations: [ ... ]
  // }
  // 
  // filter : "-webkit -moz" || undefined
  parseRule: function(rule, filter) {

    var properties = {};

    // For each declaration in rule.declarations
    // Går igenom varje declaration som finns i regeln
    for(var declaration_n = 0, declaration_len = rule.declarations.length; declaration_n < declaration_len; declaration_n++) {
      var declaration = rule.declarations[declaration_n];

      // parseDeclaration() lägger till declaration i properties-objektet
      // och hanterar den som det behövs
      // Lägger till alla olika properties som behöver prefix av samma property-typ e.g. -webkit-transform -> transform
      // Lägger till och matchar alla values som behöver prefix
      this.parseDeclaration(properties, declaration);
    }


    var declarations = [];

    // For each property in properties
    // Gå igenom alla properties som blivit tillagda av parseDeclaration()
    for(var property_name in properties) {
      /* Varje property ser ut såhär

          <NAME> (transition) : {
            'noprefix': {
              'noprefix': <VALUE> ('transform'),
              <PREFIX> '-ms': <VALUE> ('-ms-transform')
            },
            <PREFIX> '-webkit': <VALUE> ('-webkit-transform' || 'left'),
            <PREFIX> '-moz': <VALUE> ('-moz-transform')
          } 
      */
      var property = properties[property_name];
     
      // For each prefix in property
      for(var prefix in property) {
        // var prefix = property[prefix_n];
        
        var value = property[prefix];

        // De vars property inte har prefix
        if(prefix === 'noprefix') {

          // For each value_prefix in value
          for(var value_prefix in value) {

            declarations.push({
              type: 'declaration',
              property: property_name,
              value: value[value_prefix]
            });

          }
        }


        // Properties som har prefix
        else {
          declarations.push({
            type: 'declaration',
            property: prefix + '-' + property_name,
            value: value
          });
        }
      }
    }


    // Sätt den uppdaterade declarations i rule
    rule.declarations = declarations;

    return rule;
  },


  // Tar hand om enstaka deklaration
  parseDeclaration: function(properties, declaration) {
    var name        = this.unprefix(declaration.property), // #tested
        prop_prefix = this.getPrefix(declaration.property), // #tested
        value       = declaration.value,
        property    = properties[name],
        unprefixed_value, value_prefix;

    // If this type of property hasn't been added to properties-object already
    if(!property) {
      unprefixed_value = this.unprefix(value); // #tested
      property = properties[name] = this.initPrefixedProperties(name, unprefixed_value); //#untested
    }

    // If property has a prefix just overwrite whatever stands
    // Last value applies
    if(prop_prefix){
      // Make sure to prefix the value with same prefix
      property[prop_prefix] = this.prefixValue(value, prop_prefix); // #untested
    }
    else {
      // #design-val
      // Samma property <utan prefix> (e.g. background-image och linear-gradient)
      // med flera values kommer i detta fall få det värdet som kommer först i deklarationen som sitt noprefix-value
      // Values som inte har prefix på property skriver bara över om value har prefix, annars skriver den över noprefix.


      // Property isn't prefixed but value might be
      // Get the prefix for the value
      value_prefix = this.getPrefix(value); // #untested with values

      property['noprefix'][value_prefix || 'noprefix'] = this.prefixValue(value, value_prefix); //#untested

      // this.parseValue(property['noprefix'], declaration.value);
    }

    return properties;
  },


  // Ger tillbaka ett objekt med alla prefixes för property-typen
  // Value ska inte ha några prefix
  // Varken name eller value får ha prefix
  initPrefixedProperties: function(name, value) {
    // Onödig operation
    // name  = this.unprefix(name);
    // value = this.unprefix(value);

    // Get all prefixes associated with the property-name
    var prefixes = this.prefixes[name] || [];

    // Default object 
    var obj = {};
    obj.noprefix = {
      // Value needs to be prefixed and can therefore be applied directly
      noprefix: value
    };


    // Lägg till alla property-names som ska ha prefix
    for(var prefix_n = 0, prefix_len = prefixes.length; prefix_n < prefix_len; ++prefix_n){
      var prefix = prefixes[prefix_n];
      
      // Ge den ett standardvärde med potentiell prefix
      obj[prefix] = this.prefixValue(value, prefix); // #untested
    }

    // Add default version after prefixed for order
    // obj.noprefix = {
    //   // Value needs to be prefixed and can therefore be applied directly
    //   noprefix: value
    // };

    // Gå igenom alla vendors
    var vendors =  this.vendors;


    // Se om values behöver prefix
    for(var vendor_n = 0, vendor_len = vendors.length; vendor_n < vendor_len; ++vendor_n){
      var vendor = vendors[vendor_n];
      
      // Om vi har en property med denna vendor så lägger vi inte till under noprefix
      if(obj[vendor])
        continue;

      // Testa prefixa värdet med vendorn
      prefixed_value = this.prefixValue(value, vendor); // #untested

      // Om värdet är förändrat så lägger vi till det
      if(prefixed_value != value)
        obj['noprefix'][vendor] = prefixed_value;
    }

    return obj;
  },


  // Returnerar namnet utan prefix
  // Bytt namn från: getName -> unprefix
  unprefix: function(prop) {
    return prop.replace(this.prefix_regexp, '');
  },

  // Returnerar prefixet från propertien eller null om ingen finns
  getPrefix: function(prop) {
    var r = prop.match(this.prefix_regexp);
    return (r === null)? null : ('-' + r[0].replace(/-/g, ''));
  },

  getPrefixes: function(value, filter) {
    var v = this.prefixes[value] || undefined; // Don't need to explicitly set to undefined but it's clearer

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

  // Ska returnera en sträng antingen med det inskickade prefixet eller utan prefix
  // Om inget prefix skickas in eller är null så bri värdet oprefixat
  prefixValue: function(value, prefix) {
    // Om ett falskt-värde-prefix skickas in så returneras oprefixat value
    if(!prefix)
      return this.unprefix(value);


    // Gets the relevant information from value-string
    // Regular expression which selects only the properties in a string
    // They have a pattern
    var value_select_rgx = /(^| |,)(-?[A-z]+)+/g;
    // And stores in @values
    var values = value.match(value_select_rgx);

    // If there were no relevant values we return it as it were
    if(!values)
      return value;

    // Lazy-isch evaluation of function
    var mapValues = function(e){ return e.replace(' ', '').replace(',', ''); };
    // Trim leftovers (space or ,) from RegExp capture
    values = values.map(mapValues);



    // I detta skede
    // Vi har alla individuella värden i @values
    // Vi har att prefix att se om dessa värden behöver
    
    // Array som håller koll på vilka värden där det behövs prefix
    var indices = [];

    // For each val in values
    for(var val_n = 0, val_len = values.length; val_n < val_len; ++val_n){
      var val = values[val_n];
      
      // Prefixes associated with the value
      var prfx = this.prefixes[val];

      // If there were any prefixes and if our @prefix is one of them
      if(prfx && prfx.indexOf(prefix) !== -1) {
        // Push our index (@val_n) to indices
        indices.push(val_n);
      }
    }


    // For each index in indices
    for(var index_n = 0, index_len = indices.length; index_n < index_len; ++index_n){
      var index = indices[index_n];

      // Update @value with prefixed replacement for each @values that is in @indices
      value = this.replaceValue(value, values[index], prefix+'-'+values[index]);
    }

    return value;
  },
};




////////////
// EXPORT //
////////////
module.exports = PrefixrNew;





var Prefixr = {
 
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
};


// var assert = require('assert');

var prefixr = require('../prefixr.js');

var log = console.log;
var jstr = function(str, ind) {
  return JSON.stringify(str, null, ind || ' ');
};

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

var col = function(str, c) {
  var r = colors[c] || colors['reset'];
  return r + str + colors['reset'];
};

//////////
// TEST //
//////////
function test() {

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
  

  // -------------------------
}



// UNPREFIX
function unprefix() {
  log();log('----Get Name----');
  function f(p) {
    log(p + ': ' + col(prefixr.unprefix(p), 'g'));
  }
  f('transform');
  f('-webkit-transform');
  f('-moz-transition');
  f('appearance');
  f('list-style');
  f('-ms-box-shadow');
  f('left 1s, top 2s');
  f('-webkit-transform 300ms, -webkit-top 2s');
}


//  GET PREFIX
function getPrefix() {
  function f(p) {
    log(p + ': ' + col(prefixr.getPrefix(p), 'g'));
  }
  log();log('----Get Prefix----');
  f('transform');
  f('-webkit-transform');
  f('-moz-transition');
  f('appearance');
  f('list-style');
  f('-ms-box-shadow');
  f('-webkit-transform 300ms, -moz-top 2s');
}



// PREFIX VALUE
function prefixValue() {
  log();log('----Prefix Value----');
  function f(v, p) {
    log(v + ', (' + col(p, 'r') + '): ' + col(prefixr.prefixValue(v, p), 'g'));
  }
  f('10px', null);
  f('10px', '-ms');
  f('top 1s', '-webkit');
  f('transform 2s', '-webkit');
  f('transform 2s, appearance 30ms', '-webkit');
  f('transform 2s, appearance 30ms', '-moz');
  f('linear-gradient(45deg, blue, green)', '-webkit');
  f('linear-gradient(65deg, blue, green)', '-moz');
  f('linear-gradient(75deg, blue, green)', '-ms');
  f('linear-gradient(75deg, blue, green)');
}


// INIT PREFIXED PROPERTIES
function initPrefixedProperties() {
  log();log('---Init Prefixed Properties----');
  function f(prop, value){
    log(prop + ': ' + value);
    log(col(JSON.stringify(prefixr.initPrefixedProperties(prop, value), null, ' '), 'g'));
  }

  f('top', '10px');
  f('transform', 'rotateY(120deg)');
  f('background-image', 'linear-gradient(45deg, blue, green)');
  f('transition', 'transform 30ms');
  f('transition', 'transform 30ms, top 1s');
  f('transition', 'transform 30ms, border-radius 1s');
  f('transition', 'transform 30ms, box-sizing 1s');
}


// PARSE DECLARATION
function parseDeclaration() {
  log();log(col('----Parse Declaration----', 'c'));
  function f(props, decl) {
    decl.type = decl.type || 'declaration';
    log(col(jstr(props), 'm'));
    log(jstr(decl));
    log(col(jstr(prefixr.parseDeclaration(props, decl)), 'g'));
    log(col('----', 'b'));
  }
  f({}, {
    'property': 'top',
    'value': '10px'
  });
  f({}, {
    'property': 'transform',
    'value': 'rotateY(120deg)'
  });
  f({}, {
    'property': '-webkit-transform',
    'value': 'rotateY(120deg)'
  });
  f({
    'transform': {
      'noprefix': {
        'noprefix': 'rotateY(180deg)'
      },
      '-webkit': 'rotateY(180deg)',
      '-ms': 'rotateY(180deg)'
    }
  }, {
    'property': '-webkit-transform',
    'value': 'rotateY(120deg)'
  });
}


// PARSE RULE
function parseRule() {
  log(); log(col('----Parse Rule----', 'c'));
  function f(rule, filter) {
    // rule.type = rule.type || 'rule';
    // rule.selectors = rule.selectors || ['div'];
    log(col(jstr(rule), 'm') + ' filter: ' + col(filter, 'r'));
    log(col(jstr(prefixr.parseRule(rule, filter)), 'g'));
    log(col('----', 'b'));
  }

  f({
    declarations: [
      {
        property: 'top',
        value: '10px'
      },
      {
        property: 'transition',
        value: 'top 1s'
      }
    ]
  });
}


////////////////
// Test cases //
////////////////

// unprefix();
// getPrefix();
// prefixValue();
// initPrefixedProperties();
// parseDeclaration();
parseRule();
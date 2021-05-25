// Copyright 2017-2021, University of Colorado Boulder

/**
 * StringUtils tests
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import StringUtils from './StringUtils.js';

QUnit.module( 'StringUtils' );

QUnit.test( 'capitalize', assert => {
  assert.equal( StringUtils.capitalize( 'hello' ), 'Hello', 'word should be capitalized' );
} );

// See https://github.com/phetsims/phetcommon/issues/36
QUnit.test( 'fillIn', assert => {

  assert.equal( StringUtils.fillIn( 'no placeholders here', { name: 'Fred' } ),
    'no placeholders here', '0 placeholders' );
  assert.equal( StringUtils.fillIn( '{{name}} is smart', { name: 'Fred' } ),
    'Fred is smart', '1 placeholder' );
  assert.equal( StringUtils.fillIn( '{{name}} is {{age}} years old', {
    name: 'Fred',
    age: 23
  } ), 'Fred is 23 years old', '> 1 placeholders' );
  assert.equal( StringUtils.fillIn( '{{name}} is {{age}} years old', {
    name: 'Fred',
    age: 23,
    height: 60
  } ), 'Fred is 23 years old', 'extra value in hash is ignored' );
  assert.equal( StringUtils.fillIn( '{{name}} is {{age}} years old {really}', {
    name: 'Fred',
    age: 23
  } ), 'Fred is 23 years old {really}', 'OK to use curly braces in the string' );
  assert.equal( StringUtils.fillIn( '{{value}} {{units}}', { units: 'm' } ),
    '{{value}} m', 'OK to omit a placeholder value' );
} );
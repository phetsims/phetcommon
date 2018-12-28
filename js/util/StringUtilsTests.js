// Copyright 2017, University of Colorado Boulder

/**
 * StringUtils tests
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );

  QUnit.module( 'StringUtils' );

  QUnit.test( 'endsWith', function( assert ) {

    assert.equal( StringUtils.endsWith( 'hello', 'o' ), true, 'hello should end with o' );
    assert.equal( StringUtils.endsWith( 'hello', 'x' ), false, 'hello should not end with x' );
    assert.equal( StringUtils.endsWith( 'hello', 'hello' ), true, 'hello should end with itself' );
    assert.equal( StringUtils.endsWith( 'hello', 'he' ), false, 'hello should not end with he' );
    assert.equal( StringUtils.endsWith( '', 'he' ), false, 'empty string should not end with something' );
  } );

  // See https://github.com/phetsims/phetcommon/issues/36
  QUnit.test( 'fillIn', function( assert ) {

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

} );
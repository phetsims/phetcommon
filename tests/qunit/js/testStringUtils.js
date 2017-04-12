// Copyright 2016-2017, University of Colorado Boulder

(function() {
  'use strict';

  module( 'Phetcommon' );

  test( 'endsWith', function() {
    var StringUtils = phet.phetcommon.StringUtils;

    equal( StringUtils.endsWith( 'hello', 'o' ), true, 'hello should end with o' );
    equal( StringUtils.endsWith( 'hello', 'x' ), false, 'hello should not end with x' );
    equal( StringUtils.endsWith( 'hello', 'hello' ), true, 'hello should end with itself' );
    equal( StringUtils.endsWith( 'hello', 'he' ), false, 'hello should not end with he' );
    equal( StringUtils.endsWith( '', 'he' ), false, 'empty string should not end with something' );
  } );

  // See https://github.com/phetsims/phetcommon/issues/36
  test( 'fillIn', function( assert ) {
    var StringUtils = phet.phetcommon.StringUtils;

    equal( StringUtils.fillIn( 'no placeholders here', { name: 'Fred' } ), 'no placeholders here', '0 placeholders' );
    equal( StringUtils.fillIn( '{{name}} is smart', { name: 'Fred' } ), 'Fred is smart', '1 placeholder' );
    equal( StringUtils.fillIn( '{{name}} is {{age}} years old', { name: 'Fred', age: 23 } ), 'Fred is 23 years old', '> 1 placeholders' );
    equal( StringUtils.fillIn( '{{name}} is {{age}} years old', {
        name: 'Fred',
        age: 23,
        height: 60
      } ), 'Fred is 23 years old', 'extra value in hash is ignored' );
    equal( StringUtils.fillIn( '{{name}} is {{age}} years old {really}', { name: 'Fred', age: 23 } ), 'Fred is 23 years old {really}', 'OK to use of curly braces in the string' );

    assert.throws( function() { StringUtils.fillIn( '{{name}} is {{age}} years old', { name: 'Fred' } ); },
      'missing value in hash fails' );
  } );

})();

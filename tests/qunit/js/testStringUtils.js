// Copyright 2016, University of Colorado Boulder

(function() {
  module( 'phetcommon' );

  test( 'endsWith', function() {
    var StringUtils = phet.phetcommon.StringUtils;

    equal( StringUtils.endsWith( 'hello', 'o' ), true, 'hello should end with o' );
    equal( StringUtils.endsWith( 'hello', 'x' ), false, 'hello should not end with x' );
    equal( StringUtils.endsWith( 'hello', 'hello' ), true, 'hello should end with itself' );
    equal( StringUtils.endsWith( 'hello', 'he' ), false, 'hello should not end with he' );
    equal( StringUtils.endsWith( '', 'he' ), false, 'empty string should not end with something' );
  } );

})();

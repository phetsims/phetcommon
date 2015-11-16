// Copyright 2013-2015, University of Colorado Boulder

/**
 * Collection of utility functions related to Strings.
 */
define( function( require ) {
  'use strict';

  // modules
  var phetcommon = require( 'PHETCOMMON/phetcommon' );

  var StringUtils = {

    /**
     * http://mobzish.blogspot.com/2008/10/simple-messageformat-for-javascript.html
     * Similar to Java's MessageFormat, supports simple substitution, simple substitution only.
     * The full MessageFormat specification allows conditional formatting, for example to support pluralisation.
     * <p>
     * Eg, StringUtils.format( '{0} + {1}', 2, 3 ) -> '2 + 3'
     *
     * @param {string} pattern pattern string, with N placeholders, where N is an integer
     * @return {string}
     * @public
     */
    format: function( pattern ) {
      var args = arguments;
      return pattern.replace( /{(\d)}/g, function( r, n ) { return args[ +n + 1 ];} );
    }
  };

  phetcommon.register( 'StringUtils', StringUtils );

  return StringUtils;
} );

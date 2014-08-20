// Copyright 2002-2013, University of Colorado Boulder

/**
 * Collection of utility functions related to Strings.
 */
define( function() {
  'use strict';

  function StringUtils() {
  }

  /**
   * http://mobzish.blogspot.com/2008/10/simple-messageformat-for-javascript.html
   * Similar to Java's MessageFormat, supports simple substitution, simple substitution only.
   * The full MessageFormat specification allows conditional formatting, for example to support pluralisation.
   * <p>
   * Eg, StringUtils.format( '{0} + {1}', 2, 3 ) -> '2 + 3'
   *
   * @param {String} pattern pattern string, with N placeholders, where N is an integer
   * @return {String}
   */
  StringUtils.format = function( pattern ) {
    var args = arguments;
    return pattern.replace( /{(\d)}/g, function( r, n ) { return args[+n + 1];} );
  };

  return StringUtils;
} );

// Copyright 2002-2013, University of Colorado Boulder

/**
 * Collection of utility functions related to Strings.
 */
define( function() {
  'use strict';

  // Unicode embedding marks that we use.
  var LTR = '\u202a';
  var RTL = '\u202b';
  var POP = '\u202c';

  function StringUtils() {
  }

  /**
   * http://mobzish.blogspot.com/2008/10/simple-messageformat-for-javascript.html
   * Similar to Java's MessageFormat, supports simple substitution, simple substitution only.
   * The full MessageFormat specification allows conditional formatting, for example to support pluralisation.
   * <p>
   * Eg, StringUtils.format( '{0} + {1}', 2, 3 ) -> '2 + 3'
   *
   * @param {string} pattern pattern string, with N placeholders, where N is an integer
   * @return {string}
   */
  StringUtils.format = function( pattern ) {
    var args = arguments;
    return pattern.replace( /{(\d)}/g, function( r, n ) { return args[ +n + 1 ];} );
  };

  /**
   * Wraps a string with embedding marks for LTR display.
   * @public
   *
   * @param {string} string
   * @returns {string}
   */
  StringUtils.wrapLTR = function( string ) {
    return LTR + string + POP;
  };

  /**
   * Wraps a string with embedding marks for RTL display.
   * @public
   *
   * @param {string} string
   * @returns {string}
   */
  StringUtils.wrapRTL = function( string ) {
    return RTL + string + POP;
  };

  /**
   * Wraps a string with embedding marks for LTR/RTL display, depending on the direction
   * @public
   *
   * @param {string} string
   * @param {string} direction - either 'ltr' or 'rtl'
   * @returns {string}
   */
  StringUtils.wrapDirection = function( string, direction ) {
    assert && assert( direction === 'ltr' || direction === 'rtl' );

    if ( direction === 'ltr' ) {
      return StringUtils.wrapLTR( string );
    }
    else {
      return StringUtils.wrapRTL( string );
    }
  };

  /**
   * Given a locale, e.g. 'es', provides the localized name, e.g. 'Español'
   *
   * @param {string} locale
   * @returns {string}
   */
  StringUtils.localeToLocalizedName = function( locale ) {
    assert && assert( phet.chipper.localeData[ locale ], 'locale needs to be a valid locale code defined in phet.chipper.localeData' );

    return StringUtils.wrapDirection(
      phet.chipper.localeData[ locale ].localizedName,
      phet.chipper.localeData[ locale ].direction
    );
  };

  return StringUtils;
} );

// Copyright 2013-2015, University of Colorado Boulder

/**
 * Collection of utility functions related to Strings.
 */
define( function( require ) {
  'use strict';

  // modules
  var phetcommon = require( 'PHETCOMMON/phetcommon' );

  // Unicode embedding marks that we use.
  var LTR = '\u202a';
  var RTL = '\u202b';
  var POP = '\u202c';

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
    },

    /**
     * Given a string with embedding marks, this function returns an equivalent string.slice() but prefixes and suffixes
     * the string with the embedding marks needed to ensure things have the correct LTR/RTL order.
     * @public
     *
     * For example, with a test string:
     *
     * embeddedDebugString( '\u202a\u202bhi\u202c\u202c' )
     * === "[LTR][RTL]hi[POP][POP]"
     *
     * We could grab the first word, and it adds the ending POP:
     * embeddedDebugString( embeddedSlice( '\u202afirst\u202bsecond\u202cthird\u202c', 0, 6 ) )
     * === "[LTR]first[POP]"
     *
     * Or the second word:
     * embeddedDebugString( embeddedSlice( '\u202afirst\u202bsecond\u202cthird\u202c', 7, 13 ) )
     * === "[LTR][RTL]second[POP][POP]"
     *
     * Or a custom range:
     * embeddedDebugString( embeddedSlice( '\u202afirst\u202bsecond\u202cthird\u202c', 3, -3 ) )
     * === "[LTR]rst[RTL]second[POP]thi[POP]"
     *
     * @param {string} string - The main source string to slice from
     * @param {number} startIndex - The starting index where the slice starts (includes char at this index)
     * @param {number} [endIndex] - The ending index where the slice stops (does NOT include char at this index)
     * @returns {string} - The sliced string, with embedding marks added at hte start and end.
     */
    embeddedSlice: function( string, startIndex, endIndex ) {
      // {Array.<string>} - array of LTR/RTL embedding marks that are currently on the stack for the current location.
      var stack = [];
      var chr;

      // Walk up to the start of the string
      for ( var i = 0; i < startIndex; i++ ) {
        chr = string.charAt( i );
        if ( chr === LTR || chr === RTL ) {
          stack.push( chr );
        }
        else if ( chr === POP ) {
          stack.pop();
        }
      }

      // Our prefix will be the embedding marks that have been skipped and not popped.
      var prefix = stack.join( '' );

      // A normal string slice
      var slice = string.slice( startIndex, endIndex );

      // Walk through the sliced string, to determine what we need for the suffix
      for ( var j = 0; j < slice.length; j++ ) {
        chr = slice.charAt( j );
        if ( chr === LTR || chr === RTL ) {
          stack.push( chr );
        }
        else if ( chr === POP ) {
          stack.pop();
        }
      }

      // Our suffix includes one POP for each embedding mark currently on the stack
      var suffix = stack.join( '' ).replace( /./g, POP );

      return prefix + slice + suffix;
    },

    /**
     * Replaces embedding mark characters with visible strings. Useful for debugging for strings with embedding marks.
     * @public
     *
     * @param {string} string
     * @returns {string} - With embedding marks replaced.
     */
    embeddedDebugString: function( string ) {
      return string.replace( /\u202a/g, '[LTR]' ).replace( /\u202b/g, '[RTL]' ).replace( /\u202c/g, '[POP]' );
    }
  };

  phetcommon.register( 'StringUtils', StringUtils );

  return StringUtils;
} );

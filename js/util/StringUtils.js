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
     * NOTE: Please use StringUtils.fillIn instead of this function.
     *
     * http://mobzish.blogspot.com/2008/10/simple-messageformat-for-javascript.html
     * Similar to Java's MessageFormat, supports simple substitution, simple substitution only.
     * The full MessageFormat specification allows conditional formatting, for example to support pluralisation.
     *
     * Example:
     * > StringUtils.format( '{0} + {1}', 2, 3 )
     * "2 + 3"
     *
     * @param {string} pattern pattern string, with N placeholders, where N is an integer
     * @returns {string}
     * @public
     */
    format: function( pattern ) {
      var args = arguments;
      return pattern.replace( /{(\d)}/g, function( r, n ) { return args[ +n + 1 ];} );
    },

    /**
     * Fills in a set of placeholders in a template.
     * Placeholders are specified with pairs of curly braces, e.g. '{{name}} is {{age}} years old'
     * See https://github.com/phetsims/phetcommon/issues/36
     *
     * Example:
     * > StringUtils.fillIn( '{{name}} is {{age}} years old', { name: 'Fred', age: 23 } )
     * "Fred is 23 years old"
     *
     * @param {string} template - the template, containing zero or more placeholders
     * @param {Object} values - a hash whose keys correspond to the placeholder names, e.g. { name: 'Fred', age: 23 }
     *                          Unused keys are silently ignored. All placeholders do not need to be filled.
     * @returns {string}
     * @public
     */
    fillIn: function( template, values ) {

      // To catch attempts to use StringUtils.fillIn like StringUtils.format
      assert && assert( values && typeof values === 'object', 'invalid values: ' + values );

      var newString = template;

      // {string[]} parse out the set of placeholders
      var placeholders = template.match( /\{\{[^\{\}]+\}\}/g ) || [];

      // replace each placeholder with its corresponding value
      for ( var i = 0; i < placeholders.length; i++ ) {
        var placeholder = placeholders[ i ];

        // key is the portion of the placeholder between the curly braces
        var key = placeholder.replace( '{{', '' ).replace( '}}', '' );
        if ( values[ key ] !== undefined ) {
          newString = newString.replace( placeholder, values[ key ] );
        }
      }

      return newString;
    },

    /**
     * @public
     * @returns {boolean} - Whether this length-1 string is equal to one of the three directional embedding marks used.
     */
    isEmbeddingMark: function( chr ) {
      return chr === LTR || chr === RTL || chr === POP;
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
     * embeddedDebugString( embeddedSlice( '\u202afirst\u202bsecond\u202cthird\u202c', 6, 14 ) )
     * === "[RTL]second[POP]"
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

      if ( endIndex === undefined ) {
        endIndex = string.length;
      }
      if ( endIndex < 0 ) {
        endIndex += string.length;
      }

      // To avoid returning an extra adjacent [LTR][POP] or [RTL][POP], we can move the start forward and the
      // end backwards as long as they are over embedding marks to avoid this.
      while ( startIndex < string.length && StringUtils.isEmbeddingMark( string.charAt( startIndex ) ) ) {
        startIndex++;
      }
      while ( endIndex >= 1 && StringUtils.isEmbeddingMark( string.charAt( endIndex - 1 ) ) ) {
        endIndex--;
      }

      // If our string will be empty, just bail out.
      if ( startIndex >= endIndex || startIndex >= string.length ) {
        return '';
      }

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

      // Will store the minimum stack size during our slice. This allows us to turn [LTR][RTL]boo[POP][POP] into
      // [RTL]boo[POP] by skipping the "outer" layers.
      var minimumStackSize = stack.length;

      // Save our initial stack for prefix computation
      var startStack = stack.slice();

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
          minimumStackSize = Math.min( stack.length, minimumStackSize );
        }
      }

      // Our ending stack for suffix computation
      var endStack = stack;

      // Always leave one stack level on top
      var numSkippedStackLevels = Math.max( 0, minimumStackSize - 1 );
      startStack = startStack.slice( numSkippedStackLevels );
      endStack = endStack.slice( numSkippedStackLevels );

      // Our prefix will be the embedding marks that have been skipped and not popped.
      var prefix = startStack.join( '' );

      // Our suffix includes one POP for each embedding mark currently on the stack
      var suffix = endStack.join( '' ).replace( /./g, POP );

      return prefix + slice + suffix;
    },

    /**
     * String's split() API, but uses embeddedSlice() on the extracted strings.
     * @public
     *
     * For example, given a string:
     *
     * StringUtils.embeddedDebugString( '\u202aHello  there, \u202bHow are you\u202c doing?\u202c' );
     * === "[LTR]Hello  there, [RTL]How are you[POP] doing?[POP]"
     *
     * Using embeddedSplit with a regular expression matching a sequence of spaces:
     * StringUtils.embeddedSplit( '\u202aHello  there, \u202bHow are you\u202c doing?\u202c', / +/ )
     *            .map( StringUtils.embeddedDebugString );
     * === [ "[LTR]Hello[POP]",
     *       "[LTR]there,[POP]",
     *       "[RTL]How[POP]",
     *       "[RTL]are[POP]",
     *       "[RTL]you[POP]",
     *       "[LTR]doing?[POP]" ]
     */
    embeddedSplit: function( string, separator, limit ) {
      // Matching split API
      if ( separator === undefined ) {
        return [ string ];
      }

      // {Array.<string>} - What we will push to and return.
      var result = [];

      // { index: {number}, length: {number} } - Last result of findSeparatorMatch()
      var separatorMatch;

      // Remaining part of the string to split up. Will have substrings removed from the start.
      var stringToSplit = string;

      // Finds the index and length of the first substring of stringToSplit that matches the separator (string or regex)
      // and returns an object with the type  { index: {number}, length: {number} }.
      // If index === -1, there was no match for the separator.
      function findSeparatorMatch() {
        var index;
        var length;
        if ( separator instanceof window.RegExp ) {
          var match = stringToSplit.match( separator );
          if ( match ) {
            index = match.index;
            length = match[ 0 ].length;
          }
          else {
            index = -1;
          }
        }
        else {
          assert && assert( typeof separator === 'string' );

          index = stringToSplit.indexOf( separator );
          length = separator.length;
        }
        return {
          index: index,
          length: length
        };
      }

      // Loop until we run out of matches for the separator. For each separator match, stringToSplit for the next
      // iteration will have everything up to the end of the separator match chopped off. The indexOffset variable
      // stores how many characters we have chopped off in this fashion, so that we can index into the original string.
      var indexOffset = 0;
      while ( ( separatorMatch = findSeparatorMatch() ).index >= 0 ) {
        // Extract embedded slice from the original, up until the separator match
        result.push( StringUtils.embeddedSlice( string, indexOffset, indexOffset + separatorMatch.index ) );

        // Handle chopping off the section of stringToSplit, so we can do simple matching in findSeparatorMatch()
        var offset = separatorMatch.index + separatorMatch.length;
        stringToSplit = stringToSplit.slice( offset );
        indexOffset += offset;
      }

      // Embedded slice for after the last match. May be an empty string.
      result.push( StringUtils.embeddedSlice( string, indexOffset ) );

      // Matching split API
      if ( limit !== undefined ) {
        assert && assert( typeof limit === 'number' );

        result = _.first( result, limit );
      }

      return result;
    },

    /**
     * Strips embedding marks out of a string.
     * @public
     *
     * @param {string} string
     * @returns {string}
     */
    stripEmbeddingMarks: function( string ) {
      return string.replace( /\u202a|\u202b|\u202c/g, '' );
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
    },

    /**
     * Determine whether one string ends with another.  Implementation is from the MDN polyfill at
     *   https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/endsWith
     * @param {string} string - the string to test
     * @param {string} searchString - is this string at the end?
     * @param {number} [position] - Search within this string as if this string were only this long; defaults to
     *                        this string's actual length, clamped within the range established by this string's length.
     * @returns {boolean}
     */
    endsWith: function( string, searchString, position ) {
      var subjectString = string.toString();
      if ( typeof position !== 'number' || !isFinite( position ) || Math.floor( position ) !== position || position > subjectString.length ) {
        position = subjectString.length;
      }
      position -= searchString.length;
      var lastIndex = subjectString.indexOf( searchString, position );
      return lastIndex !== -1 && lastIndex === position;
    },

    /**
     * Assert that a template var is in a string. Useful for translated strings with a template var pattern like
     * "Hello {{meanName}}" --> "Hello goofball". See StringUtils.fillIn() for base usages of template var pattern.
     *
     * @param {string} string
     * @param {string} key
     */
    assertContainsKey( string, key ) {
      assert && assert( string.indexOf( `{{${key}}}` ) >= 0, 'key not' );
    }
  };

  phetcommon.register( 'StringUtils', StringUtils );

  return StringUtils;
} );
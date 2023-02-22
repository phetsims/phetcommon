// Copyright 2013-2023, University of Colorado Boulder

/**
 * Collection of utility functions related to Strings.
 */

import localeInfoModule from '../../../chipper/js/data/localeInfoModule.js';
import phetcommon from '../phetcommon.js';

// Unicode embedding marks that we use.
const LTR = '\u202a';
const RTL = '\u202b';
const POP = '\u202c';

const StringUtils = {

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
   * @deprecated - please use StringUtils.fillIn
   */
  format: function( pattern ) {
    // eslint-disable-next-line prefer-rest-params
    const args = arguments;
    return pattern.replace( /{(\d)}/g, ( r, n ) => args[ +n + 1 ] );
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
   * @param {string|TReadOnlyProperty<string>} template - the template, containing zero or more placeholders
   * @param {Object} values - a hash whose keys correspond to the placeholder names, e.g. { name: 'Fred', age: 23 }
   *                          Unused keys are silently ignored. All placeholders do not need to be filled.
   * @returns {string}
   * @public
   */
  fillIn: function( template, values ) {
    template = ( template && template.get ) ? template.get() : template;
    assert && assert( typeof template === 'string', `invalid template: ${template}` );

    // To catch attempts to use StringUtils.fillIn like StringUtils.format
    assert && assert( values && typeof values === 'object', `invalid values: ${values}` );

    let newString = template;

    // {string[]} parse out the set of placeholders
    const placeholders = template.match( /\{\{[^{}]+\}\}/g ) || [];

    // replace each placeholder with its corresponding value
    for ( let i = 0; i < placeholders.length; i++ ) {
      const placeholder = placeholders[ i ];

      // key is the portion of the placeholder between the curly braces
      const key = placeholder.replace( '{{', '' ).replace( '}}', '' );
      if ( values[ key ] !== undefined ) {

        // Support Properties as values
        const valueString = ( values[ key ] && values[ key ].get ) ? values[ key ].get() : values[ key ];
        newString = newString.replace( placeholder, valueString );
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
    const stack = [];
    let chr;

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
    for ( let i = 0; i < startIndex; i++ ) {
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
    let minimumStackSize = stack.length;

    // Save our initial stack for prefix computation
    let startStack = stack.slice();

    // A normal string slice
    const slice = string.slice( startIndex, endIndex );

    // Walk through the sliced string, to determine what we need for the suffix
    for ( let j = 0; j < slice.length; j++ ) {
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
    let endStack = stack;

    // Always leave one stack level on top
    const numSkippedStackLevels = Math.max( 0, minimumStackSize - 1 );
    startStack = startStack.slice( numSkippedStackLevels );
    endStack = endStack.slice( numSkippedStackLevels );

    // Our prefix will be the embedding marks that have been skipped and not popped.
    const prefix = startStack.join( '' );

    // Our suffix includes one POP for each embedding mark currently on the stack
    const suffix = endStack.join( '' ).replace( /./g, POP );

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
    let result = [];

    // { index: {number}, length: {number} } - Last result of findSeparatorMatch()
    let separatorMatch;

    // Remaining part of the string to split up. Will have substrings removed from the start.
    let stringToSplit = string;

    // Finds the index and length of the first substring of stringToSplit that matches the separator (string or regex)
    // and returns an object with the type  { index: {number}, length: {number} }.
    // If index === -1, there was no match for the separator.
    function findSeparatorMatch() {
      let index;
      let length;
      if ( separator instanceof window.RegExp ) {
        const match = stringToSplit.match( separator );
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
    let indexOffset = 0;
    while ( ( separatorMatch = findSeparatorMatch() ).index >= 0 ) {
      // Extract embedded slice from the original, up until the separator match
      result.push( StringUtils.embeddedSlice( string, indexOffset, indexOffset + separatorMatch.index ) );

      // Handle chopping off the section of stringToSplit, so we can do simple matching in findSeparatorMatch()
      const offset = separatorMatch.index + separatorMatch.length;
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
   * Wraps a string with embedding marks for LTR display.
   * @public
   *
   * @param {string} string
   * @returns {string}
   */
  wrapLTR: function( string ) {
    return LTR + string + POP;
  },

  /**
   * Wraps a string with embedding marks for RTL display.
   * @public
   *
   * @param {string} string
   * @returns {string}
   */
  wrapRTL: function( string ) {
    return RTL + string + POP;
  },

  /**
   * Wraps a string with embedding marks for LTR/RTL display, depending on the direction
   * @public
   *
   * @param {string} string
   * @param {string} direction - either 'ltr' or 'rtl'
   * @returns {string}
   */
  wrapDirection: function( string, direction ) {
    assert && assert( direction === 'ltr' || direction === 'rtl' );

    if ( direction === 'ltr' ) {
      return StringUtils.wrapLTR( string );
    }
    else {
      return StringUtils.wrapRTL( string );
    }
  },

  /**
   * Given a locale, e.g. 'es', provides the localized name, e.g. 'Español'
   *
   * @param {string} locale
   * @returns {string}
   */
  localeToLocalizedName: function( locale ) {
    assert && assert( localeInfoModule[ locale ], 'locale needs to be a valid locale code defined in localeInfoModule' );

    return StringUtils.wrapDirection(
      localeInfoModule[ locale ].localizedName,
      localeInfoModule[ locale ].direction
    );
  },

  /**
   * Capitalize the first letter of the given string.
   * @param {string} string
   * @returns {string}
   * @public
   */
  capitalize( string ) {
    assert && assert( string.length > 0, 'expected a non-zero string' );
    return string[ 0 ].toUpperCase() + string.slice( 1 );
  }
};

phetcommon.register( 'StringUtils', StringUtils );

export default StringUtils;
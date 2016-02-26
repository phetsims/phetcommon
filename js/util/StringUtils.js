// Copyright 2013-2015, University of Colorado Boulder

/**
 * Collection of utility functions related to Strings.
 */
define( function( require ) {
  'use strict';

  // modules
  var phetcommon = require( 'PHETCOMMON/phetcommon' );
  var platform = require( 'PHET_CORE/platform' );

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
      var result = pattern.replace( /{(\d)}/g, function( r, n ) { return args[ +n + 1 ];} );

      // See https://github.com/phetsims/scenery/issues/520. Conditional here, so we don't gutter performance on other
      // platforms where format is used a lot.  This workaround was added in Feb 2016 and was seen on Edge 20 and 25.
      // We could potentially remove this at some point in the future if it is fixed and if the versions with the bug
      // are essentially no longer in use.
      if ( platform.edge ) {
        result = StringUtils.simplifyEmbeddingMarks( result );
      }
      return result;
    },

    /**
     * @public
     * @returns {boolean} - Whether this length-1 string is equal to one of the three directional embedding marks used.
     */
    isEmbeddingMark: function( chr ) {
      return chr === LTR || chr === RTL || chr === POP;
    },

    /**
     * Returns a (potentially) modified string where embedding marks have been simplified.
     * @public
     *
     * This simplification wouldn't usually be necessary, but we need to prevent cases like
     * https://github.com/phetsims/scenery/issues/520 where Edge decides to turn [POP][LTR] (after another [LTR]) into
     * a 'box' character, when nothing should be rendered.
     *
     * This will remove redundant nesting:
     *   e.g. [LTR][LTR]boo[POP][POP] => [LTR]boo[POP])
     * and will also combine adjacent directions:
     *   e.g. [LTR]Mail[POP][LTR]Man[POP] => [LTR]MailMan[Pop]
     *
     * Note that it will NOT combine in this way if there was a space between the two LTRs:
     *   e.g. [LTR]Mail[POP] [LTR]Man[Pop])
     * as in the general case, we'll want to preserve the break there between embeddings.
     *
     * TODO: A stack-based implementation that doesn't create a bunch of objects/closures would be nice for performance.
     *
     * @param {string} string
     * @returns {string}
     */
    simplifyEmbeddingMarks: function( string ) {
      // First, we'll convert the string into a tree form, where each node is either a string object OR an object of the
      // node type { dir: {LTR||RTL}, children: {Array.<node>}, parent: {null|node} }. Thus each LTR...POP and RTL...POP
      // become a node with their interiors becoming children.

      // Root node (no direction, so we preserve root LTR/RTLs)
      var root = {
        dir: null,
        children: [],
        parent: null
      };
      var current = root;
      for ( var i = 0; i < string.length; i++ ) {
        var chr = string.charAt( i );

        // Push a direction
        if ( chr === LTR || chr === RTL ) {
          var node = {
            dir: chr,
            children: [],
            parent: current
          };
          current.children.push( node );
          current = node;
        }
        // Pop a direction
        else if ( chr === POP ) {
          assert && assert( current.parent, 'Bad nesting of embedding marks: ' + StringUtils.embeddedDebugString( string ) );
          current = current.parent;
        }
        // Append characters to the current direction
        else {
          current.children.push( chr );
        }
      }
      assert && assert( current === root, 'Bad nesting of embedding marks: ' + StringUtils.embeddedDebugString( string ) );

      // Remove redundant nesting (e.g. [LTR][LTR]...[POP][POP])
      function collapseNesting( node ) {
        for ( var i = node.children.length - 1; i >= 0; i-- ) {
          var child = node.children[ i ];
          if ( node.dir === child.dir ) {
            Array.prototype.splice.apply( node.children, [ i, 1 ].concat( child.children ) );
          }
        }
      }

      // Remove overridden nesting (e.g. [LTR][RTL]...[POP][POP]), since the outer one is not needed
      function collapseUnnecessary( node ) {
        if ( node.children.length === 1 && node.children[ 0 ].dir ) {
          node.dir = node.children[ 0 ].dir;
          node.children = node.children[ 0 ].children;
        }
      }

      // Collapse adjacent matching dirs, e.g. [LTR]...[POP][LTR]...[POP]
      function collapseAdjacent( node ) {
        for ( var i = node.children.length - 1; i >= 1; i-- ) {
          var previousChild = node.children[ i - 1 ];
          var child = node.children[ i ];
          if ( child.dir && previousChild.dir === child.dir ) {
            previousChild.children = previousChild.children.concat( child.children );
            node.children.splice( i, 1 );

            // Now try to collapse adjacent items in the child, since we combined children arrays
            collapseAdjacent( previousChild );
          }
        }
      }

      // Simplifies the tree using the above functions
      function simplify( node ) {
        if ( typeof node === 'string' ) {
          return;
        }

        for ( var i = 0; i < node.children.length; i++ ) {
          simplify( node.children[ i ] );
        }

        collapseUnnecessary( node );
        collapseNesting( node );
        collapseAdjacent( node );

        return node;
      }

      // Turns a tree into a string
      function stringify( node ) {
        if ( typeof node === 'string' ) {
          return node;
        }
        var childString = node.children.map( stringify ).join( '' );
        if ( node.dir ) {
          return node.dir + childString + '\u202c';
        }
        else {
          return childString;
        }
      }

      return stringify( simplify( root ) );
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
     * Converts a string to camel case, eg: 'simula-rasa' -> 'simulaRasa'
     * See http://stackoverflow.com/questions/10425287/convert-string-to-camelcase-with-regular-expression
     *
     * @param {string} str - the input string
     * @returns {string} a new string
     */
    toCamelCase: function( str ) {
      return str.toLowerCase().replace( /-(.)/g, function( match, group1 ) {
        return group1.toUpperCase();
      } );
    }
  };

  phetcommon.register( 'StringUtils', StringUtils );

  return StringUtils;
} );

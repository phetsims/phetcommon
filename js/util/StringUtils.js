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
      // platforms where format is used a lot.
      if ( platform.edge ) {
        result = StringUtils.simplifyEmbeddingMarks( result );
      }
      return result;
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

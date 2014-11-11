// Copyright 2002-2013, University of Colorado Boulder

/**
 * Enables or disables assertions in common libraries using query parameters.
 * There are two types of assertions: basic and slow. Enabling slow assertions will adversely impact performance.
 * 'ea' enables basic assertions, 'eall' enables basic and slow assertions.
 * Must be run before RequireJS, and assumes that query-parameters.js has been run.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
(function() {
  'use strict';
  
  // TODO: separate this logic out into a more common area?
  var isProduction = $( 'meta[name=phet-sim-level]' ).attr( 'content' ) === 'production';

  var enableAllAssertions = !isProduction && !!window.phetcommon.getQueryParameter( 'eall' ); // enables all assertions (basic and slow)
  var enableBasicAssertions = enableAllAssertions || ( !isProduction && !!window.phetcommon.getQueryParameter( 'ea' ) );  // enables basic assertions

  if ( window.has ) {

    var hasBasic = window.has( 'assert.basic' );
    var hasSlow = window.has( 'assert.slow' );

    if ( !isProduction && ( hasBasic === undefined && enableBasicAssertions ) || hasBasic ) {
      console.log( 'enabling basic assertions' );
    }
    
    if ( !isProduction && ( hasSlow === undefined && enableAllAssertions ) || hasSlow ) {
      console.log( 'enabling slow assertions' );
    }

    // window.assert disabled by default, turned on with 'ea'
    if ( hasBasic === undefined ) {
      window.has.add( 'assert.basic', function( global, document, anElement ) { return enableBasicAssertions; } );
    }

    // window.assertSlow disabled by default, turned on with 'eall'
    if ( hasSlow === undefined ) {
      window.has.add( 'assert.slow', function( global, document, anElement ) { return enableAllAssertions; } );
    }
  }
  else {
    console.log( 'has.js not found, using default assertion levels' );
  }
}());

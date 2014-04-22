// Copyright 2002-2013, University of Colorado Boulder

/**
 * Enables or disables assertions in common libraries based on the 'dev' query parameter flag.
 * Must be run before RequireJS, and assumes that query-parameters.js has been run.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
(function() {
  'use strict';
  
  // TODO: separate this logic out into a more common area?
  var isProduction = $( 'meta[name=phet-sim-level]' ).attr( 'content' ) === 'production';
  
  var enableAllAssertions = !isProduction && !!window.phetcommon.getQueryParameter( 'eall' ); // for disabling all assertions
  var enableAssertions = enableAllAssertions || ( !isProduction && !!window.phetcommon.getQueryParameter( 'ea' ) );  // for enabling all assertions
  
  var hasBasic = window.has && window.has( 'assert.basic' );
  var hasSlow = window.has && window.has( 'assert.slow' );

  if ( window.has ) {
    
    if ( !isProduction && ( hasBasic === undefined && enableAssertions ) || hasBasic ) {
      console.log( 'enabling basic assertions' );
    }
    
    if ( !isProduction && ( hasSlow === undefined && enableAllAssertions ) || hasSlow ) {
      console.log( 'enabling slow assertions' );
    }
  
    // window.assert enabled by default. turned off with 'da'
    if ( hasBasic === undefined ) {
      window.has.add( 'assert.basic', function( global, document, anElement ) { return enableAssertions; } );
    }
    
    // window.assertSlow disabled by default. turned on with 'ea'
    if ( hasSlow === undefined ) {
      window.has.add( 'assert.slow', function( global, document, anElement ) { return enableAllAssertions; } );
    }
  }
  else {
    console.log( 'has.js not found, using default assertion levels' );
  }
}());

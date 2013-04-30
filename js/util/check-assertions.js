// Copyright 2002-2013, University of Colorado

/**
 * Enables or disables assertions in common libraries based on the 'dev' query parameter flag.
 *
 * Assumes query-parameters.js has been loaded, and uses the window.phetcommon.dev flag
 *
 * @author Jonathan Olson <olsonsjc@gmail.com>
 */
(function() {
  'use strict';
  
  var assertionsEnabled = window.phetcommon.dev;
  
  // always return whether assertions are enabled
  function callback( global, document, anElement ) {
    return assertionsEnabled;
  }
  
  if ( assertionsEnabled ) {
    console.log( 'assertions enabled' );
  }
  
  if ( window.has ) {
    // add an entry for each type of assertion
    _.each( [
      'assert.dot',
      'assert.kite',
      'assert.kite.extra',
      'assert.scenery',
      'assert.scenery.extra'
    ], function( name ) { window.has.add( name, callback ); } );
  }
}());

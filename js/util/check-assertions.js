// Copyright 2002-2013, University of Colorado

/**
 * Enables or disables assertions in common libraries based on the 'dev' query parameter flag.
 * Must be run before RequireJS, and assumes that query-parameters.js has been run.
 *
 * @author Jonathan Olson <olsonsjc@gmail.com>
 */
(function() {
  'use strict';

  var enableAssertions = !!window.phetcommon.getQueryParameter('ea');
  
  // always return whether assertions are enabled
  function callback( global, document, anElement ) {
    return enableAssertions;
  }
  
  if ( enableAssertions ) {
    console.log( 'assertions enabled' );
  }
  
  if ( window.has ) {
    // add an entry for each type of assertion
    _.each( [
      'assert.dot', // TODO: consider names like dot.assert and scenery.assert instead?
      'assert.kite',
      'assert.kite.extra',
      'assert.scenery',
      'assert.scenery.extra'
    ], function( name ) { window.has.add( name, callback ); } );
  } else {
    console.log( 'has.js not found, using default assertion levels' );
  }
}());

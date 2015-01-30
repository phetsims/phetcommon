// Copyright 2002-2013, University of Colorado Boulder

/**
 * Enables or disables assertions in common libraries using query parameters.
 * There are two types of assertions: basic and slow. Enabling slow assertions will adversely impact performance.
 * 'ea' enables basic assertions, 'eall' enables basic and slow assertions.
 * Must be run before RequireJS, and assumes that assert.js and query-parameters.js has been run.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
(function() {
  'use strict';

  // TODO: separate this logic out into a more common area?
  var isProduction = $( 'meta[name=phet-sim-level]' ).attr( 'content' ) === 'production';

  var enableAllAssertions = !isProduction && !!phet.phetcommon.getQueryParameter( 'eall' ); // enables all assertions (basic and slow)
  var enableBasicAssertions = enableAllAssertions || ( !isProduction && !!phet.phetcommon.getQueryParameter( 'ea' ) );  // enables basic assertions

  if ( enableBasicAssertions ) {
    window.assertions.enableAssert();
  }
  if ( enableAllAssertions ) {
    window.assertions.enableAssertSlow();
  }
}());

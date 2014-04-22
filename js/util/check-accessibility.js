// Copyright 2002-2013, University of Colorado Boulder

/**
 * Enables or disables assertions in common libraries based on the 'dev' query parameter flag.
 * Must be run before RequireJS, and assumes that query-parameters.js has been run.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
(function() {
  'use strict';

  var enableAccessibility = !!window.phetcommon.getQueryParameter( 'accessibility' );

  // always return whether assertions are enabled
  function callback( global, document, anElement ) {
    return enableAccessibility;
  }

  if ( enableAccessibility ) {
    console.log( 'accessibility enabled' );
  }

  if ( window.has ) {
    window.has.add( 'scenery.accessibility', callback );
  }
  else {
    console.log( 'has.js not found, using default accessibility levels' );
  }
}());

// Copyright 2002-2013, University of Colorado Boulder

/**
 * Reads query parameters from browser window's URL.
 * This file must be loaded before requirejs is started up, and this file cannot be loaded as an AMD module.
 * The easiest way to do this is via a <script> tag in your HTML file.
 *
 * @author Sam Reid, PhET
 * @author Chris Malley (PixelZoom, Inc.)
 */
(function() {
  'use strict';

  if ( !window.phetcommon ) {
    window.phetcommon = {};
  }

  /**
   * Retrieves the first occurrence of a query parameter based on its key.
   * Returns undefined if the query parameter is not found.
   * @param {String} key
   * @return {String}
   */
  window.phetcommon.getQueryParameter = function( key ) {
    var value;
    if ( typeof window !== 'undefined' && window.location.search ) {
      var params = window.location.search.slice( 1 ).split( '&' );
      for ( var i = 0; i < params.length; i++ ) {
        var nameValuePair = params[i].split( '=' );
        if ( nameValuePair[0] === key ) {
          value = decodeURI( nameValuePair[1] ).toLowerCase();
          break;
        }
      }
    }
    return value;
  };

}());
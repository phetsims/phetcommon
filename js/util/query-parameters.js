// Copyright 2002-2013, University of Colorado Boulder

/**
 * Reads query parameters from browser window's URL.
 * This file must be loaded before requirejs is started up, and this file cannot be loaded as an AMD module.
 * The easiest way to do this is via a <script> tag in your HTML file.
 * <p>
 * Available query parameters:
 *
 * dev - enable developer-only features
 * fuzzMouse - randomly sends mouse events to sim
 * fuzzTouches - randomly sends touch events to sim (not working as of 10/8/13)
 * locale - test with a specific locale
 * playbackInputEventLog - plays event logging back from the server, provide an optional name for the session
 * recordInputEventLog - enables input event logging, provide an optional name for the session, log is available via PhET menu
 * screenIndex - selects this screen on the home screen
 * showHomeScreen - if false, go immediate to screenIndex, defaults to screenIndex=0
 * showPointerAreas - touch areas in red, mouse areas in blue, both dotted outlines
 * standalone - runs screenIndex as a standalone sim, defaults to screenIndex=0
 *
 * @author Sam Reid, PhET
 * @author Chris Malley (PixelZoom, Inc.)
 */
(function() {
  'use strict';

  if ( !window.phetcommon ) {
    window.phetcommon = {};
  }

  //Pre-populate the query parameters map so that multiple subsequent look-ups are fast
  var queryParamsMap = {};

  if ( typeof window !== 'undefined' && window.location.search ) {
    var params = window.location.search.slice( 1 ).split( '&' );
    for ( var i = 0; i < params.length; i++ ) {
      var nameValuePair = params[i].split( '=' );
      queryParamsMap[nameValuePair[0]] = decodeURIComponent( nameValuePair[1] );
    }
  }

  /**
   * Retrieves the first occurrence of a query parameter based on its key.
   * Returns undefined if the query parameter is not found.
   * @param {String} key
   * @return {String}
   */
  window.phetcommon.getQueryParameter = function( key ) {
    return queryParamsMap[key];
  };

}());

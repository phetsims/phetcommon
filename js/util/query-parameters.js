// Copyright 2002-2013, University of Colorado Boulder

/**
 * PhET Simulations can be launched with query parameters which enable certain features.
 *
 * Query parameters most useful for QA Testing:
 *
 * dev - enable developer-only features, such as showing the layout bounds
 * ea - enable assertions, internal code error checks
 * fuzzMouse - randomly sends mouse events to sim
 * profiler - shows profiling information for the sim
 * showPointerAreas - touch areas in red, mouse areas in blue, both dotted outlines
 * webgl - can be set to false to turn off webgl rendering in scenery, see https://github.com/phetsims/scenery/issues/289
 *
 * Other query parameters:
 *
 * accessibility - enable accessibility features, such as keyboard navigation (mileage may vary!)
 * eall - enable all assertions, as above but with more time consuming checks
 * iframeAPI - enable the SimIFrameAPI, see SimIFrameAPI.js
 * locale - test with a specific locale
 * playbackInputEventLog - plays event logging back from the server, provide an optional name for the session
 * recordInputEventLog - enables input event logging, provide an optional name for the session, log is available via PhET menu
 * screenIndex - selects this screen on the home screen
 * screens - select one or more screens (with a 1-based index) to run in the sim, with a dot instead of a comma delimiter.
 *                          - For example ?screens=3.1 will launch with screen 1 and 3 with 3 first and 1 second.
 *                          - ?screens=2 would launch with just screen 2.
 *                          - Note that launching with a subset of screens can speed up the startup time significantly
 *                          - because only the selected screens are initialized
 * showHomeScreen - if false, go immediate to screenIndex, defaults to screenIndex=0
 * standalone - runs screenIndex as a standalone sim, defaults to screenIndex=0
 * webglContextLossTimeout - if enabled, will create WebGL contexts that can simulate context loss
 *                         - if a value is specified, it will also simulate a context loss after the specified number
 *                         - of milliseconds has elapsed.
 *                         - The value can be omitted to manually simulate the context loss with simScene.simulateWebGLContextLoss()
 * webglContextLossIncremental - if this option is present, it will put the WebGLLayer into a testing mode which
 *                             - simulates context loss between successively increasing gl calls (starting at 1)
 *                             - this option should be used in conjunction with webglContextLossTimeout since
 *                             - it only triggers upon the first context lass.
 *
 * This file reads query parameters from browser window's URL.
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
   * @param {string} key
   * @return {string}
   */
  window.phetcommon.getQueryParameter = function( key ) {
    return queryParamsMap[key];
  };

}());

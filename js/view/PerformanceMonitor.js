// Copyright 2013-2015, University of Colorado Boulder

/**
 * Displays frames-per-second (FPS) and frame rendering time in milliseconds.
 * Click on it to toggle between the 2 views.
 * Use this for performance debugging.
 * <p>
 * Dependencies: stats.js
 */
define( function( require ) {
  'use strict';

  // modules
  var Stats = require( 'stats' ); // eslint-disable-line require-statement-match
  var phetcommon = require( 'PHETCOMMON/phetcommon' );

  /**
   * @constructor
   */
  function PerformanceMonitor() {

    var stats = new Stats();

    stats.setMode( 0 ); // 0: fps, 1: ms

    // align at top-left
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0px';
    stats.domElement.style.top = '0px';

    // add to DOM
    document.body.appendChild( stats.domElement );

    // @param {boolean} visible
    this.setVisible = function( visible ) {
      if ( visible ) {
        stats.domElement.style.visibility = 'visible';
      }
      else {
        stats.domElement.style.visibility = 'hidden';
      }
    };

    this.begin = function() {
      stats.begin();
    };

    this.end = function() {
      stats.end();
    };
  }

  phetcommon.register( 'PerformanceMonitor', PerformanceMonitor );

  return PerformanceMonitor;
} );
// Copyright 2002-2013, University of Colorado Boulder

/**
 * If arch has already been preloaded, then this script does nothing.
 * If arch has not been preloaded, then this will assign window.arch = null
 *
 * This will enable us to use a pattern like `arch && arch.method`
 *
 * Must be run before RequireJS, and assumes that assert.js and query-parameters.js has been run.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
(function() {
  'use strict';

  window.arch = window.arch || null;
}());

// Copyright 2002-2013, University of Colorado Boulder

/**
 * This updates the locale in the require.js config, and hence should be loaded after requirejs is loaded.
 * See https://github.com/phetsims/ohms-law/issues/16?source=c
 */
(function() {
  'use strict';
  require.config( {config: { i18n: { locale: window.phetcommon.getQueryParameter( 'locale' ) } }} );
})();
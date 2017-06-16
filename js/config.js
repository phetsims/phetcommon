// Copyright 2013-2017, University of Colorado Boulder

require.config( {
  deps: [ 'main' ],

  paths: {

    // third-party libs
    text: '../../sherpa/lib/text-2.0.12',

    // PhET plugins
    ifphetio: '../../chipper/js/requirejs-plugins/ifphetio',

    // PhET libs, uppercase names to identify them in require.js imports
    AXON: '../../axon/js',
    DOT: '../../dot/js',
    KITE: '../../kite/js',
    PHET_CORE: '../../phet-core/js',
    REPOSITORY: '..',
    TANDEM: '../../tandem/js',

    // this repository
    PHETCOMMON: '.'
  },

  urlArgs: Date.now()
} );

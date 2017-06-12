// Copyright 2017, University of Colorado Boulder

/**
 * wrapper type for SphereBucket
 * @author Sam Reid (PhET Interactive Simulations)
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var phetcommon = require( 'PHETCOMMON/phetcommon' );

  // phet-io modules
  var assertInstanceOf = require( 'ifphetio!PHET_IO/assertions/assertInstanceOf' );
  var phetio = require( 'ifphetio!PHET_IO/phetio' );
  var phetioInherit = require( 'ifphetio!PHET_IO/phetioInherit' );
  var TObject = require( 'ifphetio!PHET_IO/types/TObject' );

  /**
   * @param {SphereBucket} instance
   * @param {string} phetioID
   * @constructor
   */
  function TSphereBucket( instance, phetioID ) {
    TObject.call( this, instance, phetioID );
    assertInstanceOf( instance, phet.phetcommon.SphereBucket );
  }

  // helper function for retrieving the tandem for a particle
  function getParticleTandemID( particle ) {
    return particle.particleTandem.id;
  }

  phetioInherit( TObject, 'TSphereBucket', TSphereBucket, {}, {

    /**
     * create a description of the state that isn't automatically handled by the framework (e.g. Property instances)
     * @param {SphereBucket} instance
     */
    toStateObject: function( instance ) {
      return instance._particles.map( getParticleTandemID );
    },

    /**
     * @param {string[]} stateArray
     * @returns {Particle[]}
     */
    fromStateObject: function( stateArray ) {
      return stateArray.map( function( tandemID ) { return phetio.getInstance( tandemID ); } );
    },

    /**
     * @param {SphereBucket} instance
     * @param {Particle[]} particleArray
     */
    setValue: function( instance, particleArray ) {

      // remove all the particles from the observable arrays
      instance.reset();

      // add back the particles
      particleArray.forEach( function( particle ) { instance.addParticle( particle ); } );
    },

    documentation: 'A model of a bucket into which spherical objects can be placed.'
  } );

  phetcommon.register( 'TSphereBucket', TSphereBucket );

  return TSphereBucket;
} );
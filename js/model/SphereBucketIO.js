// Copyright 2017, University of Colorado Boulder

/**
 * IO type for SphereBucket
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author John Blanco (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var ObjectIO = require( 'TANDEM/types/ObjectIO' );
  var phetcommon = require( 'PHETCOMMON/phetcommon' );
  var phetioInherit = require( 'TANDEM/phetioInherit' );
  var validate = require( 'AXON/validate' );

  // ifphetio
  var phetioEngine = require( 'ifphetio!PHET_IO/phetioEngine' );

  /**
   * @param {SphereBucket} sphereBucket
   * @param {string} phetioID
   * @constructor
   */
  function SphereBucketIO( sphereBucket, phetioID ) {
    ObjectIO.call( this, sphereBucket, phetioID );
  }

  // helper function for retrieving the tandem for a particle
  function getParticleTandemID( particle ) {
    return particle.tandem.phetioID;
  }

  phetioInherit( ObjectIO, 'SphereBucketIO', SphereBucketIO, {}, {
    validator: { isValidValue: v => v instanceof phet.phetcommon.SphereBucket },

    /**
     * create a description of the state that isn't automatically handled by the framework (e.g. Property instances)
     * @param {SphereBucket} sphereBucket
     */
    toStateObject: function( sphereBucket ) {
      validate( sphereBucket, this.validator );
      return sphereBucket._particles.map( getParticleTandemID );
    },

    /**
     * @param {string[]} stateArray
     * @returns {Particle[]}
     */
    fromStateObject: function( stateArray ) {
      return stateArray.map( function( tandemID ) { return phetioEngine.getPhetioObject( tandemID ); } );
    },

    /**
     * @param {SphereBucket} sphereBucket
     * @param {Particle[]} fromStateObject
     */
    setValue: function( sphereBucket, fromStateObject ) {
      validate( sphereBucket, this.validator );

      // remove all the particles from the observable arrays
      sphereBucket.reset();

      // add back the particles
      fromStateObject.forEach( function( particle ) { sphereBucket.addParticle( particle ); } );
    },

    documentation: 'A model of a bucket into which spherical objects can be placed.'
  } );

  phetcommon.register( 'SphereBucketIO', SphereBucketIO );

  return SphereBucketIO;
} );
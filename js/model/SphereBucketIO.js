// Copyright 2017-2020, University of Colorado Boulder

/**
 * IO type for SphereBucket
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author John Blanco (PhET Interactive Simulations)
 */

import validate from '../../../axon/js/validate.js';
import ObjectIO from '../../../tandem/js/types/ObjectIO.js';
import phetcommon from '../phetcommon.js';

class SphereBucketIO extends ObjectIO {

  /**
   * create a description of the state that isn't automatically handled by the framework (e.g. Property instances)
   * @param {SphereBucket} sphereBucket
   */
  static toStateObject( sphereBucket ) {
    validate( sphereBucket, this.validator );
    return sphereBucket._particles.map( getParticleTandemID );
  }

  /**
   * @param {string[]} stateArray
   * @returns {Particle[]}
   */
  static fromStateObject( stateArray ) {
    return stateArray.map( function( tandemID ) { return phet.phetio.phetioEngine.getPhetioObject( tandemID ); } );
  }

  /**
   * @param {SphereBucket} sphereBucket
   * @param {Particle[]} fromStateObject
   */
  static setValue( sphereBucket, fromStateObject ) {
    validate( sphereBucket, this.validator );

    // remove all the particles from the observable arrays
    sphereBucket.reset();

    // add back the particles
    fromStateObject.forEach( function( particle ) { sphereBucket.addParticle( particle ); } );
  }
}

SphereBucketIO.validator = { isValidValue: v => v instanceof phet.phetcommon.SphereBucket };
SphereBucketIO.typeName = 'SphereBucketIO';
SphereBucketIO.documentation = 'A model of a bucket into which spherical objects can be placed.';
ObjectIO.validateSubtype( SphereBucketIO );

// helper function for retrieving the tandem for a particle
function getParticleTandemID( particle ) {
  return particle.tandem.phetioID;
}

phetcommon.register( 'SphereBucketIO', SphereBucketIO );
export default SphereBucketIO;
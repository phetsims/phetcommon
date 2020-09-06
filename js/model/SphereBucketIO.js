// Copyright 2017-2020, University of Colorado Boulder

/**
 * IO Type for SphereBucket
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
   * @public
   */
  static toStateObject( sphereBucket ) {
    validate( sphereBucket, this.validator );
    return sphereBucket._particles.map( getParticleTandemID );
  }

  /**
   * @param {SphereBucket} sphereBucket
   * @param {Object} stateObject
   * @public
   */
  static applyState( sphereBucket, stateObject ) {
    validate( sphereBucket, this.validator );

    // remove all the particles from the observable arrays
    sphereBucket.reset();

    const particles = stateObject.map( tandemID => phet.phetio.phetioEngine.getPhetioObject( tandemID ) );

    // add back the particles
    particles.forEach( particle => { sphereBucket.addParticle( particle ); } );
  }
}

SphereBucketIO.validator = { isValidValue: v => v instanceof phet.phetcommon.SphereBucket };
SphereBucketIO.typeName = 'SphereBucketIO';
SphereBucketIO.documentation = 'A model of a bucket into which spherical objects can be placed.';
ObjectIO.validateIOType( SphereBucketIO );

// helper function for retrieving the tandem for a particle
function getParticleTandemID( particle ) {
  return particle.tandem.phetioID;
}

phetcommon.register( 'SphereBucketIO', SphereBucketIO );
export default SphereBucketIO;
// Copyright 2017-2020, University of Colorado Boulder

/**
 * IO Type for SphereBucket
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author John Blanco (PhET Interactive Simulations)
 */

import IOType from '../../../tandem/js/types/IOType.js';
import phetcommon from '../phetcommon.js';

const SphereBucketIO = new IOType( 'SphereBucketIO', {
  isValidValue: v => v instanceof phet.phetcommon.SphereBucket,
  documentation: 'A model of a bucket into which spherical objects can be placed.',
  toStateObject: sphereBucket => sphereBucket._particles.map( particle => particle.tandem.phetioID ),
  applyState: ( sphereBucket, stateObject ) => {

    // remove all the particles from the observable arrays
    sphereBucket.reset();
    const particles = stateObject.map( tandemID => phet.phetio.phetioEngine.getPhetioObject( tandemID ) );

    // add back the particles
    particles.forEach( particle => { sphereBucket.addParticle( particle ); } );
  }
} );

phetcommon.register( 'SphereBucketIO', SphereBucketIO );
export default SphereBucketIO;
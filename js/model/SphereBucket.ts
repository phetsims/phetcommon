// Copyright 2013-2023, University of Colorado Boulder

/**
 * SphereBucket is a model of a bucket that can be used to store spherical objects.  It manages the addition and removal
 * of the spheres, stacks them as they are added, and manages the stack as spheres are removed.
 *
 * This expects the spheres to have certain properties, please inspect the code to understand the 'contract' between the
 * bucket and the spheres.
 *
 * @author John Blanco
 */

import Utils from '../../../dot/js/Utils.js';
import Vector2 from '../../../dot/js/Vector2.js';
import cleanArray from '../../../phet-core/js/cleanArray.js';
import Tandem from '../../../tandem/js/Tandem.js';
import ArrayIO from '../../../tandem/js/types/ArrayIO.js';
import IOType from '../../../tandem/js/types/IOType.js';
import ReferenceIO from '../../../tandem/js/types/ReferenceIO.js';
import phetcommon from '../phetcommon.js';
import Bucket, { BucketOptions } from './Bucket.js';
import optionize from '../../../phet-core/js/optionize.js';
import Particle from '../../../shred/js/model/Particle.js';

type ParticleWithBucketRemovalListener = Particle & { bucketRemovalListener?: () => void };

const ReferenceObjectArrayIO = ArrayIO( ReferenceIO( IOType.ObjectIO ) );

type SelfOptions = {
  sphereRadius?: number;
  usableWidthProportion?: number;
  verticalParticleOffset?: number | null;
};
type SphereBucketOptions = SelfOptions & BucketOptions;

class SphereBucket extends Bucket {

  private readonly sphereBucketTandem: Tandem;
  private readonly _sphereRadius: number;
  private readonly _usableWidthProportion: number;

  // empirically determined, for positioning particles inside the bucket
  private readonly _verticalParticleOffset: number;

  // particles managed by this bucket
  private _particles: ParticleWithBucketRemovalListener[] = [];

  public constructor( providedOptions?: SphereBucketOptions ) {

    const options = optionize<SphereBucketOptions, SelfOptions, BucketOptions>()( {
      sphereRadius: 10,  // expected radius of the spheres that will be placed in this bucket
      usableWidthProportion: 1.0,  // proportion of the bucket width that the spheres can occupy
      tandem: Tandem.OPTIONAL,
      phetioType: SphereBucket.SphereBucketIO,
      verticalParticleOffset: null
    }, providedOptions );

    super( options );

    this.sphereBucketTandem = options.tandem;
    this._sphereRadius = options.sphereRadius;
    this._usableWidthProportion = options.usableWidthProportion;

    this._verticalParticleOffset = options.verticalParticleOffset === null ?
                                   -this._sphereRadius * 0.4 :
                                   options.verticalParticleOffset;

    this._particles = [];
  }

  /**
   * add a particle to the first open position in the stacking order
   */
  public addParticleFirstOpen( particle: Particle, animate: boolean ): void {
    particle.destinationProperty.set( this.getFirstOpenPosition() );
    this.addParticle( particle, animate );
  }

  /**
   * add a particle to the nearest open position in the particle stack
   */
  public addParticleNearestOpen( particle: Particle, animate: boolean ): void {
    particle.destinationProperty.set( this.getNearestOpenPosition( particle.destinationProperty.get() ) );
    this.addParticle( particle, animate );
  }

  /**
   * add a particle to the bucket and set up listeners for when the particle is removed
   */
  private addParticle( particle: ParticleWithBucketRemovalListener, animate: boolean ): void {
    if ( !animate ) {
      particle.positionProperty.set( particle.destinationProperty.get() );
    }
    this._particles.push( particle );

    // add a listener that will remove this particle from the bucket if the user grabs it
    const particleRemovedListener = () => {
      this.removeParticle( particle );

      // the process of removing the particle from the bucket should also disconnect removal listener
      assert && assert( !particle.bucketRemovalListener, 'listener still present after being removed from bucket' );
    };
    particle.userControlledProperty.lazyLink( particleRemovedListener );
    particle.bucketRemovalListener = particleRemovedListener; // Attach to the particle to aid unlinking in some cases.
  }

  /**
   * remove a particle from the bucket, updating listeners as necessary
   */
  public removeParticle( particle: ParticleWithBucketRemovalListener, skipLayout = false ): void {
    assert && assert( this.containsParticle( particle ), 'attempt made to remove particle that is not in bucket' );

    // remove the particle from the array
    this._particles = _.without( this._particles, particle );

    // remove the removal listener if it is still present
    if ( particle.bucketRemovalListener ) {
      particle.userControlledProperty.unlink( particle.bucketRemovalListener );
      delete particle.bucketRemovalListener;
    }

    // redo the layout of the particles if enabled
    if ( !skipLayout ) {
      this.relayoutBucketParticles();
    }
  }

  public containsParticle( particle: Particle ): boolean {
    return this._particles.includes( particle );
  }

  /**
   * extract the particle that is closest to the provided position from the bucket
   */
  public extractClosestParticle( position: Vector2 ): Particle | null {
    let closestParticle: Particle | null = null;
    this._particles.forEach( particle => {
      if ( closestParticle === null ||
           closestParticle.positionProperty.get().distance( position ) > particle.positionProperty.get().distance( position ) ) {
        closestParticle = particle;
      }
    } );

    const closestParticleValue = closestParticle as Particle | null;
    if ( closestParticleValue !== null ) {

      // The particle is removed by setting 'userControlled' to true.  This relies on the listener that was added when
      // the particle was placed into the bucket.
      closestParticleValue.userControlledProperty.set( true );
    }
    return closestParticle;
  }

  /**
   * get the list of particles currently contained within this bucket
   */
  public getParticleList(): Particle[] { return this._particles; }

  public reset(): void {
    this._particles.forEach( particle => {

      // Remove listeners that are watching for removal from bucket.
      if ( typeof ( particle.bucketRemovalListener ) === 'function' ) {
        particle.userControlledProperty.unlink( particle.bucketRemovalListener );
        delete particle.bucketRemovalListener;
      }
    } );
    cleanArray( this._particles );
  }

  /**
   * check if the provided position is open, i.e. unoccupied by a particle
   */
  private isPositionOpen( position: Vector2 ): boolean {
    let positionOpen = true;
    for ( let i = 0; i < this._particles.length; i++ ) {
      const particle = this._particles[ i ];
      if ( particle.destinationProperty.get().equals( position ) ) {
        positionOpen = false;
        break;
      }
    }
    return positionOpen;
  }

  /**
   * Find the first open position in the stacking order, which is a triangular stack starting from the lower left.
   */
  private getFirstOpenPosition(): Vector2 {
    let openPosition = Vector2.ZERO;
    const usableWidth = this.size.width * this._usableWidthProportion - 2 * this._sphereRadius;
    let offsetFromBucketEdge = ( this.size.width - usableWidth ) / 2 + this._sphereRadius;
    let numParticlesInLayer = Math.floor( usableWidth / ( this._sphereRadius * 2 ) );
    let row = 0;
    let positionInLayer = 0;
    let found = false;
    while ( !found ) {
      const testPosition = new Vector2(
        this.position.x - this.size.width / 2 + offsetFromBucketEdge + positionInLayer * 2 * this._sphereRadius,
        this.getYPositionForLayer( row )
      );
      if ( this.isPositionOpen( testPosition ) ) {

        // We found a position that is open.
        openPosition = testPosition;
        found = true;
      }
      else {
        positionInLayer++;
        if ( positionInLayer >= numParticlesInLayer ) {
          // Move to the next layer.
          row++;
          positionInLayer = 0;
          numParticlesInLayer--;
          offsetFromBucketEdge += this._sphereRadius;
          if ( numParticlesInLayer === 0 ) {
            // This algorithm doesn't handle the situation where
            // more particles are added than can be stacked into
            // a pyramid of the needed size, but so far it hasn't
            // needed to.  If this requirement changes, the
            // algorithm will need to change too.
            numParticlesInLayer = 1;
            offsetFromBucketEdge -= this._sphereRadius;
          }
        }
      }
    }
    return openPosition;
  }

  /**
   * get the layer in the stacking order for the provided y (vertical) position
   */
  private getLayerForYPosition( yPosition: number ): number {
    return Math.abs( Utils.roundSymmetric( ( yPosition - ( this.position.y + this._verticalParticleOffset ) ) / ( this._sphereRadius * 2 * 0.866 ) ) );
  }

  /**
   * Get the nearest open position in the stacking order that would be supported if the particle were to be placed
   * there.  This is used for particle stacking.
   */
  private getNearestOpenPosition( position: Vector2 ): Vector2 {

    // Determine the highest occupied layer.  The bottom layer is 0.
    let highestOccupiedLayer = 0;
    _.each( this._particles, particle => {
      const layer = this.getLayerForYPosition( particle.destinationProperty.get().y );
      if ( layer > highestOccupiedLayer ) {
        highestOccupiedLayer = layer;
      }
    } );

    // Make a list of all open positions in the occupied layers.
    const openPositions = [];
    const usableWidth = this.size.width * this._usableWidthProportion - 2 * this._sphereRadius;
    let offsetFromBucketEdge = ( this.size.width - usableWidth ) / 2 + this._sphereRadius;
    let numParticlesInLayer = Math.floor( usableWidth / ( this._sphereRadius * 2 ) );

    // Loop, searching for open positions in the particle stack.
    for ( let layer = 0; layer <= highestOccupiedLayer + 1; layer++ ) {

      // Add all open positions in the current layer.
      for ( let positionInLayer = 0; positionInLayer < numParticlesInLayer; positionInLayer++ ) {
        const testPosition = new Vector2( this.position.x - this.size.width / 2 + offsetFromBucketEdge + positionInLayer * 2 * this._sphereRadius,
          this.getYPositionForLayer( layer ) );
        if ( this.isPositionOpen( testPosition ) ) {

          // We found a position that is unoccupied.
          if ( layer === 0 || this.countSupportingParticles( testPosition ) === 2 ) {

            // This is a valid open position.
            openPositions.push( testPosition );
          }
        }
      }

      // Adjust variables for the next layer.
      numParticlesInLayer--;
      offsetFromBucketEdge += this._sphereRadius;
      if ( numParticlesInLayer === 0 ) {

        // If the stacking pyramid is full, meaning that there are no positions that are open within it, this algorithm
        // classifies the positions directly above the top of the pyramid as being open.  This would result in a stack
        // of particles with a pyramid base.  So far, this hasn't been a problem, but this limitation may limit
        // reusability of this algorithm.
        numParticlesInLayer = 1;
        offsetFromBucketEdge -= this._sphereRadius;
      }
    }

    // Find the closest open position to the provided current position.
    // Only the X-component is used for this determination, because if
    // the Y-component is used the particles often appear to fall sideways
    // when released above the bucket, which just looks weird.
    let closestOpenPosition = openPositions[ 0 ] || Vector2.ZERO;

    _.each( openPositions, openPosition => {
      if ( openPosition.distance( position ) < closestOpenPosition.distance( position ) ) {
        // This openPosition is closer.
        closestOpenPosition = openPosition;
      }
    } );
    return closestOpenPosition;
  }

  /**
   * given a layer in the stack, calculate the corresponding Y position for a particle in that layer
   */
  private getYPositionForLayer( layer: number ): number {
    return this.position.y + this._verticalParticleOffset + layer * this._sphereRadius * 2 * 0.866;
  }

  /**
   * Determine whether a particle is 'dangling', i.e. hanging above an open space in the stack of particles.  Dangling
   * particles should be made to fall to a stable position.
   */
  private isDangling( particle: Particle ): boolean {
    const onBottomRow = particle.destinationProperty.get().y === this.position.y + this._verticalParticleOffset;
    return !onBottomRow && this.countSupportingParticles( particle.destinationProperty.get() ) < 2;
  }

  /**
   * count the number of particles that are positioned to support a particle in the provided position
   * @returns - a number from 0 to 2, inclusive
   */
  private countSupportingParticles( position: Vector2 ): number {
    let count = 0;
    for ( let i = 0; i < this._particles.length; i++ ) {
      const p = this._particles[ i ];
      if ( p.destinationProperty.get().y < position.y && // Must be in a lower layer
           p.destinationProperty.get().distance( position ) < this._sphereRadius * 3 ) {

        // Must be a supporting particle.
        count++;
      }
    }
    return count;
  }

  /**
   * Relayout the particles, generally done after a particle is removed and some other need to fall.
   */
  private relayoutBucketParticles(): void {
    let particleMoved;
    do {
      for ( let i = 0; i < this._particles.length; i++ ) {
        particleMoved = false;
        const particle = this._particles[ i ];
        if ( this.isDangling( particle ) ) {
          particle.destinationProperty.set( this.getNearestOpenPosition( particle.destinationProperty.get() ) );
          particleMoved = true;
          break;
        }
      }
    } while ( particleMoved );
  }

  public static SphereBucketIO = new IOType( 'SphereBucketIO', {
    valueType: SphereBucket,
    documentation: 'A model of a bucket into which spherical objects can be placed.',
    stateSchema: {
      particles: ReferenceObjectArrayIO
    },
    toStateObject: sphereBucket => {
      return { particles: ReferenceObjectArrayIO.toStateObject( sphereBucket._particles ) };
    },
    applyState: ( sphereBucket, stateObject ) => {

      // remove all the particles from the observable arrays
      sphereBucket.reset();

      const particles = ReferenceObjectArrayIO.fromStateObject( stateObject.particles );

      // add back the particles
      particles.forEach( particle => { sphereBucket.addParticle( particle ); } );
    }
  } );
}

phetcommon.register( 'SphereBucket', SphereBucket );
export default SphereBucket;
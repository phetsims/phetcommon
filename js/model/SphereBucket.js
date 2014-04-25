// Copyright 2002-2013, University of Colorado Boulder

/*
 * A bucket that can be used to store spherical objects.  Manages the addition
 * and removal of the spheres, and stacks them as the are added, and manages
 * the stack as spheres are removed.
 *
 * This expects the spheres to have certain properties, please inspect the
 * code to understand the 'contract' between the bucket and the spheres.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // Includes
  var cleanArray = require( 'PHET_CORE/cleanArray' );
  var Vector2 = require( 'DOT/Vector2' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Bucket = require( 'PHETCOMMON/model/Bucket' );

  function SphereBucket( options ) {
    Bucket.call( this, options );
    this._sphereRadius = options.sphereRadius || 10;
    this._usableWidthProportion = options.usableWidthProportion || 1.0;

    // Empirically determined, for positioning particles inside the bucket.
    this._verticalParticleOffset = options.verticalParticleOffset === undefined ? -this._sphereRadius * 0.4 : options.verticalParticleOffset;
    this._particles = [];
  }

  // Inherit from base type.
  inherit( Bucket, SphereBucket );

  // NOTE: beware, 2nd argument boolean flag is the opposite from the Java implementation!
  SphereBucket.prototype.addParticleFirstOpen = function( particle, animate ) {
    particle.destination = this._getFirstOpenLocation();
    this._addParticle( particle, animate );
  };

  SphereBucket.prototype.addParticleNearestOpen = function( particle, animate ) {
    particle.destination = this._getNearestOpenLocation( particle.destination );
    this._addParticle( particle, animate );
  };

  SphereBucket.prototype._addParticle = function( particle, animate ) {
    if ( !animate ) {
      particle.position = particle.destination;
    }
    this._particles.push( particle );
    var thisBucket = this;
    var particleRemovedListener = function( userControlled ) {
      thisBucket.removeParticle( particle );
      particle.userControlledProperty.unlink( particleRemovedListener );
      delete particle.bucketRemovalListener;
    };
    particle.userControlledProperty.lazyLink( particleRemovedListener );
    particle.bucketRemovalListener = particleRemovedListener; // Attach to the particle to aid unlinking in some cases.
  };

  SphereBucket.prototype.removeParticle = function( particle, skipLayout ) {
    if ( this._particles.indexOf( particle ) === -1 ) {
      console.log( 'Error: Attempt to remove particle not contained in bucket, ignoring.' );
      return;
    }
    this._particles = _.without( this._particles, particle );
    if ( !skipLayout ) {
      this.relayoutBucketParticles();
    }
  };

  SphereBucket.prototype.containsParticle = function( particle ) {
    return this._particles.indexOf( particle ) !== -1;
  };

  SphereBucket.prototype.extractClosestParticle = function( location ) {
    var closestParticle = null;
    this._particles.forEach( function( particle ) {
      if ( closestParticle === null || closestParticle.position.distance( location ) > particle.position.distance( location ) ) {
        closestParticle = particle;
      }
    } );
    if ( closestParticle !== null ) {
      // The particle is removed by setting 'userControlled' to true.  This
      // relies on the listener that was added when the particle was placed
      // into the bucket.
      closestParticle.userControlled = true;
    }
    return closestParticle;
  };

  SphereBucket.prototype.getParticleList = function() { return this._particles; };

  SphereBucket.prototype.reset = function() {
    this._particles.forEach( function( particle ) {
      // Remove listeners that are watching for removal from bucket.
      if ( typeof( particle.bucketRemovalListener ) === 'function' ) {
        particle.userControlledProperty.unlink( particle.bucketRemovalListener );
        delete particle.bucketRemovalListener;
      }
    } );
    cleanArray( this._particles );
  };

  SphereBucket.prototype._isPositionOpen = function( position ) {
    var positionOpen = true;
    for ( var i = 0; i < this._particles.length; i++ ) {
      var particle = this._particles[ i ];
      if ( particle.destination.equals( position ) ) {
        positionOpen = false;
        break;
      }
    }
    return positionOpen;
  };

  SphereBucket.prototype._getFirstOpenLocation = function() {
    var openLocation = Vector2.ZERO;
    var usableWidth = this.size.width * this._usableWidthProportion - 2 * this._sphereRadius;
    var offsetFromBucketEdge = ( this.size.width - usableWidth ) / 2 + this._sphereRadius;
    var numParticlesInLayer = Math.floor( usableWidth / ( this._sphereRadius * 2 ) );
    var row = 0;
    var positionInLayer = 0;
    var found = false;
    while ( !found ) {
      var testLocation = new Vector2( this.position.x - this.size.width / 2 + offsetFromBucketEdge + positionInLayer * 2 * this._sphereRadius,
        this._getYPositionForLayer( row ) );
      if ( this._isPositionOpen( testLocation ) ) {
        // We found a location that is open.
        openLocation = testLocation;
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
    return openLocation;
  };

  SphereBucket.prototype._getLayerForYPosition = function( yPosition ) {
    return Math.abs( Math.round( ( yPosition - ( this.position.y + this._verticalParticleOffset ) ) / ( this._sphereRadius * 2 * 0.866 ) ) );
  };

  /*
   * Get the nearest open location to the provided current location.  This
   * is used for particle stacking.
   *
   * @param location
   * @return
   */
  SphereBucket.prototype._getNearestOpenLocation = function( position ) {
    // Determine the highest occupied layer.  The bottom layer is 0.
    var highestOccupiedLayer = 0;
    var self = this;
    _.each( this._particles, function( particle ) {
      var layer = self._getLayerForYPosition( particle.destination.y );
      if ( layer > highestOccupiedLayer ) {
        highestOccupiedLayer = layer;
      }
    } );

    // Make a list of all open locations in the occupied layers.
    var openLocations = [];
    var usableWidth = this.size.width * this._usableWidthProportion - 2 * this._sphereRadius;
    var offsetFromBucketEdge = ( this.size.width - usableWidth ) / 2 + this._sphereRadius;
    var numParticlesInLayer = Math.floor( usableWidth / ( this._sphereRadius * 2 ) );

    // Loop, searching for open positions in the particle stack.
    for ( var layer = 0; layer <= highestOccupiedLayer + 1; layer++ ) {

      // Add all open locations in the current layer.
      for ( var positionInLayer = 0; positionInLayer < numParticlesInLayer; positionInLayer++ ) {
        var testPosition = new Vector2( this.position.x - this.size.width / 2 + offsetFromBucketEdge + positionInLayer * 2 * this._sphereRadius,
          this._getYPositionForLayer( layer ) );
        if ( this._isPositionOpen( testPosition ) ) {

          // We found a location that is unoccupied.
          if ( layer === 0 || this.countSupportingParticles( testPosition ) === 2 ) {
            // This is a valid open location.
            openLocations.push( testPosition );
          }
        }
      }

      // Adjust variables for the next layer.
      numParticlesInLayer--;
      offsetFromBucketEdge += this._sphereRadius;
      if ( numParticlesInLayer === 0 ) {
        // If the stacking pyramid is full, meaning that there are
        // no locations that are open within it, this algorithm
        // classifies the locations directly above the top of the
        // pyramid as being open.  This would result in a stack
        // of particles with a pyramid base.  So far, this hasn't
        // been a problem, but this limitation may limit
        // reusability of this algorithm.
        numParticlesInLayer = 1;
        offsetFromBucketEdge -= this._sphereRadius;
      }
    }

    // Find the closest open location to the provided current location.
    // Only the X-component is used for this determination, because if
    // the Y-component is used the particles often appear to fall sideways
    // when released above the bucket, which just looks weird.
    var closestOpenLocation = openLocations[0] || Vector2.ZERO;

    _.each( openLocations, function( location ) {
      if ( location.distance( position ) < closestOpenLocation.distance( position ) ) {
        // This location is closer.
        closestOpenLocation = location;
      }
    } );
    return closestOpenLocation;
  };

  SphereBucket.prototype._getYPositionForLayer = function( layer ) {
    return this.position.y + this._verticalParticleOffset + layer * this._sphereRadius * 2 * 0.866;
  };

  /*
   * Determine whether a particle is 'dangling', i.e. hanging above an open
   * space in the stack of particles.  Dangling particles should fall.
   */
  SphereBucket.prototype._isDangling = function( particle ) {
    var onBottomRow = particle.destination.y === this.position.y + this._verticalParticleOffset;
    return !onBottomRow && this.countSupportingParticles( particle.destination ) < 2;
  };

  SphereBucket.prototype.countSupportingParticles = function( position ) {
    var count = 0;
    for ( var i = 0; i < this._particles.length; i++ ) {
      var p = this._particles[i];
      if ( p.destination.y < position.y && // Must be in a lower layer
           p.destination.distance( position ) < this._sphereRadius * 3 ) {
        // Must be a supporting particle.
        count++;
      }
    }
    return count;
  };

  SphereBucket.prototype.relayoutBucketParticles = function() {
    var particleMoved;
    do {
      for ( var i = 0; i < this._particles.length; i++ ) {
        particleMoved = false;
        var particle = this._particles[i];
        if ( this._isDangling( particle ) ) {
          particle.destination = this._getNearestOpenLocation( particle.destination );
          particleMoved = true;
          break;
        }
      }
    } while ( particleMoved );
  };

  return SphereBucket;
} );

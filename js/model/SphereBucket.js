// Copyright 2002-2013, University of Colorado

/*
 * A bucket that can be used to store spherical objects.  Manages the addition
 * and removal of the spheres, and stacks them as the are added, and manages
 * the stack as spheres are removed.
 *
 * This expects the spheres to have certain properties, please inspect the
 * code to understand the "contract" between the bucket and the spheres.
 *
 * @author John Blanco
 */
define( function ( require ) {

  var Vector2 = require( 'DOT/Vector2' );
  var Inheritance = require( 'PHETCOMMON/util/Inheritance' );
  var Bucket = require( 'PHETCOMMON/model/Bucket' );

  function SphereBucket( options ) {
    Bucket.call( this, options );
    this.particleRadius = options.particleRadius || 10;
    this.yOffset = this.particleRadius; // Empirically determined, for positioning particles inside the bucket.
    this.particles = [];
  }

  // Inherit from base type.
  Inheritance.inheritPrototype( SphereBucket, Bucket );

  SphereBucket.prototype.addParticleFirstOpen = function ( particle ) {
    particle.position = this.getFirstOpenLocation();
    this.particles.push( particle );
    var thisBucket = this;
    particle.link( 'userControlled', function ( m, userControlled ) {
      if ( userControlled ) {
        thisBucket.removeParticle( particle );
      }
    } )
  }

  SphereBucket.prototype.addParticleNearestOpen = function ( particle ) {
    particle.position = this.getNearestOpenLocation( particle.position );
    this.particles.push( particle );
    var thisBucket = this;
    particle.link( 'userControlled', function ( m, userControlled ) {
      if ( userControlled ) {
        thisBucket.removeParticle( particle );
      }
    } )
  }

  SphereBucket.prototype.removeParticle = function ( particle ) {
    if ( this.particles.indexOf( particle ) == -1 ) {
      console.log( "Error: Attempt to remove particle not contained in bucket, ignoring." );
      return;
    }
    this.particles = _.without( this.particles, particle );
    this.relayoutBucketParticles();
  }

  SphereBucket.prototype.isPositionOpen = function ( position ) {
    var positionOpen = true;
    for ( var i = 0; i < this.particles.length; i++ ) {
      var particle = this.particles[ i ];
      if ( particle.position.equals( position ) ) {
        positionOpen = false;
        break;
      }
    }
    return positionOpen;
  }

  SphereBucket.prototype.getFirstOpenLocation = function () {
    var openLocation = Vector2.ZERO;
    var usableWidth = this.size.width - 2 * this.particleRadius;
    var offsetFromBucketEdge = this.particleRadius * 2;
    var numParticlesInLayer = Math.floor( usableWidth / ( this.particleRadius * 2 ) );
    var row = 0;
    var positionInLayer = 0;
    var found = false;
    while ( !found ) {
      var testLocation = new Vector2( this.position.x - this.size.width / 2 + offsetFromBucketEdge + positionInLayer * 2 * this.particleRadius,
                                      this.getYPositionForLayer( row ) );
      if ( this.isPositionOpen( testLocation ) ) {
        // We found a location that is open.
        openLocation = testLocation;
        found = true;
        continue;
      }
      else {
        positionInLayer++;
        if ( positionInLayer >= numParticlesInLayer ) {
          // Move to the next layer.
          row++;
          positionInLayer = 0;
          numParticlesInLayer--;
          offsetFromBucketEdge += this.particleRadius;
          if ( numParticlesInLayer == 0 ) {
            // This algorithm doesn't handle the situation where
            // more particles are added than can be stacked into
            // a pyramid of the needed size, but so far it hasn't
            // needed to.  If this requirement changes, the
            // algorithm will need to change too.
            numParticlesInLayer = 1;
            offsetFromBucketEdge -= this.particleRadius;
          }
        }
      }
    }
    return openLocation;
  }

  SphereBucket.prototype.isPositionOpen = function ( position ) {
    var positionOpen = true;
    _.each( this.particles, function ( particle ) {
      if ( particle.position.equals( position ) ) {
        positionOpen = false;
      }
    } );
    return positionOpen;
  }

  SphereBucket.prototype.getLayerForYPosition = function ( yPosition ) {
    return Math.abs( Math.round( ( yPosition - ( this.y + this.yOffset ) ) / ( this.particleRadius * 2 * 0.866 ) ) );
  }

  /*
   * Get the nearest open location to the provided current location.  This
   * is used for particle stacking.
   *
   * @param location
   * @return
   */
  SphereBucket.prototype.getNearestOpenLocation = function ( position ) {
    // Determine the highest occupied layer.  The bottom layer is 0.
    var highestOccupiedLayer = 0;
    var self = this;
    _.each( this.particles, function ( particle ) {
      var layer = self.getLayerForYPosition( particle.position.y );
      if ( layer > highestOccupiedLayer ) {
        highestOccupiedLayer = layer;
      }
    } );

    // Make a list of all open locations in the occupied layers.
    var openLocations = [];
    var placeableWidth = this.size.width - 2 * this.particleRadius;
    var offsetFromBucketEdge = ( this.size.width - placeableWidth ) / 2 + this.particleRadius;
    var numParticlesInLayer = Math.floor( placeableWidth / ( this.particleRadius * 2 ) );

    // Loop, searching for open positions in the particle stack.
    for ( var layer = 0; layer <= highestOccupiedLayer + 1; layer++ ) {

      // Add all open locations in the current layer.
      for ( var positionInLayer = 0; positionInLayer < numParticlesInLayer; positionInLayer++ ) {
        var testPosition = new Vector2( this.position.x - this.size.width / 2 + offsetFromBucketEdge + positionInLayer * 2 * this.particleRadius,
                                        this.getYPositionForLayer( layer ) );
        if ( this.isPositionOpen( testPosition ) ) {

          // We found a location that is unoccupied.
          if ( layer == 0 || this.countSupportingParticles( testPosition ) == 2 ) {
            // This is a valid open location.
            openLocations.push( testPosition );
          }
        }
      }

      // Adjust variables for the next layer.
      numParticlesInLayer--;
      offsetFromBucketEdge += this.particleRadius;
      if ( numParticlesInLayer == 0 ) {
        // If the stacking pyramid is full, meaning that there are
        // no locations that are open within it, this algorithm
        // classifies the locations directly above the top of the
        // pyramid as being open.  This would result in a stack
        // of particles with a pyramid base.  So far, this hasn't
        // been a problem, but this limitation may limit
        // reusability of this algorithm.
        numParticlesInLayer = 1;
        offsetFromBucketEdge -= this.particleRadius;
      }
    }

    // Find the closest open location to the provided current location.
    // Only the X-component is used for this determination, because if
    // the Y-component is used the particles often appear to fall sideways
    // when released above the bucket, which just looks weird.
    var closestOpenLocation = openLocations[0] || Vector2.ZERO;

    _.each( openLocations, function ( location ) {
      if ( location.distance( position ) < closestOpenLocation.distance( position ) ) {
        // This location is closer.
        closestOpenLocation = location;
      }
    } )
    return closestOpenLocation;
  }

  SphereBucket.prototype.getYPositionForLayer = function ( layer ) {
    return this.position.y + this.yOffset - layer * this.particleRadius * 2 * 0.866;
  }

  /*
   * Determine whether a particle is 'dangling', i.e. hanging above an open
   * space in the stack of particles.  Dangling particles should fall.
   */
  SphereBucket.prototype.isDangling = function ( particle ) {
    var onBottomRow = particle.position.y === this.position.y + this.yOffset;
    return !onBottomRow && this.countSupportingParticles( particle.position.x, particle.position.y ) < 2;
  }

  SphereBucket.prototype.countSupportingParticles = function ( position ) {
    var count = 0;
    for ( var i = 0; i < this.particles.length; i++ ) {
      p = this.particles[i];
      if ( p.position.y > position.y && //must be in a lower layer (and larger y is further down on the page).
           p.position.distance( position ) < this.particleRadius * 3 ) {
        // Must be a supporting particle.
        count++;
      }
    }
    return count;
  }

  SphereBucket.prototype.relayoutBucketParticles = function () {
    do {
      for ( var i = 0; i < this.particles.length; i++ ) {
        var particleMoved = false;
        var particle = this.particles[i];
        if ( this.isDangling( particle ) ) {
          particle.position = this.getNearestOpenLocation( particle.position );
          particleMoved = true;
          break;
        }
      }
    } while ( particleMoved );
  }

  return SphereBucket;
} );

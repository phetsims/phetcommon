// Copyright 2025, University of Colorado Boulder

/**
 * An interface for a container that holds particles, which are generally spherical objects that.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

export type ParticleContainer<T> = {

  // Add the specified particle to the container.  The 'skipLayout' option can be used to skip any updates to the
  // positions of other particles in the container.
  addParticle( particle: T, skipLayout?: boolean ): void;

  // Remove the specified particle from the container.
  removeParticle( particle: T ): void;

  // Test whether the provided particle is in the container.
  includes( particle: T ): boolean;
};
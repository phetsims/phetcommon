// Copyright 2013-2015, University of Colorado Boulder

/**
 * Class that defines the shape and common functionality for a 'bucket', which is a container into which some sort of
 * model objects may be placed.  This is a model object in the Model-View-Controller paradigm, and requires a
 * counterpart in the view in order to be presented to the user.
 *
 * In general, this is intended to be a base class, and subclasses should be used to add specific functionality, such as
 * how other model objects are added to and removed from the bucket.
 *
 * One other important note: The position of the bucket in model space is based on the center of the bucket's opening.
 *
 * @author John Blanco
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var Dimension2 = require( 'DOT/Dimension2' );
  var inherit = require( 'PHET_CORE/inherit' );
  var phetcommon = require( 'PHETCOMMON/phetcommon' );
  var PhetioObject = require( 'TANDEM/PhetioObject' );
  var Shape = require( 'KITE/Shape' );
  var Vector2 = require( 'DOT/Vector2' );

  // Proportion of the total height which the ellipse that represents the hole occupies.  It is assumed that the width
  // of the hole is the same as the width specified at construction.
  var HOLE_ELLIPSE_HEIGHT_PROPORTION = 0.25;

  /**
   * @param {Object} [options]
   * @constructor
   */
  function Bucket( options ) {
    options = _.extend( {
      position: Vector2.ZERO,
      size: new Dimension2( 200, 50 ),
      baseColor: '#ff0000',
      captionText: '',
      captionColor: 'white',

      // The following flag controls whether the bucket shape should be essentially upside down.  This allows it to be
      // used in cases where the model uses the inverted-y scheme commonly associated with screen layouts.
      invertY: false
    }, options );

    PhetioObject.call( this, options );

    // @public (read-only) - The position is defined to be where the center of the hole is.
    this.position = options.position;

    // @public (read-only) - Base color of the bucket.
    this.baseColor = options.baseColor;

    // @public (read-only) - Caption to be shown on the bucket.
    this.captionText = options.captionText;

    // @public (read-only) - Color for the caption.
    this.captionColor = options.captionColor;

    // @public (read-only) - The {Dimension2} size of the bucket
    this.size = options.size;
    var size = this.size;

    var holeRadiusX = size.width / 2;
    var holeRadiusY = size.height * HOLE_ELLIPSE_HEIGHT_PROPORTION / 2;

    // @public (read-only) - Create the shape of the bucket's hole.
    this.holeShape = Shape.ellipse( 0, 0, holeRadiusX, holeRadiusY );

    // Create the shape of the container.  This code is a bit 'tweaky', meaning that there are a lot of fractional
    // multipliers in here to try to achieve the desired pseudo-3D look.  The intent is that the 'tilt' of the bucket
    // can be changed without needing to rework this code.
    var containerHeight = size.height * ( 1 - ( HOLE_ELLIPSE_HEIGHT_PROPORTION / 2 ) );
    var multiplier = options.invertY ? 1 : -1;

    // @public (read-only) - The shape of the front portion of the bucket.
    this.containerShape = new Shape().moveTo( -size.width * 0.5, 0 )
      .lineTo( -size.width * 0.4, multiplier * containerHeight * 0.8 )
      .cubicCurveTo( -size.width * 0.3, multiplier * ( containerHeight * 0.8 + size.height * HOLE_ELLIPSE_HEIGHT_PROPORTION * 0.6 ),
        size.width * 0.3, multiplier * ( containerHeight * 0.8 + size.height * HOLE_ELLIPSE_HEIGHT_PROPORTION * 0.6 ),
        size.width * 0.4, multiplier * containerHeight * 0.8 )
      .lineTo( size.width * 0.5, 0 )
      // Does not go to the exact endpoints, so there will be small lines at the endpoints.
      // See https://github.com/phetsims/build-an-atom/issues/173
      .ellipticalArc( 0, 0, holeRadiusX, holeRadiusY, 0, -0.01 * Math.PI, -0.99 * Math.PI, !options.invertY )
      .close();
  }

  phetcommon.register( 'Bucket', Bucket );

  return inherit( PhetioObject, Bucket );
} );
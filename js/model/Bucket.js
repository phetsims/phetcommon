// Copyright 2002-2013, University of Colorado Boulder

/**
 * Class that defines the shape and common functionality for a 'bucket', which
 * is container into which some sort of model objects may be placed.  This is
 * a model object in the Model-View-Controller paradigm, and requires a
 * counterpart in the view in order to be presented to the user.
 * <p/>
 * In general, this is intended to be a base class, and subclasses should be
 * used to add specific functionality, such as how other model objects are
 * added to and removed from the bucket.
 * <p/>
 * One other important note: The position of the bucket in model space is
 * based on the center of the bucket's opening.
 *
 * @author John Blanco
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

define( function( require ) {
  'use strict';

  var Vector2 = require( 'DOT/Vector2' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var Shape = require( 'KITE/Shape' );

  // Proportion of the total height which the ellipse that represents
  // the hole occupies.  It is assumed that the width of the hole
  // is the same as the width specified at construction.
  var HOLE_ELLIPSE_HEIGHT_PROPORTION = 0.25;

  function Bucket( options ) {
    options = _.extend( {
      // defaults
      position: options.position || Vector2.ZERO,
      size: new Dimension2( options.width || 200, options.height || 50 ),
      baseColor: '#ff0000',
      caption: 'Set a caption!',
      captionColor: 'white'
    }, options );

    // The position is defined to be where the center of the hole is.
    this.position = options.position;

    // Base color of the bucket.
    this.baseColor = options.baseColor;

    // Caption to be shown on the bucket.
    this.captionText = options.caption;

    // Color for the caption.
    this.captionColor = options.captionColor;

    this.size = options.size;
    var size = this.size;

    var holeRadiusX = size.width / 2;
    var holeRadiusY = size.height * HOLE_ELLIPSE_HEIGHT_PROPORTION / 2;

    // Create the shape of the bucket's hole.
    this.holeShape = Shape.ellipse( 0, 0, holeRadiusX, holeRadiusY );

    // Create the shape of the container.  This code is a bit 'tweaky',
    // meaning that there are a lot of fractional multipliers in here
    // to try to achieve the desired pseudo-3D look.  The intent is
    // that the 'tilt' of the bucket can be changed without needing to
    // rework this code.
    var containerHeight = size.height * ( 1 - ( HOLE_ELLIPSE_HEIGHT_PROPORTION / 2 ) );
    this.containerShape = new Shape().moveTo( -size.width * 0.5, 0 )
                                     .lineTo( -size.width * 0.4, -containerHeight * 0.8 )
                                     .cubicCurveTo( -size.width * 0.3, -containerHeight * 0.8 - size.height * HOLE_ELLIPSE_HEIGHT_PROPORTION * 0.6,
                                                    size.width * 0.3,  -containerHeight * 0.8 - size.height * HOLE_ELLIPSE_HEIGHT_PROPORTION * 0.6,
                                                    size.width * 0.4,  -containerHeight * 0.8 )
                                     .lineTo( size.width * 0.5, 0 )
                                     .ellipticalArc( 0, 0, holeRadiusX, holeRadiusY, 0, 0, Math.PI, true )
                                     .close();
  }

  return Bucket;
} );

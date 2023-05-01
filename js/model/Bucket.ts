// Copyright 2013-2023, University of Colorado Boulder

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

import Dimension2 from '../../../dot/js/Dimension2.js';
import Vector2 from '../../../dot/js/Vector2.js';
import { Shape } from '../../../kite/js/imports.js';
import PhetioObject, { PhetioObjectOptions } from '../../../tandem/js/PhetioObject.js';
import phetcommon from '../phetcommon.js';
import optionize from '../../../phet-core/js/optionize.js';
import { TColor } from '../../../scenery/js/imports.js';

// Proportion of the total height which the ellipse that represents the hole occupies.  It is assumed that the width
// of the hole is the same as the width specified at construction.
const HOLE_ELLIPSE_HEIGHT_PROPORTION = 0.25;

type SelfOptions = {
  position?: Vector2;
  size?: Dimension2;
  baseColor?: TColor;
  captionText?: string;
  captionColor?: TColor;
  invertY?: boolean;
};
export type BucketOptions = PhetioObjectOptions & SelfOptions;

class Bucket extends PhetioObject {

  // The position is defined to be where the center of the hole is.
  public position: Vector2;

  // Base color of the bucket.
  public readonly baseColor: TColor | null;

  // Caption to be shown on the bucket.
  public readonly captionText: string;

  // Color for the caption.
  public readonly captionColor: TColor;

  // The size of the bucket.
  public readonly size: Dimension2;

  // Create the shape of the bucket's hole.
  public readonly holeShape: Shape;

  // The shape of the front portion of the bucket.
  public readonly containerShape: Shape;

  public constructor( providedOptions?: BucketOptions ) {

    const options = optionize<BucketOptions, SelfOptions, PhetioObjectOptions>()( {
      position: Vector2.ZERO,
      size: new Dimension2( 200, 50 ),
      baseColor: '#ff0000',
      captionText: '',
      captionColor: 'white',

      // The following flag controls whether the bucket shape should be essentially upside down.  This allows it to be
      // used in cases where the model uses the inverted-y scheme commonly associated with screen layouts.
      invertY: false
    }, providedOptions );

    super( options );

    this.position = options.position;
    this.baseColor = options.baseColor;
    this.captionText = options.captionText;
    this.captionColor = options.captionColor;
    this.size = options.size;
    const size = this.size;

    const holeRadiusX = size.width / 2;
    const holeRadiusY = size.height * HOLE_ELLIPSE_HEIGHT_PROPORTION / 2;

    this.holeShape = Shape.ellipse( 0, 0, holeRadiusX, holeRadiusY, 0 );

    // Create the shape of the container.  This code is a bit 'tweaky', meaning that there are a lot of fractional
    // multipliers in here to try to achieve the desired pseudo-3D look.  The intent is that the 'tilt' of the bucket
    // can be changed without needing to rework this code.
    const containerHeight = size.height * ( 1 - ( HOLE_ELLIPSE_HEIGHT_PROPORTION / 2 ) );
    const multiplier = options.invertY ? 1 : -1;

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
}

phetcommon.register( 'Bucket', Bucket );
export default Bucket;
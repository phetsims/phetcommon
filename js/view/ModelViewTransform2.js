// Copyright 2013-2015, University of Colorado Boulder

/**
 * Transform between model and view coordinate frames,
 * and provides convenience methods over an actual dot.Transform3
 *
 * Requires that the transform is "aligned", i.e., it can be built only from component-wise translation and scaling.
 * Equivalently, the output x coordinate should not depend on the input y, and the output y shouldn't depend on the
 * input x.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Matrix3 = require( 'DOT/Matrix3' );
  var phetcommon = require( 'PHETCOMMON/phetcommon' );
  var Transform3 = require( 'DOT/Transform3' );
  var Vector2 = require( 'DOT/Vector2' );

  /**
   * @param matrix
   * @constructor
   */
  function ModelViewTransform2( matrix ) {
    Transform3.call( this, matrix );
  }

  phetcommon.register( 'ModelViewTransform2', ModelViewTransform2 );

  inherit( Transform3, ModelViewTransform2, {

    // @public convenience model => view
    modelToViewPosition: function( point ) { return this.transformPosition2( point ); },
    modelToViewXY: function( x, y ) { return new Vector2( this.modelToViewX( x ), this.modelToViewY( y ) ); },
    modelToViewX: function( x ) { return this.matrix.m00() * x + this.matrix.m02();},
    modelToViewY: function( y ) { return this.matrix.m11() * y + this.matrix.m12();},
    modelToViewDelta: function( vector ) { return this.transformDelta2( vector ); },
    modelToViewNormal: function( normal ) { return this.transformNormal2( normal ); },
    modelToViewDeltaX: function( x ) { return this.transformDeltaX( x ); },
    modelToViewDeltaY: function( y ) { return this.transformDeltaY( y ); },
    modelToViewBounds: function( bounds ) { return this.transformBounds2( bounds ); },
    modelToViewShape: function( shape ) { return this.transformShape( shape ); },
    modelToViewRay: function( ray ) { return this.transformRay2( ray ); },

    // @public convenience view => model
    viewToModelPosition: function( point ) { return this.inversePosition2( point ); },
    viewToModelXY: function( x, y ) { return new Vector2( this.viewToModelX( x ), this.viewToModelY( y ) ); },
    viewToModelX: function( x ) {
      var inverse = this.getInverse();
      return inverse.m00() * x + inverse.m02();
    },
    viewToModelY: function( y ) {
      var inverse = this.getInverse();
      return inverse.m11() * y + inverse.m12();
    },
    viewToModelDelta: function( vector ) { return this.inverseDelta2( vector ); },
    viewToModelDeltaXY: function( x, y ) { return new Vector2( this.viewToModelDeltaX( x ), this.viewToModelDeltaY( y ) ); },
    viewToModelNormal: function( normal ) { return this.inverseNormal2( normal ); },
    viewToModelDeltaX: function( x ) { return this.inverseDeltaX( x ); },
    viewToModelDeltaY: function( y ) { return this.inverseDeltaY( y ); },
    viewToModelBounds: function( bounds ) { return this.inverseBounds2( bounds ); },
    viewToModelShape: function( shape ) { return this.inverseShape( shape ); },
    viewToModelRay: function( ray ) { return this.inverseRay2( ray ); },

    // @public @overrides Transform3.invalidate
    invalidate: function() {
      assert && assert( this.matrix.isAligned(),
        'Our current ModelViewTransform2 implementation will not work with arbitrary rotations.' );

      Transform3.prototype.invalidate.call( this );
    }
  } );

  /*---------------------------------------------------------------------------*
   * Factory methods
   *----------------------------------------------------------------------------*/

  /**
   * Creates a ModelViewTransform that uses the identity transform (i.e. model coordinates are the same as view coordinates)
   * @returns {ModelViewTransform2}
   * @public
   */
  ModelViewTransform2.createIdentity = function() {
    return new ModelViewTransform2( Matrix3.IDENTITY );
  };

  /**
   * Creates a ModelViewTransform that has the specified scale and offset such that
   * view = model * scale + offset
   *
   * @param offset {Vector2} the offset in view coordinates
   * @param scale  {number} the scale to map model to view
   * @returns {ModelViewTransform2}
   * @public
   */
  ModelViewTransform2.createOffsetScaleMapping = function( offset, scale ) {
    return new ModelViewTransform2( Matrix3.affine( scale, 0, offset.x, 0, scale, offset.y ) );
  };

  /**
   * Creates a shearless ModelViewTransform that has the specified scale and offset such that
   * view.x = model.x * xScale + offset.x
   * view.y = model.y * yScale + offset.y
   *
   * @param offset {Vector2} the offset in view coordinates
   * @param xScale {number} the scale to map model to view in the x-dimension
   * @param yScale {number} the scale to map model to view in the y-dimension
   * @returns {ModelViewTransform2}
   * @public
   */
  ModelViewTransform2.createOffsetXYScaleMapping = function( offset, xScale, yScale ) {
    return new ModelViewTransform2( Matrix3.affine( xScale, 0, offset.x, 0, yScale, offset.y ) );
  };

  /**
   * Creates a shearless ModelViewTransform that maps the specified model point to the specified view point, with the given x and y scales.
   *
   * @param modelPoint {Vector2} the reference point in the model which maps to the specified view point
   * @param viewPoint  {Vector2} the reference point in the view
   * @param xScale     {number} the amount to scale in the x direction
   * @param yScale     {number} the amount to scale in the y direction
   * @returns {ModelViewTransform2}
   * @public
   */
  ModelViewTransform2.createSinglePointXYScaleMapping = function( modelPoint, viewPoint, xScale, yScale ) {
    // mx * scale + ox = vx
    // my * scale + oy = vy
    var offsetX = viewPoint.x - modelPoint.x * xScale;
    var offsetY = viewPoint.y - modelPoint.y * yScale;
    return this.createOffsetXYScaleMapping( new Vector2( offsetX, offsetY ), xScale, yScale );
  };

  /**
   * Creates a shearless ModelViewTransform that maps the specified model point to the specified view point, with the given scale factor for both x and y dimensions.
   *
   * @param modelPoint {Vector2} the reference point in the model which maps to the specified view point
   * @param viewPoint  {Vector2} the reference point in the view
   * @param scale      {number} the amount to scale in the x and y directions
   * @returns {ModelViewTransform2}
   * @public
   */
  ModelViewTransform2.createSinglePointScaleMapping = function( modelPoint, viewPoint, scale ) {
    return this.createSinglePointXYScaleMapping( modelPoint, viewPoint, scale, scale );
  };

  /**
   * Creates a shearless ModelViewTransform that maps the specified model point to the specified view point, with the given scale factor for both x and y dimensions,
   * but inverting the y axis so that +y in the model corresponds to -y in the view.
   * Inverting the y axis is commonly necessary since +y is usually up in textbooks and -y is down in pixel coordinates.
   *
   * @param modelPoint {Vector2} the reference point in the model which maps to the specified view point
   * @param viewPoint  {Vector2} the reference point in the view
   * @param scale      {number} the amount to scale in the x and y directions
   * @returns {ModelViewTransform2}
   * @public
   */
  ModelViewTransform2.createSinglePointScaleInvertedYMapping = function( modelPoint, viewPoint, scale ) {
    return this.createSinglePointXYScaleMapping( modelPoint, viewPoint, scale, -scale );
  };

  /**
   * Creates a shearless ModelViewTransform that maps the specified rectangle in the model to the specified rectangle in the view,
   * so that any point x% of the way across and y% down in the model rectangle will be mapped to the corresponding point x% across and y% down in the view rectangle.
   * Linear extrapolation is performed outside of the rectangle bounds.
   *
   * @param modelBounds {Bounds2} the reference rectangle in the model, must have area > 0
   * @param viewBounds  {Bounds2} the reference rectangle in the view, must have area > 0
   * @returns {ModelViewTransform2}
   * @public
   */
  ModelViewTransform2.createRectangleMapping = function( modelBounds, viewBounds ) {
    var m00 = viewBounds.width / modelBounds.width;
    var m02 = viewBounds.x - m00 * modelBounds.x;
    var m11 = viewBounds.height / modelBounds.height;
    var m12 = viewBounds.y - m11 * modelBounds.y;
    return new ModelViewTransform2( Matrix3.affine( m00, 0, m02, 0, m11, m12 ) );
  };

  /**
   * Creates a shearless ModelViewTransform that maps the specified rectangle in the model to the specified rectangle in the view,
   * so that any point x% of the way across and y% down in the model rectangle will be mapped to the corresponding point x% across and (100-y)% down in the view rectangle.
   * Linear extrapolation is performed outside of the rectangle bounds.
   * Inverting the y axis is commonly necessary since +y is usually up in textbooks and -y is down in pixel coordinates.
   *
   * @param modelBounds {Bounds2} the reference rectangle in the model, must have area > 0
   * @param viewBounds  {Bounds2} the reference rectangle in the view, must have area > 0
   * @returns {ModelViewTransform2}
   * @public
   */
  ModelViewTransform2.createRectangleInvertedYMapping = function( modelBounds, viewBounds ) {
    var m00 = viewBounds.width / modelBounds.width;
    var m02 = viewBounds.x - m00 * modelBounds.x;
    var m11 = -viewBounds.height / modelBounds.height;
    // vY == (mY + mHeight) * m11 + m12
    var m12 = viewBounds.y - m11 * modelBounds.getMaxY();
    return new ModelViewTransform2( Matrix3.affine( m00, 0, m02, 0, m11, m12 ) );
  };

  return ModelViewTransform2;
} );

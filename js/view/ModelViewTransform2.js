// Copyright 2013-2020, University of Colorado Boulder

/**
 * Transform between model and view coordinate frames, and provides convenience methods beyond dot.Transform3
 *
 * Requires that the transform is "aligned", i.e., it can be built only from component-wise translation and scaling.
 * Equivalently, the output x coordinate should not depend on the input y, and the output y shouldn't depend on the
 * input x.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Matrix3 from '../../../dot/js/Matrix3.js';
import Transform3 from '../../../dot/js/Transform3.js';
import Vector2 from '../../../dot/js/Vector2.js';
import phetcommon from '../phetcommon.js';

class ModelViewTransform2 extends Transform3 {

  // @public convenience model => view
  modelToViewPosition( point ) { return this.transformPosition2( point ); }

  modelToViewXY( x, y ) { return new Vector2( this.modelToViewX( x ), this.modelToViewY( y ) ); }

  modelToViewX( x ) { return this.matrix.m00() * x + this.matrix.m02();}

  modelToViewY( y ) { return this.matrix.m11() * y + this.matrix.m12();}

  modelToViewDelta( vector ) { return this.transformDelta2( vector ); }

  modelToViewNormal( normal ) { return this.transformNormal2( normal ); }

  modelToViewDeltaX( x ) { return this.transformDeltaX( x ); }

  modelToViewDeltaY( y ) { return this.transformDeltaY( y ); }

  modelToViewBounds( bounds ) { return this.transformBounds2( bounds ); }

  modelToViewShape( shape ) { return this.transformShape( shape ); }

  modelToViewRay( ray ) { return this.transformRay2( ray ); }

  // @public convenience view => model
  viewToModelPosition( point ) { return this.inversePosition2( point ); }

  viewToModelXY( x, y ) { return new Vector2( this.viewToModelX( x ), this.viewToModelY( y ) ); }

  viewToModelX( x ) {
    const inverse = this.getInverse();
    return inverse.m00() * x + inverse.m02();
  }

  viewToModelY( y ) {
    const inverse = this.getInverse();
    return inverse.m11() * y + inverse.m12();
  }

  viewToModelDelta( vector ) { return this.inverseDelta2( vector ); }

  viewToModelDeltaXY( x, y ) { return new Vector2( this.viewToModelDeltaX( x ), this.viewToModelDeltaY( y ) ); }

  viewToModelNormal( normal ) { return this.inverseNormal2( normal ); }

  viewToModelDeltaX( x ) { return this.inverseDeltaX( x ); }

  viewToModelDeltaY( y ) { return this.inverseDeltaY( y ); }

  viewToModelBounds( bounds ) { return this.inverseBounds2( bounds ); }

  viewToModelShape( shape ) { return this.inverseShape( shape ); }

  viewToModelRay( ray ) { return this.inverseRay2( ray ); }

  // @overrides ModelViewTransform2 does not support arbitrary rotations.
  validateMatrix( matrix ) {
    super.validateMatrix( matrix );
    assert && assert( matrix.isAligned(), 'matrix must be aligned' );
  }

  /*---------------------------------------------------------------------------*
   * Mutators.  Like its parent class, ModelViewTransform2 is mutable, and
   * sends out notifications when changed.
   *----------------------------------------------------------------------------*/

  /**
   * See ModelViewTransform2.createRectangleMapping
   * @param {Bounds2} modelBounds
   * @param {Bounds2} viewBounds
   * @public
   */
  setToRectangleMapping( modelBounds, viewBounds ) {
    const m00 = viewBounds.width / modelBounds.width;
    const m02 = viewBounds.x - m00 * modelBounds.x;
    const m11 = viewBounds.height / modelBounds.height;
    const m12 = viewBounds.y - m11 * modelBounds.y;
    this.setMatrix( Matrix3.affine( m00, 0, m02, 0, m11, m12 ) );
    return this; // for chaining
  }

  /**
   * See ModelViewTransform2.createRectangleInvertedYMapping
   * @param {Bounds2} modelBounds
   * @param {Bounds2} viewBounds
   * @public
   */
  setToRectangleInvertedYMapping( modelBounds, viewBounds ) {
    const m00 = viewBounds.width / modelBounds.width;
    const m02 = viewBounds.x - m00 * modelBounds.x;
    const m11 = -viewBounds.height / modelBounds.height;

    // vY == (mY + mHeight) * m11 + m12
    const m12 = viewBounds.y - m11 * modelBounds.getMaxY();
    this.setMatrix( Matrix3.affine( m00, 0, m02, 0, m11, m12 ) );
    return this; // for chaining
  }

  /*---------------------------------------------------------------------------*
   * Factory methods
   *----------------------------------------------------------------------------*/

  /**
   * Creates a ModelViewTransform2 that uses the identity transform (i.e. model coordinates are the same as view coordinates)
   * @returns {ModelViewTransform2}
   * @public
   */
  static createIdentity() {
    return new ModelViewTransform2( Matrix3.IDENTITY );
  }

  /**
   * Creates a ModelViewTransform2 that has the specified scale and offset such that
   * view = model * scale + offset
   *
   * @param offset {Vector2} the offset in view coordinates
   * @param scale  {number} the scale to map model to view
   * @returns {ModelViewTransform2}
   * @public
   */
  static createOffsetScaleMapping( offset, scale ) {
    return new ModelViewTransform2( Matrix3.affine( scale, 0, offset.x, 0, scale, offset.y ) );
  }

  /**
   * Creates a shearless ModelViewTransform2 that has the specified scale and offset such that
   * view.x = model.x * xScale + offset.x
   * view.y = model.y * yScale + offset.y
   *
   * @param offset {Vector2} the offset in view coordinates
   * @param xScale {number} the scale to map model to view in the x-dimension
   * @param yScale {number} the scale to map model to view in the y-dimension
   * @returns {ModelViewTransform2}
   * @public
   */
  static createOffsetXYScaleMapping( offset, xScale, yScale ) {
    return new ModelViewTransform2( Matrix3.affine( xScale, 0, offset.x, 0, yScale, offset.y ) );
  }

  /**
   * Creates a shearless ModelViewTransform2 that maps the specified model point to the specified view point, with the given x and y scales.
   *
   * @param modelPoint {Vector2} the reference point in the model which maps to the specified view point
   * @param viewPoint  {Vector2} the reference point in the view
   * @param xScale     {number} the amount to scale in the x direction
   * @param yScale     {number} the amount to scale in the y direction
   * @returns {ModelViewTransform2}
   * @public
   */
  static createSinglePointXYScaleMapping( modelPoint, viewPoint, xScale, yScale ) {

    // mx * scale + ox = vx
    // my * scale + oy = vy
    const offsetX = viewPoint.x - modelPoint.x * xScale;
    const offsetY = viewPoint.y - modelPoint.y * yScale;
    return ModelViewTransform2.createOffsetXYScaleMapping( new Vector2( offsetX, offsetY ), xScale, yScale );
  }

  /**
   * Creates a shearless ModelViewTransform2 that maps the specified model point to the specified view point, with the given scale factor for both x and y dimensions.
   *
   * @param modelPoint {Vector2} the reference point in the model which maps to the specified view point
   * @param viewPoint  {Vector2} the reference point in the view
   * @param scale      {number} the amount to scale in the x and y directions
   * @returns {ModelViewTransform2}
   * @public
   */
  static createSinglePointScaleMapping( modelPoint, viewPoint, scale ) {
    return ModelViewTransform2.createSinglePointXYScaleMapping( modelPoint, viewPoint, scale, scale );
  }

  /**
   * Creates a shearless ModelViewTransform2 that maps the specified model point to the specified view point, with the given scale factor for both x and y dimensions,
   * but inverting the y axis so that +y in the model corresponds to -y in the view.
   * Inverting the y axis is commonly necessary since +y is usually up in textbooks and -y is down in pixel coordinates.
   *
   * @param modelPoint {Vector2} the reference point in the model which maps to the specified view point
   * @param viewPoint  {Vector2} the reference point in the view
   * @param scale      {number} the amount to scale in the x and y directions
   * @returns {ModelViewTransform2}
   * @public
   */
  static createSinglePointScaleInvertedYMapping( modelPoint, viewPoint, scale ) {
    return ModelViewTransform2.createSinglePointXYScaleMapping( modelPoint, viewPoint, scale, -scale );
  }

  /**
   * Creates a shearless ModelViewTransform2 that maps the specified rectangle in the model to the specified rectangle in the view,
   * so that any point x% of the way across and y% down in the model rectangle will be mapped to the corresponding point x% across and y% down in the view rectangle.
   * Linear extrapolation is performed outside of the rectangle bounds.
   *
   * @param modelBounds {Bounds2} the reference rectangle in the model, must have area > 0
   * @param viewBounds  {Bounds2} the reference rectangle in the view, must have area > 0
   * @returns {ModelViewTransform2}
   * @public
   */
  static createRectangleMapping( modelBounds, viewBounds ) {
    return new ModelViewTransform2().setToRectangleMapping( modelBounds, viewBounds );
  }

  /**
   * Creates a shearless ModelViewTransform2 that maps the specified rectangle in the model to the specified rectangle in the view,
   * so that any point x% of the way across and y% down in the model rectangle will be mapped to the corresponding point x% across and (100-y)% down in the view rectangle.
   * Linear extrapolation is performed outside of the rectangle bounds.
   * Inverting the y axis is commonly necessary since +y is usually up in textbooks and -y is down in pixel coordinates.
   *
   * @param modelBounds {Bounds2} the reference rectangle in the model, must have area > 0
   * @param viewBounds  {Bounds2} the reference rectangle in the view, must have area > 0
   * @returns {ModelViewTransform2}
   * @public
   */
  static createRectangleInvertedYMapping( modelBounds, viewBounds ) {
    return new ModelViewTransform2().setToRectangleInvertedYMapping( modelBounds, viewBounds );
  }
}

phetcommon.register( 'ModelViewTransform2', ModelViewTransform2 );
export default ModelViewTransform2;
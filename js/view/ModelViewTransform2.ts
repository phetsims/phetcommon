// Copyright 2013-2023, University of Colorado Boulder

/**
 * Transform between model and view coordinate frames, and provides convenience methods beyond phet.dot.Transform3
 *
 * Requires that the transform is "aligned", i.e., it can be built only from component-wise translation and scaling.
 * Equivalently, the output x coordinate should not depend on the input y, and the output y shouldn't depend on the
 * input x.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Bounds2 from '../../../dot/js/Bounds2.js';
import Matrix3 from '../../../dot/js/Matrix3.js';
import Ray2 from '../../../dot/js/Ray2.js';
import Transform3 from '../../../dot/js/Transform3.js';
import Vector2 from '../../../dot/js/Vector2.js';
import { Shape } from '../../../kite/js/imports.js';
import phetcommon from '../phetcommon.js';

class ModelViewTransform2 extends Transform3 {

  //-------------------------------------------------------------------------------------------------------------
  //  convenience model => view
  //-------------------------------------------------------------------------------------------------------------

  public modelToViewPosition( point: Vector2 ): Vector2 {
    return this.transformPosition2( point );
  }

  public modelToViewXY( x: number, y: number ): Vector2 {
    return new Vector2( this.modelToViewX( x ), this.modelToViewY( y ) );
  }

  public modelToViewX( x: number ): number {
    return this.matrix.m00() * x + this.matrix.m02();
  }

  public modelToViewY( y: number ): number {
    return this.matrix.m11() * y + this.matrix.m12();
  }

  public modelToViewDelta( vector: Vector2 ): Vector2 {
    return this.transformDelta2( vector );
  }

  public modelToViewNormal( normal: Vector2 ): Vector2 {
    return this.transformNormal2( normal );
  }

  public modelToViewDeltaX( x: number ): number {
    return this.transformDeltaX( x );
  }

  public modelToViewDeltaY( y: number ): number {
    return this.transformDeltaY( y );
  }

  public modelToViewBounds( bounds: Bounds2 ): Bounds2 {
    return this.transformBounds2( bounds );
  }

  public modelToViewShape( shape: Shape ): Shape {
    return this.transformShape( shape );
  }

  public modelToViewRay( ray: Ray2 ): Ray2 {
    return this.transformRay2( ray );
  }

  //-------------------------------------------------------------------------------------------------------------
  //  convenience view => model
  //-------------------------------------------------------------------------------------------------------------

  public viewToModelPosition( point: Vector2 ): Vector2 {
    return this.inversePosition2( point );
  }

  public viewToModelXY( x: number, y: number ): Vector2 {
    return new Vector2( this.viewToModelX( x ), this.viewToModelY( y ) );
  }

  public viewToModelX( x: number ): number {
    const inverse = this.getInverse();
    return inverse.m00() * x + inverse.m02();
  }

  public viewToModelY( y: number ): number {
    const inverse = this.getInverse();
    return inverse.m11() * y + inverse.m12();
  }

  public viewToModelDelta( vector: Vector2 ): Vector2 {
    return this.inverseDelta2( vector );
  }

  public viewToModelDeltaXY( x: number, y: number ): Vector2 {
    return new Vector2( this.viewToModelDeltaX( x ), this.viewToModelDeltaY( y ) );
  }

  public viewToModelNormal( normal: Vector2 ): Vector2 {
    return this.inverseNormal2( normal );
  }

  public viewToModelDeltaX( x: number ): number {
    return this.inverseDeltaX( x );
  }

  public viewToModelDeltaY( y: number ): number {
    return this.inverseDeltaY( y );
  }

  public viewToModelBounds( bounds: Bounds2 ): Bounds2 {
    return this.inverseBounds2( bounds );
  }

  public viewToModelShape( shape: Shape ): Shape {
    return this.inverseShape( shape );
  }

  public viewToModelRay( ray: Ray2 ): Ray2 {
    return this.inverseRay2( ray );
  }


  protected override validateMatrix( matrix: Matrix3 ): void {
    super.validateMatrix( matrix );
    assert && assert( matrix.isAligned(), 'matrix must be aligned, ModelViewTransform2 does not support arbitrary rotations' );
  }

  //-------------------------------------------------------------------------------------------------------------
  // Mutators.  Like its parent class, ModelViewTransform2 is mutable, and sends out notifications when changed.
  //-------------------------------------------------------------------------------------------------------------

  /**
   * See ModelViewTransform2.createRectangleMapping
   */
  public setToRectangleMapping( modelBounds: Bounds2, viewBounds: Bounds2 ): this {
    const m00 = viewBounds.width / modelBounds.width;
    const m02 = viewBounds.x - m00 * modelBounds.x;
    const m11 = viewBounds.height / modelBounds.height;
    const m12 = viewBounds.y - m11 * modelBounds.y;
    this.setMatrix( Matrix3.affine( m00, 0, m02, 0, m11, m12 ) );
    return this; // for chaining
  }

  /**
   * See ModelViewTransform2.createRectangleInvertedYMapping
   */
  public setToRectangleInvertedYMapping( modelBounds: Bounds2, viewBounds: Bounds2 ): this {
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
   */
  public static createIdentity(): ModelViewTransform2 {
    return new ModelViewTransform2( Matrix3.IDENTITY );
  }

  /**
   * Creates a ModelViewTransform2 that has the specified scale and offset such that
   * view = model * scale + offset
   *
   * @param offset - the offset in view coordinates
   * @param scale - the scale to map model to view
   */
  public static createOffsetScaleMapping( offset: Vector2, scale: number ): ModelViewTransform2 {
    return new ModelViewTransform2( Matrix3.affine( scale, 0, offset.x, 0, scale, offset.y ) );
  }

  /**
   * Creates a shearless ModelViewTransform2 that has the specified scale and offset such that
   * view.x = model.x * xScale + offset.x
   * view.y = model.y * yScale + offset.y
   *
   * @param offset - the offset in view coordinates
   * @param xScale - the scale to map model to view in the x-dimension
   * @param yScale - the scale to map model to view in the y-dimension
   */
  public static createOffsetXYScaleMapping( offset: Vector2, xScale: number, yScale: number ): ModelViewTransform2 {
    return new ModelViewTransform2( Matrix3.affine( xScale, 0, offset.x, 0, yScale, offset.y ) );
  }

  /**
   * Creates a shearless ModelViewTransform2 that maps the specified model point to the specified view point,
   * with the given x and y scales.
   *
   * @param modelPoint - the reference point in the model which maps to the specified view point
   * @param viewPoint - the reference point in the view
   * @param xScale - the amount to scale in the x direction
   * @param yScale - the amount to scale in the y direction
   */
  public static createSinglePointXYScaleMapping(
    modelPoint: Vector2, viewPoint: Vector2, xScale: number, yScale: number ): ModelViewTransform2 {

    // mx * scale + ox = vx
    // my * scale + oy = vy
    const offsetX = viewPoint.x - modelPoint.x * xScale;
    const offsetY = viewPoint.y - modelPoint.y * yScale;
    return ModelViewTransform2.createOffsetXYScaleMapping( new Vector2( offsetX, offsetY ), xScale, yScale );
  }

  /**
   * Creates a shearless ModelViewTransform2 that maps the specified model point to the specified view point,
   * with the given scale factor for both x and y dimensions.
   *
   * @param modelPoint - the reference point in the model which maps to the specified view point
   * @param viewPoint - the reference point in the view
   * @param scale - the amount to scale in the x and y directions
   */
  public static createSinglePointScaleMapping(
    modelPoint: Vector2, viewPoint: Vector2, scale: number ): ModelViewTransform2 {
    return ModelViewTransform2.createSinglePointXYScaleMapping( modelPoint, viewPoint, scale, scale );
  }

  /**
   * Creates a shearless ModelViewTransform2 that maps the specified model point to the specified view point,
   * with the given scale factor for both x and y dimensions, but inverting the y axis so that +y in the model
   * corresponds to -y in the view. Inverting the y axis is commonly necessary since +y is usually up in textbooks
   * and -y is down in pixel coordinates.
   *
   * @param modelPoint - the reference point in the model which maps to the specified view point
   * @param viewPoint - the reference point in the view
   * @param scale - the amount to scale in the x and y directions
   */
  public static createSinglePointScaleInvertedYMapping(
    modelPoint: Vector2, viewPoint: Vector2, scale: number ): ModelViewTransform2 {
    return ModelViewTransform2.createSinglePointXYScaleMapping( modelPoint, viewPoint, scale, -scale );
  }

  /**
   * Creates a shearless ModelViewTransform2 that maps the specified rectangle in the model to the specified rectangle
   * in the view, so that any point x% of the way across and y% down in the model rectangle will be mapped to the
   * corresponding point x% across and y% down in the view rectangle. Linear extrapolation is performed outside of
   * the rectangle bounds.
   *
   * @param modelBounds - the reference rectangle in the model, must have area > 0
   * @param viewBounds - the reference rectangle in the view, must have area > 0
   */
  public static createRectangleMapping( modelBounds: Bounds2, viewBounds: Bounds2 ): ModelViewTransform2 {
    return new ModelViewTransform2().setToRectangleMapping( modelBounds, viewBounds );
  }

  /**
   * Creates a shearless ModelViewTransform2 that maps the specified rectangle in the model to the specified rectangle
   * in the view, so that any point x% of the way across and y% down in the model rectangle will be mapped to the
   * corresponding point x% across and (100-y)% down in the view rectangle. Linear extrapolation is performed outside
   * of the rectangle bounds. Inverting the y axis is commonly necessary since +y is usually up in textbooks and -y
   * is down in pixel coordinates.
   *
   * @param modelBounds - the reference rectangle in the model, must have area > 0
   * @param viewBounds - the reference rectangle in the view, must have area > 0
   */
  public static createRectangleInvertedYMapping( modelBounds: Bounds2, viewBounds: Bounds2 ): ModelViewTransform2 {
    return new ModelViewTransform2().setToRectangleInvertedYMapping( modelBounds, viewBounds );
  }
}

phetcommon.register( 'ModelViewTransform2', ModelViewTransform2 );
export default ModelViewTransform2;
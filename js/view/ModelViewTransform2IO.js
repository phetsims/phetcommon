// Copyright 2019-2020, University of Colorado Boulder

/**
 * IO type for ModelViewTransform2
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import validate from '../../../axon/js/validate.js';
import Matrix3IO from '../../../dot/js/Matrix3IO.js';
import ObjectIO from '../../../tandem/js/types/ObjectIO.js';
import phetcommon from '../phetcommon.js';
import ModelViewTransform2 from './ModelViewTransform2.js';

class ModelViewTransform2IO extends ObjectIO {

  /**
   * Encodes a ModelViewTransform2 instance to a state.
   * @param {ModelViewTransform2} modelViewTransform2
   * @returns {Object}
   */
  static toStateObject( modelViewTransform2 ) {
    validate( modelViewTransform2, this.validator );
    return {
      matrix: Matrix3IO.toStateObject( modelViewTransform2.matrix )
    };
  }

  /**
   * Decodes a state into a ModelViewTransform2.
   * @param {Object} stateObject
   * @returns {ModelViewTransform2}
   */
  static fromStateObject( stateObject ) {
    const matrix = Matrix3IO.fromStateObject( stateObject.matrix );
    return new ModelViewTransform2( matrix );
  }
}

ModelViewTransform2IO.documentation = 'Object type that supports 2 dimensional coordinate tranforms.';
ModelViewTransform2IO.validator = { valueType: ModelViewTransform2 };
ModelViewTransform2IO.typeName = 'ModelViewTransform2IO';
ObjectIO.validateSubtype( ModelViewTransform2IO );

phetcommon.register( 'ModelViewTransform2IO', ModelViewTransform2IO );
export default ModelViewTransform2IO;
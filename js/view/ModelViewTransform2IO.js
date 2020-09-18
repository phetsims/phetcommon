// Copyright 2019-2020, University of Colorado Boulder

/**
 * IO Type for ModelViewTransform2
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Matrix3IO from '../../../dot/js/Matrix3IO.js';
import IOType from '../../../tandem/js/types/IOType.js';
import phetcommon from '../phetcommon.js';
import ModelViewTransform2 from './ModelViewTransform2.js';

const ModelViewTransform2IO = new IOType( 'ModelViewTransform2IO', {
  valueType: ModelViewTransform2,
  documentation: 'Object type that supports 2 dimensional coordinate transforms.',
  toStateObject: modelViewTransform2 => ( { matrix: Matrix3IO.toStateObject( modelViewTransform2.matrix ) } ),
  fromStateObject: stateObject => new ModelViewTransform2( Matrix3IO.fromStateObject( stateObject.matrix ) )
} );

phetcommon.register( 'ModelViewTransform2IO', ModelViewTransform2IO );
export default ModelViewTransform2IO;
import React from 'react';
import './FaceRecognition.css';

const FaceRecognition = ({imageUrl, box}) => {
  return (
    <div className='flex-center ma'>
      <div className='flex-center absolute mt2'>
        <img id='inputImage' alt='' src={imageUrl} />
        <div
          className='bounding-box'
          style={{top: box.topRow, right: box.right, bottom: box.bottomRow, left: box.left}}
        >
        </div>
      </div>
    </div>
  );
}

export default FaceRecognition;

import React from 'react'
import { useParams } from 'react-router-dom';

const CityDetails = () => {
 const { cityCode } = useParams();

  return (
    <div className="page-content">
      City Details {cityCode}
      <div>Work In progress (Comming Soon)</div> 
    </div>
  )
}

export default CityDetails
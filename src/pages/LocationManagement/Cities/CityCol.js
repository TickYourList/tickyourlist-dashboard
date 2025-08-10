import React from 'react';

const CityImage = (cell) => {
    return (
        <img className='img-fluid' src={cell.value ? cell.value : ''} alt="City Image" style={{ minWidth: "120px", minHeight: "90px", width: "160px", height: "110px" }}/>
    );
};

const CityCode = (cell) => {
    return cell.value ? cell.value : '';
};

const DisplayName = (cell) => {
    return cell.value ? cell.value : '';
};

const Tours = (cell) => {
    return cell.value ? cell.value : '';
};

const Country = (cell) => {
    return cell.value ? cell.value : '';
};

export {
    Country, DisplayName, CityCode, CityImage, Tours,
};
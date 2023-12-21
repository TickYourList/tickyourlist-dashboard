import React from 'react';
import { Link } from 'react-router-dom';
import * as moment from "moment";
import { Badge } from 'reactstrap';

const CustomerId = (cell) => {
    return (
        <Link to="#" className="text-body fw-bold">{cell.value ? cell.value : ''}</Link>
    );
};

const CustomerName = (cell) => {
    return cell.value ? cell.value : '';
};

const CarBrand = (cell) => {
    return cell.value ? cell.value : '';
};

const CarModel = (cell) => {
    return cell.value ? cell.value : '';
};

const Status = (cell) => {
    return cell.value ? <Badge className="bg-success font-size-10">Active</Badge> : <Badge className="bg-warning font-size-10">InActive</Badge>;
};

const ConnectionDate = (cell) => {
    if (!cell.value) {
        return "";
    }

    const date = new Date(cell.value);

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed in JS
    const day = date.getDate().toString().padStart(2, '0');

    const dateOnlyString = `${day}-${month}-${year}`;
    return dateOnlyString;
};


export {
    CustomerId,
    CustomerName,
    CarBrand,
    CarModel,
    Status,
    ConnectionDate
};
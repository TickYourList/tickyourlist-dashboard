import React from 'react';
import { Link } from 'react-router-dom';
import * as moment from "moment";
import { Badge } from 'reactstrap';

const BlogId = (cell) => {
    return (
        <Link to="#" className="text-body fw-bold">{cell.value ? cell.value : ''}</Link>
    );
};

const BlogName = (cell) => {
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

export {
    BlogId,
    BlogName,
    CarBrand,
    CarModel,
    Status
};
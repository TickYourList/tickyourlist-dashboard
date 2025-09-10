import React from 'react'
import { Link } from 'react-router-dom';
import { Alert } from "reactstrap";
const PermissionDenied = () => {

  return (
    <div className="page-content d-flex justify-content-center align-items-center vh-100 px-3">
        <div className="w-100" style={{ maxWidth: '600px' }}>
            <Alert className="alert-danger text-center" role="alert">
                <h4 className="alert-heading mb-3">Permission Required!</h4>
                <p>
                You do not have permission to access this page. If you believe this is a mistake,
                please contact your administrator.
                </p>
                <hr />
                <p className="mb-1">
                Click <Link to="/">here</Link> to return to the homepage or navigate to a page you have access to.
                </p>
            </Alert>
        </div>
    </div>
  )
}

export default PermissionDenied
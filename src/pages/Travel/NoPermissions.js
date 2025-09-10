import React from "react";
import { Alert, Button } from "reactstrap";
import { useNavigate } from "react-router-dom";

const NoPermissionAlert = ({
  title = "Access Denied",
  message = "You don't have permission to view this page",
  showHomeButton = true,
  showBackButton = true,
}) => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1); // go to previous page
  };

  const handleGoHome = () => {
    navigate("/dashboard"); // go to dashboard
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: "80vh" }}
    >
      <div style={{ maxWidth: "600px", width: "100%" }}>
        {/* Alert Box */}
        <Alert
          color="danger"
          className="d-flex flex-column align-items-center text-center p-4 shadow-sm"
        >
          <div className="mb-3" style={{ fontSize: "48px" }}>
            🔒
          </div>
          <h4 className="alert-heading mb-2">{title}</h4>
          <p className="mb-4">{message}</p>

          {/* Buttons */}
          <div className="d-flex gap-3">
            {showBackButton && (
              <Button color="secondary" onClick={handleGoBack}>
                ⬅️ Go Back
              </Button>
            )}
            {showHomeButton && (
              <Button color="danger" onClick={handleGoHome}>
                🏠 Go to Dashboard
              </Button>
            )}
          </div>
        </Alert>
      </div>
    </div>
  );
};

export default NoPermissionAlert;

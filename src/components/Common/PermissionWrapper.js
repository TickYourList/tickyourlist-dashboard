import React from 'react';
import { Spinner } from 'reactstrap';
import { usePermissions } from '../../helpers/permissions';

/**
 * PermissionWrapper - A reusable component that handles permission loading states
 * and renders appropriate content based on user permissions
 * 
 * @param {Object} props
 * @param {Array} props.requiredPermissions - Array of {action, module} objects that user must have
 * @param {React.Component} props.children - Content to render when user has permissions
 * @param {React.Component} props.fallback - Component to render when user lacks permissions (default: PermissionDenied)
 * @param {string} props.loadingText - Custom loading text
 * @param {boolean} props.requireAll - If true, user must have ALL permissions. If false, user needs ANY permission (default: true)
 */
const PermissionWrapper = ({ 
  requiredPermissions = [], 
  children, 
  fallback = null,
  loadingText = "Loading page data...",
  requireAll = true 
}) => {
  const { can, isPermissionsReady, loading } = usePermissions();

  // Show loading while permissions are being fetched
  if (loading || !isPermissionsReady) {
    return (
      <div className="page-content">
        <Spinner className="ms-2" color="dark" />
        <p>{loadingText}</p>
      </div>
    );
  }

  // Check if user has required permissions
  const hasPermissions = requireAll
    ? requiredPermissions.every(({ action, module }) => can(action, module))
    : requiredPermissions.some(({ action, module }) => can(action, module));

  if (!hasPermissions) {
    // Use provided fallback or default PermissionDenied component
    if (fallback) {
      return fallback;
    }
    
    // Try to import PermissionDenied component dynamically
    try {
      const PermissionDenied = require('../../pages/LocationManagement/Cities/PermissionDenied').default;
      return <PermissionDenied />;
    } catch (error) {
      // Fallback to simple message if PermissionDenied component not found
      return (
        <div className="page-content">
          <div className="container-fluid">
            <div className="row">
              <div className="col-12">
                <div className="card">
                  <div className="card-body text-center">
                    <h4>Access Denied</h4>
                    <p>You don't have permission to access this page.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  return children;
};

export default PermissionWrapper;

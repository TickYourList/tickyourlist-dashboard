import React, { useEffect, useRef } from "react";
import { Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getUserPermissions } from "../store/user-permissions/actions";

const Authmiddleware = (props) => {
  const dispatch = useDispatch();
  const { permissions, loading } = useSelector((state) => ({
    permissions: state.UserPermissionsReducer.permissions,
    loading: state.UserPermissionsReducer.loading,
  }));
  
  const permissionsLoadedRef = useRef(false);
  const currentUserRef = useRef(null);
  const authUser = localStorage.getItem("authUser");
  
  // If no auth user, redirect to login
  if (!authUser) {
    return (
      <Navigate to={{ pathname: "/login", state: { from: props.location } }} />
    );
  }

  // Parse user data and ensure permissions are loaded
  useEffect(() => {
    if (authUser && !loading) {
      try {
        const userData = JSON.parse(authUser);
        const userId = userData.userId || userData.id || userData.user_id;
        
        if (userId) {
          // Reset permission loaded flag if user changed
          if (currentUserRef.current !== userId) {
            permissionsLoadedRef.current = false;
            currentUserRef.current = userId;
          }
          
          if (!permissionsLoadedRef.current && !loading) {
            // Mark as loaded to prevent multiple calls
            permissionsLoadedRef.current = true;
            
            // Always load permissions on app initialization, regardless of cache
            console.log("App initialization - Loading permissions for user:", userId);
            dispatch(getUserPermissions(userId));
          }
        } else {
          console.warn("No userId found in authUser data:", userData);
        }
      } catch (error) {
        console.error("Error parsing authUser data:", error);
        // If authUser data is corrupted, clear it
        localStorage.removeItem("authUser");
        window.location.reload();
      }
    }
  }, [authUser, loading, dispatch]); // Run when authUser changes or loading state changes

  return (
    <React.Fragment>
      {props.children}
    </React.Fragment>
  );
};

export default Authmiddleware;

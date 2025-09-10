import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getUserPermissions } from "../store/user-permissions/actions";

const Authmiddleware = (props) => {
  const dispatch = useDispatch();
  const { permissions, loading } = useSelector((state) => ({
    permissions: state.UserPermissionsReducer.permissions,
    loading: state.UserPermissionsReducer.loading,
  }));

  const authUser = localStorage.getItem("authUser");
  
  // If no auth user, redirect to login
  if (!authUser) {
    return (
      <Navigate to={{ pathname: "/login", state: { from: props.location } }} />
    );
  }

  // Parse user data and ensure permissions are loaded
  useEffect(() => {
    if (authUser && (!permissions || permissions.length === 0) && !loading) {
      try {
        const userData = JSON.parse(authUser);
        const userId = userData.userId || userData.id || userData.user_id;
        
        if (userId) {
          console.log("Loading permissions for user:", userId);
          dispatch(getUserPermissions(userId));
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
  }, [authUser, permissions, loading, dispatch]);

  return (
    <React.Fragment>
      {props.children}
    </React.Fragment>
  );
};

export default Authmiddleware;

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

  // Parse user data and ensure permissions are loaded on every page load/reload
  useEffect(() => {
    if (authUser) {
      try {
        const userData = JSON.parse(authUser);
        const userId = userData.userId || userData.id || userData.user_id;

        if (userId) {
          // Reset permission loaded flag if user changed
          if (currentUserRef.current !== userId) {
            permissionsLoadedRef.current = false;
            currentUserRef.current = userId;
          }

          // Check if permissions array is empty in Redux - fetch if empty
          // This ensures permissions are always available, even on page reload
          // Only fetch if not currently loading and permissions array is empty
          const permissionsEmpty = !loading && permissions.length === 0;

          if (permissionsEmpty) {
            console.log("🔄 Page load/reload detected - Permissions array is empty in Redux. Fetching permissions for user:", userId);
            dispatch(getUserPermissions(userId));
            permissionsLoadedRef.current = true;
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
  }, [authUser, loading, permissions, dispatch]); // Run when authUser, loading, or permissions change

  return (
    <React.Fragment>
      {props.children}
    </React.Fragment>
  );
};

export default Authmiddleware;

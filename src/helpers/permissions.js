import { useMemo, useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getUserPermissions } from "../store/user-permissions/actions";

export const MODULES = {
  ADMIN_BANNER_PERMS: 'tylTravelCitySectionBanner',   // This module controls the Home Banners for Admins
  SUBCATEGORY_PERMS: 'tylTravelSubCategory',          // This module controls the Travel Subcategory permissions
  CITY_PERMS: 'tylTravelCity',                        // This module controls the Travel City permissions
  TOUR_PERMS: 'tylTravelTour',                        // This module controls the Travel Tour permissions
  TOUR_GROUP_PERMS: 'tylTravelTourGroup',             // This module controls the Travel Tour Group permissions
  TOUR_GROUP_VARIANT_PERMS: 'tylTravelTourGroupVariant', // This module controls the Travel Tour Group Variant permissions
  CATEGORY_PERMS: 'tylTravelCategory',                // This module controls the Travel Category permissions
  COLLECTION_PERMS: 'tylTravelCollection',            // This module controls the Travel Collection permissions
  BOOKING_PERMS: 'tylTravelBooking',                  // This module controls the Travel Booking permissions
  FAQS_PERMS: 'tylTravelFaqs',                        // This module controls the Travel FAQs permissions
  COUNTRY_PERMS: 'tylTravelCountry',                  // This module controls the Travel Country permissions
};

// Action keys
export const ACTIONS = {
  CAN_VIEW: 'canView',
  CAN_ADD: 'canAdd',
  CAN_EDIT: 'canEdit',
  CAN_DELETE: 'canDelete',
};

export const usePermissions = () => {
  const dispatch = useDispatch();
  const { permissions, hasFullAccess, loading, error } = useSelector((state) => ({
    permissions: state.UserPermissionsReducer.permissions,
    hasFullAccess: state.UserPermissionsReducer.hasFullAccess,
    loading: state.UserPermissionsReducer.loading,
    error: state.UserPermissionsReducer.error,
  }));

  const [retryCount, setRetryCount] = useState(0);
  const retryTimeoutRef = useRef(null);
  const lastRetryTimeRef = useRef(0);

  // Auto-fetch permissions if they're empty - runs on every mount/page load
  useEffect(() => {
    const authUser = localStorage.getItem("authUser");
    if (!authUser) return;

    try {
      const userData = JSON.parse(authUser);
      const userId = userData.data?.user?._id || userData.userId || userData.id || userData.user_id;

      if (!userId) return;

      // Check if permissions are empty in Redux
      // If loading is not in progress and permissions array is empty and no full access
      const shouldFetch = !loading &&
        permissions.length === 0 &&
        !hasFullAccess;

      console.log("Permissions Debug:", {
        loading,
        permissionsLength: permissions.length,
        hasFullAccess,
        shouldFetch,
        userId,
        lastRetryTime: lastRetryTimeRef.current,
        now: Date.now()
      });

      if (shouldFetch) {
        const now = Date.now();
        // Only fetch if at least 1 second has passed since last attempt (to prevent rapid calls)
        if (now - lastRetryTimeRef.current > 1000) {
          lastRetryTimeRef.current = now;

          console.log("🔄 Permissions array is empty in Redux. Fetching permissions for user:", userId);

          // Clear any existing timeout
          if (retryTimeoutRef.current) {
            clearTimeout(retryTimeoutRef.current);
          }

          // Fetch immediately (no delay for initial fetch)
          dispatch(getUserPermissions(userId));
        }
      } else if (permissions.length > 0 || hasFullAccess) {
        // Reset retry count on success
        if (retryCount > 0) {
          setRetryCount(0);
        }
        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current);
          retryTimeoutRef.current = null;
        }
      }
    } catch (error) {
      console.error("Error in permissions auto-fetch:", error);
    }

    // Cleanup timeout on unmount
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [loading, permissions, hasFullAccess, dispatch]);

  const permissionsMap = useMemo(() => {
    const map = new Map();
    if (permissions) {
      permissions.forEach(p => map.set(p.module, p));
    }
    return map;
  }, [permissions]);

  const can = useMemo(() => (action, module) => {
    if (hasFullAccess) {
      return true;
    }

    const modulePermissions = permissionsMap.get(module);
    if (!modulePermissions) {
      return false;
    }
    return modulePermissions[action] === true;
  }, [hasFullAccess, permissionsMap]);

  // Helper function to check if permissions are ready (loaded and not loading)
  // Also consider ready if we've tried loading (even if empty) to prevent infinite loading
  const isPermissionsReady = useMemo(() => {
    // If loading, not ready
    if (loading) return false;

    // If we have permissions or full access, ready
    if (permissions.length > 0 || hasFullAccess) return true;

    // If we've tried loading and got an error, consider ready (to show error state)
    if (error) return true;

    // If we have an empty array (loaded from cache or redux init) but haven't hit retry limit yet,
    // and we clearly don't have full access, we might still be waiting for the auto-fetch to kick in.
    // However, to prevent UI blocking, if retries are exhausted, we say ready.
    if (retryCount >= 3) return true;

    // If permissions are completely empty and we are not loading, we might need to fetch.
    // But if we return 'false' here, the UI shows a spinner.
    // Ideally, we want to show spinner until we either get data or definitively fail.
    // So if empty and no error and retries < 3, return false implies "still working on it".
    return false;
  }, [loading, permissions, hasFullAccess, error, retryCount]);

  // Helper function to check permissions with loading state consideration
  const canWithLoading = useMemo(() => (action, module) => {
    // If still loading, return null to indicate unknown state
    if (loading) {
      return null;
    }

    // If permissions are loaded, use normal can function
    return can(action, module);
  }, [loading, can]);

  // Helper function to get specific module permissions
  const getModulePermissions = useMemo(() => (module) => {
    return permissionsMap.get(module) || {};
  }, [permissionsMap]);

  // Helper functions for commonly used permissions - memoized to prevent re-renders
  const getCityPermissions = useMemo(() => getModulePermissions(MODULES.CITY_PERMS), [getModulePermissions]);
  const getSubCategoryPermissions = useMemo(() => getModulePermissions(MODULES.SUBCATEGORY_PERMS), [getModulePermissions]);
  const getCategoryPermissions = useMemo(() => getModulePermissions(MODULES.CATEGORY_PERMS), [getModulePermissions]);
  const getTourPermissions = useMemo(() => getModulePermissions(MODULES.TOUR_PERMS), [getModulePermissions]);
  const getTourGroupPermissions = useMemo(() => getModulePermissions(MODULES.TOUR_GROUP_PERMS), [getModulePermissions]);
  const getTourGroupVariantPermissions = useMemo(() => getModulePermissions(MODULES.TOUR_GROUP_VARIANT_PERMS), [getModulePermissions]);
  const getCollectionPermissions = useMemo(() => getModulePermissions(MODULES.COLLECTION_PERMS), [getModulePermissions]);
  const getBookingPermissions = useMemo(() => getModulePermissions(MODULES.BOOKING_PERMS), [getModulePermissions]);
  const getBannerPermissions = useMemo(() => getModulePermissions(MODULES.ADMIN_BANNER_PERMS), [getModulePermissions]);
  const getFaqsPermissions = useMemo(() => getModulePermissions(MODULES.FAQS_PERMS), [getModulePermissions]);
  const getCountryPermissions = useMemo(() => getModulePermissions(MODULES.COUNTRY_PERMS), [getModulePermissions]);

  // Function to manually refresh permissions
  const refreshPermissions = useMemo(() => () => {
    try {
      const authUser = localStorage.getItem("authUser");
      if (authUser) {
        const userData = JSON.parse(authUser);
        const userId = userData.data?.user?._id || userData.userId || userData.id || userData.user_id;
        if (userId) {
          console.log("Manually refreshing permissions for user:", userId);
          dispatch(getUserPermissions(userId));
        }
      }
    } catch (error) {
      console.error("Error refreshing permissions:", error);
    }
  }, [dispatch]);

  return {
    can,
    canWithLoading,
    isPermissionsReady,
    loading,
    hasFullAccess,
    permissions,
    getModulePermissions,
    getCityPermissions,
    getSubCategoryPermissions,
    getCategoryPermissions,
    getTourPermissions,
    getTourGroupPermissions,
    getTourGroupVariantPermissions,
    getCollectionPermissions,
    getBookingPermissions,
    getBannerPermissions,
    getFaqsPermissions,
    getCountryPermissions,
    refreshPermissions
  };
};


import { useMemo } from "react";
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
  const { permissions, hasFullAccess, loading } = useSelector((state) => ({
    permissions: state.UserPermissionsReducer.permissions,
    hasFullAccess: state.UserPermissionsReducer.hasFullAccess,
    loading: state.UserPermissionsReducer.loading,
  }));

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
  const isPermissionsReady = useMemo(() => {
    return !loading && (permissions.length > 0 || hasFullAccess);
  }, [loading, permissions, hasFullAccess]);

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
        const userId = userData.userId || userData.id || userData.user_id;
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


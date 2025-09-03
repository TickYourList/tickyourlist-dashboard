import { useMemo } from "react";
import { useSelector } from "react-redux";

export const MODULES = {
  ADMIN_BANNER_PERMS: 'tylTravelCitySectionBanner',   // This module controls the Home Banners for Admins
};

// Action keys
export const ACTIONS = {
  CAN_VIEW: 'canView',
  CAN_ADD: 'canAdd',
  CAN_EDIT: 'canEdit',
  CAN_DELETE: 'canDelete',
};

export const usePermissions = () => {
  const { permissions, hasFullAccess } = useSelector((state) => ({
    permissions: state.UserPermissionsReducer.permissions,
    hasFullAccess: state.UserPermissionsReducer.hasFullAccess,
  }));

  const permissionsMap = useMemo(() => {
    const map = new Map();
    if (permissions) {
      permissions.forEach(p => map.set(p.module, p));
    }
    return map;
  }, [permissions]);

  const can = (action, module) => {
    if (hasFullAccess) {
      return true;
    }

    const modulePermissions = permissionsMap.get(module);
    if (!modulePermissions) {
      return false;
    }
    return modulePermissions[action] === true;
  };

  return { can };
}; 


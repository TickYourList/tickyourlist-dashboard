import {
  GET_USER_PERMISSIONS,
  GET_USER_PERMISSIONS_SUCCESS,
  GET_USER_PERMISSIONS_FAILURE,
} from './actionTypes';


// Helper function to get cached permissions
const getCachedPermissions = () => {
  try {
    const authUser = localStorage.getItem("authUser");
    if (authUser) {
      const userData = JSON.parse(authUser);
      const userId = userData.userId || userData.id || userData.user_id;
      if (userId) {
        const cached = localStorage.getItem(`permissions_${userId}`);
        return cached ? JSON.parse(cached) : null;
      }
    }
  } catch (error) {
    console.error("Error loading cached permissions:", error);
  }
  return null;
};

const cachedData = getCachedPermissions();

const INIT_STATE = {
  loading: false,
  permissions: cachedData?.permissions || [],
  hasFullAccess: cachedData?.hasFullAccess || false,
  error: null,
}

const UserPermissionsReducer = (state = INIT_STATE, action) => {
  switch (action.type) {
    case GET_USER_PERMISSIONS:
      return {
        ...state,
        loading: true,
        error: null,
      }
    case GET_USER_PERMISSIONS_SUCCESS:
      // Cache permissions to localStorage
      try {
        const authUser = localStorage.getItem("authUser");
        if (authUser) {
          const userData = JSON.parse(authUser);
          const userId = userData.userId || userData.id || userData.user_id;
          if (userId) {
            const permissionsData = {
              permissions: action.payload.permissions || action.payload,
              hasFullAccess: action.payload.hasFullAccess || false,
              timestamp: Date.now()
            };
            localStorage.setItem(`permissions_${userId}`, JSON.stringify(permissionsData));
          }
        }
      } catch (error) {
        console.error("Error caching permissions:", error);
      }

      return {
        ...state,
        loading: false,
        permissions: action.payload.permissions || action.payload,
        hasFullAccess: action.payload.hasFullAccess || false,
        error: null,
      }
    case GET_USER_PERMISSIONS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      }
    default:
      return state
  }
}

export default UserPermissionsReducer
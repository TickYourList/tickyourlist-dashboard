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
        if (cached) {
          const parsed = JSON.parse(cached);
          // Only return cached data if it has valid permissions (non-empty array) or full access
          // This ensures we don't initialize with empty permissions from cache
          if (parsed && (Array.isArray(parsed.permissions) && parsed.permissions.length > 0) || parsed.hasFullAccess) {
            return parsed;
          }
        }
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
  // Only use cached permissions if they exist and are not empty, otherwise start with empty array
  // This ensures the useEffect hooks will detect empty array and fetch permissions
  permissions: (cachedData?.permissions && Array.isArray(cachedData.permissions) && cachedData.permissions.length > 0) 
    ? cachedData.permissions 
    : [],
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
        // Don't clear permissions on failure - keep existing ones if available
      }
    default:
      return state
  }
}

export default UserPermissionsReducer
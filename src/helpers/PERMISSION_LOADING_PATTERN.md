# Permission Loading Pattern - Fix for Page Reload Issues

## Problem
When users reload pages, the permission state is initially empty, causing components to immediately show "Permission Denied" errors instead of waiting for the permissions API to load.

## Solution
We've enhanced the `usePermissions` hook and updated components to properly handle the loading state.

## Enhanced usePermissions Hook

The `usePermissions` hook now provides:
- `isPermissionsReady`: Boolean indicating if permissions are loaded and ready
- `canWithLoading`: Function that returns `null` while loading, then the actual permission result
- `loading`: Boolean indicating if permissions are currently being fetched

## Pattern to Apply

### 1. Update Component Hook Usage
```javascript
// OLD
const { can } = usePermissions();

// NEW
const { can, isPermissionsReady, loading: permissionsLoading } = usePermissions();
```

### 2. Update useEffect Dependencies
```javascript
// OLD
useEffect(() => {
  if (can(ACTIONS.CAN_VIEW, MODULES.SOME_PERMS)) {
    dispatch(fetchData());
  }
}, [dispatch, can]);

// NEW
useEffect(() => {
  if (isPermissionsReady && can(ACTIONS.CAN_VIEW, MODULES.SOME_PERMS)) {
    dispatch(fetchData());
  }
}, [dispatch, can, isPermissionsReady]);
```

### 3. Add Loading State Before Permission Checks
```javascript
// Show loading while permissions are being fetched
if (permissionsLoading || !isPermissionsReady) {
  return (
    <div className="page-content">
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-2">Loading page data...</p>
        </div>
      </div>
    </div>
  );
}

// Only check permissions after they are loaded
if (!can(ACTIONS.CAN_VIEW, MODULES.SOME_PERMS)) {
  return <PermissionDenied />;
}
```

## Components Already Fixed
- ✅ AddNewCity.js
- ✅ Cities.js  
- ✅ TravelCategoryDetail.js
- ✅ Faqs.js

## Components Still Need Fixing
Apply the above pattern to these components:
- [ ] src/pages/tickyourlist/TravelTourGroup/index.js
- [ ] src/pages/tickyourlist/TravelTourGroup/ViewTourGroup.js
- [ ] src/pages/Travel/ViewCategoryModal.js
- [ ] src/pages/Travel/TravelCategoryForm.js
- [ ] src/pages/TourGroupVariantData/index.js
- [ ] src/pages/Product_Management/SubCategory/SubCategory.js
- [ ] src/pages/LocationManagement/Country/CountryDetailModal.js
- [ ] src/pages/LocationManagement/Country/Country.js
- [ ] src/pages/LocationManagement/Cities/SubCategorySorting.js
- [ ] src/pages/LocationManagement/Cities/CityDetails.js
- [ ] src/pages/LocationManagement/Cities/CategorySorting.js

## Alternative: PermissionWrapper Component

For simpler cases, you can use the `PermissionWrapper` component:

```javascript
import PermissionWrapper from '../../components/Common/PermissionWrapper';

return (
  <PermissionWrapper
    requiredPermissions={[
      { action: ACTIONS.CAN_VIEW, module: MODULES.CITY_PERMS }
    ]}
    loadingText="Loading city data..."
  >
    {/* Your component content */}
  </PermissionWrapper>
);
```

## Testing
After applying this pattern:
1. Clear localStorage
2. Reload the page
3. Verify you see a loading spinner instead of immediate "Permission Denied"
4. Verify the page loads correctly after permissions are fetched

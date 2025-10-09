#!/usr/bin/env node

/**
 * Bulk Permission Loading Fix Script
 * 
 * This script applies the permission loading pattern to all components
 * that use the usePermissions hook to prevent "Permission Denied" errors
 * on page reload.
 */

const fs = require('fs');
const path = require('path');

const componentsToFix = [
  'src/pages/tickyourlist/TravelTourGroup/index.js',
  'src/pages/tickyourlist/TravelTourGroup/ViewTourGroup.js',
  'src/pages/Travel/ViewCategoryModal.js',
  'src/pages/Travel/TravelCategoryForm.js',
  'src/pages/TourGroupVariantData/index.js',
  'src/pages/LocationManagement/Cities/SubCategorySorting.js',
  'src/pages/LocationManagement/Cities/CityDetails.js',
  'src/pages/LocationManagement/Cities/CategorySorting.js'
];

function applyPermissionFix(filePath) {
  console.log(`Fixing ${filePath}...`);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Pattern 1: Update usePermissions hook usage
    content = content.replace(
      /const\s*{\s*can\s*}\s*=\s*usePermissions\(\)/g,
      'const { can, isPermissionsReady, loading: permissionsLoading } = usePermissions()'
    );
    
    // Pattern 2: Update useEffect dependencies
    content = content.replace(
      /useEffect\(\(\)\s*=>\s*{\s*if\s*\(\s*can\(/g,
      'useEffect(() => {\n    if (isPermissionsReady && can('
    );
    
    // Pattern 3: Add isPermissionsReady to dependencies
    content = content.replace(
      /\],\s*\[dispatch,\s*can\]/g,
      '], [dispatch, can, isPermissionsReady]'
    );
    
    // Pattern 4: Add loading check before permission checks
    const loadingCheck = `
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

`;
    
    // Find permission checks and add loading before them
    content = content.replace(
      /(\s*if\s*\(\s*!can\(ACTIONS\.CAN_VIEW)/g,
      loadingCheck + '$1'
    );
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed ${filePath}`);
    
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
  }
}

function main() {
  console.log('🚀 Starting bulk permission loading fix...\n');
  
  componentsToFix.forEach(filePath => {
    const fullPath = path.join(process.cwd(), filePath);
    if (fs.existsSync(fullPath)) {
      applyPermissionFix(fullPath);
    } else {
      console.log(`⚠️  File not found: ${filePath}`);
    }
  });
  
  console.log('\n✨ Bulk permission fix completed!');
  console.log('\n📝 Manual review recommended for:');
  console.log('- Complex permission logic');
  console.log('- Custom loading states');
  console.log('- Nested permission checks');
}

if (require.main === module) {
  main();
}

module.exports = { applyPermissionFix };

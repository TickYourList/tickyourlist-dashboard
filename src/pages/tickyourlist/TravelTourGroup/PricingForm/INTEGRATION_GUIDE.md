# Pricing Form Integration Guide

## How to Integrate into NewTourModel.js

### Step 1: Import the PricingForm Component

Add this import at the top of `NewTourModel.js`:

```javascript
import PricingForm from "./PricingForm"
```

### Step 2: Add Pricing Tab to Navigation

In the `Navbar` component that shows the step numbers, add a new step:

```javascript
// If Navbar is in a separate file, modify it
// If it's inline, add to the steps array
const steps = [
  { id: 1, label: "Basic Details" },
  { id: 2, label: "URL Slugs" },
  { id: 3, label: "Location" },
  { id: 4, label: "Ticket Info" },
  { id: 5, label: "Meta" },
  { id: 6, label: "Summary" },
  { id: 7, label: "Tour Images" },
  { id: 8, label: "Product Images" },
  { id: 9, label: "Safety Images" },
  { id: 10, label: "Safety Videos" },
  { id: 11, label: "Pricing" }, // NEW
]
```

### Step 3: Add TabPane for Pricing

After the last TabPane (Safety Videos - tabId={10}), add:

```javascript
{/* Pricing Configuration */}
<TabPane tabId={11}>
  <PricingForm variantId={editId} />
</TabPane>
```

### Step 4: Update Navigation Logic

Update the tab navigation to include the new tab:

```javascript
function toggleTab(tab) {
  if (activeTab !== tab) {
    const modifiedSteps = [...passedSteps, tab]
    if (tab >= 1 && tab <= 11) { // Changed from 10 to 11
      setactiveTab(tab)
      setPassedSteps(modifiedSteps)
    }
  }
}
```

### Step 5: Update Submit Button Logic

Modify the submit button condition:

```javascript
<li
  className={
    activeTab === 11 ? "next d-none" : "next" // Changed from 10 to 11
  }
>
  <Link
    to="#"
    onClick={() => {
      toggleTab(activeTab + 1)
    }}
  >
    Next
  </Link>
</li>
{activeTab === 11 && ( // Changed from 10 to 11
  <li className="next">
    <FormikSubmitButton
      isEdit={isEdit}
      setModal={setModal}
    />
  </li>
)}
```

## Complete Modified Section

Here's the complete section to add to `NewTourModel.js`:

```javascript
// Around line 1676, after Safety Videos TabPane

{/* Safety Videos */}
<TabPane tabId={10}>
  <h5>Safety Videos</h5>
  <SafetyVideo />
</TabPane>

{/* NEW: Pricing Configuration */}
<TabPane tabId={11}>
  <h5 className="mb-3">Pricing Configuration</h5>
  <p className="text-muted mb-4">
    Configure listing prices and dynamic pricing rules for this tour variant.
  </p>
  {editId ? (
    <PricingForm variantId={editId} />
  ) : (
    <Alert color="info">
      <h5 className="alert-heading">Save Tour First</h5>
      <p className="mb-0">
        Pricing configuration is available after creating the tour variant. 
        Please save this tour first, then return to configure pricing.
      </p>
    </Alert>
  )}
</TabPane>
```

## Alternative: Standalone Pricing Page

If you prefer a separate page instead of a tab:

### 1. Create Route

In your routes file (e.g., `routes/index.js`):

```javascript
{
  path: "/tour-variants/:variantId/pricing",
  component: () => import("../pages/tickyourlist/TravelTourGroup/PricingManagement"),
}
```

### 2. Create Page Component

Create `PricingManagement.js`:

```javascript
import React from "react"
import { useParams } from "react-router-dom"
import { Container, Row, Col, Breadcrumb, BreadcrumbItem } from "reactstrap"
import PricingForm from "./PricingForm"

const PricingManagement = () => {
  const { variantId } = useParams()

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumb>
          <BreadcrumbItem>
            <a href="/dashboard">Dashboard</a>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <a href="/tour-variants">Tour Variants</a>
          </BreadcrumbItem>
          <BreadcrumbItem active>Pricing Management</BreadcrumbItem>
        </Breadcrumb>

        <Row>
          <Col>
            <h4 className="mb-4">Pricing Management</h4>
            <PricingForm variantId={variantId} />
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default PricingManagement
```

### 3. Add Link from Variant List

In your variant list page, add a pricing button:

```javascript
<Button
  color="primary"
  outline
  size="sm"
  onClick={() => history.push(`/tour-variants/${variant._id}/pricing`)}
>
  <i className="bx bx-dollar-circle me-1"></i>
  Manage Pricing
</Button>
```

## API Configuration

Ensure your axios instance is configured correctly:

```javascript
// In api_helper.js or similar

import axios from "axios"

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
})

// Add auth token interceptor
api.interceptors.request.use(config => {
  const token = localStorage.getItem("authToken")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
```

## Environment Variables

Add to your `.env` file:

```
REACT_APP_API_URL=http://localhost:3000/api
```

## Testing Checklist

- [ ] Pricing tab appears in navigation
- [ ] Can switch between tabs
- [ ] Listing price form loads
- [ ] Can save listing prices
- [ ] Can create default pricing rule
- [ ] Can create weekend/seasonal rules
- [ ] Priority manager displays correctly
- [ ] Calendar preview works
- [ ] Success/error messages show
- [ ] Loading states work
- [ ] API calls succeed
- [ ] Form validation works
- [ ] Can navigate back to previous tabs

## Common Issues

### Issue: "variantId is undefined"
**Solution:** Ensure you're passing `editId` from NewTourModel props to PricingForm

### Issue: API calls fail with 401
**Solution:** Check authentication token is properly set in axios headers

### Issue: Calendar preview shows no data
**Solution:** Verify variant has active pricing rules created

### Issue: Cannot save listing price
**Solution:** Check that the variant exists and you have write permissions

## Support

For issues or questions:
1. Check the main README.md
2. Review API documentation
3. Check browser console for errors
4. Verify network requests in DevTools


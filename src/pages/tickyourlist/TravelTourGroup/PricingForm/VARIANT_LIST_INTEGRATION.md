# Adding Pricing Button to Variant List

## Quick Integration Guide

If you want to add a "Manage Pricing" button to your Tour Variant list page, here's how:

### In TourGroupVariantData/index.js

Add this button to each variant row in your table:

```javascript
import { useNavigate } from "react-router-dom"

// Inside your component
const navigate = useNavigate()

// In your table row or card
<Button
  color="primary"
  size="sm"
  outline
  onClick={() => navigate(`/pricing-management/${variant._id}`)}
  title="Manage Pricing"
>
  <i className="bx bx-dollar-circle me-1"></i>
  Pricing
</Button>
```

### Full Example in Table

```javascript
<Table responsive>
  <thead>
    <tr>
      <th>Variant Name</th>
      <th>City</th>
      <th>Status</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    {variants.map(variant => (
      <tr key={variant._id}>
        <td>{variant.name}</td>
        <td>{variant.cityCode}</td>
        <td>
          {variant.status ? (
            <Badge color="success">Active</Badge>
          ) : (
            <Badge color="secondary">Inactive</Badge>
          )}
        </td>
        <td>
          <div className="d-flex gap-2">
            <Button
              color="info"
              size="sm"
              onClick={() => navigate(`/tour-group-variants/edit/${variant._id}`)}
            >
              <i className="bx bx-edit"></i>
            </Button>
            
            {/* PRICING BUTTON */}
            <Button
              color="primary"
              size="sm"
              outline
              onClick={() => navigate(`/pricing-management/${variant._id}`)}
              title="Manage Pricing"
            >
              <i className="bx bx-dollar-circle"></i>
            </Button>
            
            <Button
              color="danger"
              size="sm"
              onClick={() => handleDelete(variant._id)}
            >
              <i className="bx bx-trash"></i>
            </Button>
          </div>
        </td>
      </tr>
    ))}
  </tbody>
</Table>
```

### Card View Example

```javascript
<Card>
  <CardBody>
    <h5>{variant.name}</h5>
    <p className="text-muted">{variant.cityCode}</p>
    <div className="d-flex gap-2">
      <Button
        color="primary"
        size="sm"
        onClick={() => navigate(`/tour-group-variants/edit/${variant._id}`)}
      >
        Edit
      </Button>
      <Button
        color="success"
        size="sm"
        outline
        onClick={() => navigate(`/pricing-management/${variant._id}`)}
      >
        <i className="bx bx-dollar-circle me-1"></i>
        Manage Pricing
      </Button>
    </div>
  </CardBody>
</Card>
```

### Dropdown Menu Example

```javascript
import { UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from "reactstrap"

<UncontrolledDropdown>
  <DropdownToggle className="btn btn-light btn-sm" caret>
    Actions <i className="mdi mdi-chevron-down"></i>
  </DropdownToggle>
  <DropdownMenu>
    <DropdownItem onClick={() => navigate(`/tour-group-variants/edit/${variant._id}`)}>
      <i className="bx bx-edit me-2"></i>
      Edit Variant
    </DropdownItem>
    <DropdownItem onClick={() => navigate(`/pricing-management/${variant._id}`)}>
      <i className="bx bx-dollar-circle me-2"></i>
      Manage Pricing
    </DropdownItem>
    <DropdownItem divider />
    <DropdownItem onClick={() => handleDelete(variant._id)} className="text-danger">
      <i className="bx bx-trash me-2"></i>
      Delete
    </DropdownItem>
  </DropdownMenu>
</UncontrolledDropdown>
```

## Navigation Methods

### Method 1: Direct Navigation (Recommended)
```javascript
navigate(`/pricing-management/${variantId}`)
```

### Method 2: With State
```javascript
navigate(`/pricing-management/${variantId}`, {
  state: { variant: variantData }
})
```

### Method 3: Open in New Tab
```javascript
window.open(`/pricing-management/${variantId}`, '_blank')
```

## Conditional Display

Only show pricing button if variant exists:

```javascript
{variant._id && (
  <Button
    color="primary"
    size="sm"
    onClick={() => navigate(`/pricing-management/${variant._id}`)}
  >
    <i className="bx bx-dollar-circle me-1"></i>
    Manage Pricing
  </Button>
)}
```

## Permission Check

If you have permission system:

```javascript
{canManagePricing && (
  <Button
    color="primary"
    size="sm"
    onClick={() => navigate(`/pricing-management/${variant._id}`)}
  >
    <i className="bx bx-dollar-circle me-1"></i>
    Manage Pricing
  </Button>
)}
```

## Icon Options

Different icon styles:
- `bx bx-dollar-circle` - Dollar in circle (recommended)
- `bx bx-dollar` - Simple dollar sign
- `bx bx-money` - Money/bills
- `bx bx-credit-card` - Credit card
- `bx bx-receipt` - Receipt
- `bx bxs-dollar-circle` - Solid dollar circle

## Styling Variations

### Primary Button
```javascript
<Button color="primary" size="sm">
  <i className="bx bx-dollar-circle me-1"></i>
  Pricing
</Button>
```

### Outline Button (Recommended)
```javascript
<Button color="primary" size="sm" outline>
  <i className="bx bx-dollar-circle me-1"></i>
  Pricing
</Button>
```

### Icon Only Button
```javascript
<Button color="primary" size="sm" title="Manage Pricing">
  <i className="bx bx-dollar-circle"></i>
</Button>
```

### Link Style
```javascript
<Button color="link" size="sm" className="text-primary">
  <i className="bx bx-dollar-circle me-1"></i>
  Manage Pricing
</Button>
```

## Complete Integration Example

Here's a complete example of a variant list with pricing button:

```javascript
import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Table,
  Button,
  Badge,
} from "reactstrap"
import axios from "axios"

const TourGroupVariantData = () => {
  const navigate = useNavigate()
  const [variants, setVariants] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchVariants()
  }, [])

  const fetchVariants = async () => {
    try {
      const response = await axios.get("/api/v1/tyl-travel-tour-group-variants")
      setVariants(response.data.data)
      setLoading(false)
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  return (
    <div className="page-content">
      <Container fluid>
        <Row>
          <Col>
            <Card>
              <CardBody>
                <h5 className="mb-4">Tour Variants</h5>
                <Table responsive>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>City</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {variants.map(variant => (
                      <tr key={variant._id}>
                        <td>{variant.name}</td>
                        <td>{variant.cityCode}</td>
                        <td>
                          {variant.status ? (
                            <Badge color="success">Active</Badge>
                          ) : (
                            <Badge color="secondary">Inactive</Badge>
                          )}
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <Button
                              color="info"
                              size="sm"
                              onClick={() => 
                                navigate(`/tour-group-variants/edit/${variant._id}`)
                              }
                              title="Edit Variant"
                            >
                              <i className="bx bx-edit"></i>
                            </Button>
                            
                            <Button
                              color="primary"
                              size="sm"
                              outline
                              onClick={() => 
                                navigate(`/pricing-management/${variant._id}`)
                              }
                              title="Manage Pricing"
                            >
                              <i className="bx bx-dollar-circle"></i>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default TourGroupVariantData
```

## Testing

After adding the button, test:
1. Click the pricing button from variant list
2. Should navigate to `/pricing-management/:variantId`
3. Pricing form should load with variant data
4. Can save pricing and return to list
5. Back button works correctly


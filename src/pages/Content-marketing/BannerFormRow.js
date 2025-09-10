import React, { useState, useEffect } from 'react';
import {FormFeedback, FormGroup, Label, Col, Row, Input } from 'reactstrap';
import Select from 'react-select';
import { getCityList, getTours, getCategories, getSubcategories, getBannerCollections } from '../../helpers/location_management_helper';
import{ getSubcategoriesList} from '../../helpers/location_management_helper';

const BannerFormRow = ({ index, values, setFieldValue, setFieldTouched, touched, errors }) => {
  const [cities, setCities] = useState([]);
  const [tours, setTours] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [bannerCollections, setBannerCollections] = useState([]);
  
  const currentBanner = values.banners[index];
  const currentErrors = errors.banners?.[index];
  const currentTouched = touched.banners?.[index];

    // This will capture the general error from our custom .test()
  const rowError = typeof currentErrors === 'string' ? currentErrors : null;

  // Custom styles to show a red border on the Select component when invalid
  const getSelectStyles = (fieldName) => ({
    control: (base, state) => ({
      ...base,
      borderColor: currentErrors?.[fieldName] && currentTouched?.[fieldName] ? '#f46a6a' : base.borderColor, // Use theme's danger color
      '&:hover': {
        borderColor: currentErrors?.[fieldName] && currentTouched?.[fieldName] ? '#f46a6a' : '#ced4da',
      }
    }),
  });

  // --- Data Fetching Logic ---
  useEffect(() => { getCityList().then(setCities); }, []);
  useEffect(() => { if (currentBanner.cityId) getTours(currentBanner.cityId).then(setTours); else setTours([]); }, [currentBanner.cityId]);
  useEffect(() => { if (currentBanner.cityId) getCategories(currentBanner.cityId).then(setCategories); else setCategories([]); }, [currentBanner.cityId]);
  useEffect(() => { if (currentBanner.cityId) getSubcategoriesList(currentBanner.cityId).then(setSubcategories); else setSubcategories([]); }, [currentBanner.cityId]);
  useEffect(() => { if (currentBanner.cityId) getBannerCollections(currentBanner.cityId).then(setBannerCollections); else setBannerCollections([]); }, [currentBanner.cityId]);

  // --- Centralized Handler for Clearing Competing Fields ---
  const handleSelectionChange = (name, selectedValue) => {
    const val = selectedValue ? selectedValue.value : '';
    setFieldValue(name, val);

    // When a specific path is chosen, clear all other competing paths
    if (name === `banners[${index}].tourId` && val) {
      setFieldValue(`banners[${index}].categoryId`, '');
      setFieldValue(`banners[${index}].subcategoryId`, '');
      setFieldValue(`banners[${index}].bannerCollectionId`, '');
    } else if (name === `banners[${index}].categoryId` && val) {
      setFieldValue(`banners[${index}].tourId`, '');
      setFieldValue(`banners[${index}].subcategoryId`, '');
      setFieldValue(`banners[${index}].bannerCollectionId`, '');
    } else if (name === `banners[${index}].subcategoryId` && val) {
      setFieldValue(`banners[${index}].tourId`, '');
      setFieldValue(`banners[${index}].categoryId`, '');
      setFieldValue(`banners[${index}].bannerCollectionId`, '');
    } else if (name === `banners[${index}].bannerCollectionId` && val) {
      setFieldValue(`banners[${index}].tourId`, '');
      setFieldValue(`banners[${index}].categoryId`, '');
      setFieldValue(`banners[${index}].subcategoryId`, '');
    }
  };

  // --- Readability variables for isDisabled logic ---
  const isTourSelected = !!currentBanner.tourId;
  const isCategorySelected = !!currentBanner.categoryId;
  const isSubcategorySelected = !!currentBanner.subcategoryId;
  const isCollectionSelected = !!currentBanner.bannerCollectionId;

  return (
    <React.Fragment>
      
      <Row className="align-items-start">
        <Col md={2}>
          <FormGroup>
            <Label>City</Label>
            <Select
              name={`banners[${index}].cityId`}
              styles={getSelectStyles('cityId')}
              value={cities.find(option => option.value === currentBanner.cityId) || null}
              options={cities}
              onChange={selectedOption => {
                console.log("Selected option from react-select:", selectedOption)
                const val = selectedOption ? selectedOption.value : '';
                setFieldValue(`banners[${index}].cityId`, val);
                // When city changes, clear all children
                setFieldValue(`banners[${index}].tourId`, '');
                setFieldValue(`banners[${index}].categoryId`, '');
                setFieldValue(`banners[${index}].subcategoryId`, '');
                setFieldValue(`banners[${index}].bannerCollectionId`, '');
              }}
              onBlur={() => setFieldTouched(`banners[${index}].cityId`, true)}
              placeholder="Search..."
              isClearable
            />
            {currentErrors?.cityId && currentTouched?.cityId && (
              <FormFeedback className="d-block">{currentErrors.cityId}</FormFeedback>
            )}
          </FormGroup>
        </Col>

        {/* --- Dropdowns with Mutually Exclusive Logic --- */}
        <Col md={2}><FormGroup><Label>Tour</Label>
        <Select options={tours} name={`banners[${index}].tourId`} styles={getSelectStyles('tourId')} value={tours.find(o => o.value === currentBanner.tourId) || null} onChange={opt => handleSelectionChange(`banners[${index}].tourId`, opt)}
         onBlur={() => setFieldTouched(`banners[${index}].tourId`, true)} placeholder="Search..." isClearable isDisabled={!currentBanner.cityId || isCategorySelected || isSubcategorySelected || isCollectionSelected} />
         </FormGroup></Col>
        
        <Col md={2}><FormGroup><Label>Category</Label>
        <Select options={categories} name={`banners[${index}].categoryId`} styles={getSelectStyles('categoryId')} value={categories.find(o => o.value === currentBanner.categoryId) || null} onChange={opt => handleSelectionChange(`banners[${index}].categoryId`, opt)} 
        onBlur={() => setFieldTouched(`banners[${index}].categoryId`, true)} placeholder="Search..." isClearable isDisabled={!currentBanner.cityId || isTourSelected || isSubcategorySelected || isCollectionSelected} />
        </FormGroup></Col>
        
        <Col md={2}><FormGroup><Label>Subcategory</Label>
        <Select options={subcategories} name={`banners[${index}].subcategoryId`}
              styles={getSelectStyles('subcategoryId')} value={subcategories.find(o => o.value === currentBanner.subcategoryId) || null} onChange={opt => handleSelectionChange(`banners[${index}].subcategoryId`, opt)} 
        onBlur={() => setFieldTouched(`banners[${index}].subcategoryId`, true)} placeholder="Search..." isClearable isDisabled={!currentBanner.cityId || isTourSelected || isCategorySelected || isCollectionSelected} />
         </FormGroup></Col>
        
        <Col md={2}><FormGroup><Label>Banner Collection</Label>
        <Select options={bannerCollections} name={`banners[${index}].bannerCollectionId`}
              styles={getSelectStyles('bannerCollectionId')} value={bannerCollections.find(o => o.value === currentBanner.bannerCollectionId) || null} onChange={opt => handleSelectionChange(`banners[${index}].bannerCollectionId`, opt)} 
        onBlur={() => setFieldTouched(`banners[${index}].bannerCollectionId`, true)} placeholder="Search..." isClearable isDisabled={!currentBanner.cityId || isTourSelected || isCategorySelected || isSubcategorySelected} />
        </FormGroup></Col>

        <Col>
          <FormGroup>
            <Label>Image/Video File</Label>
            <Input 
              name={`banners[${index}].mediaFile`} 
              type="file"
              onChange={(event) => setFieldValue(`banners[${index}].mediaFile`, event.currentTarget.files[0])}
              // 'invalid' prop
              invalid={touched.banners?.[index]?.mediaFile && !!errors.banners?.[index]?.mediaFile}
            />
            {/* FormFeedback component to show the error */}
            <FormFeedback>
              {errors.banners?.[index]?.mediaFile}
            </FormFeedback>
          </FormGroup>
        </Col>
      </Row>
       {rowError && (
        <Row>
          <Col>
            <div className="text-danger text-center mt-2 mb-2">
              {rowError}
            </div>
          </Col>
        </Row>
      )}

      <hr className="my-3"/> 
    </React.Fragment>
  );
};

export default BannerFormRow;
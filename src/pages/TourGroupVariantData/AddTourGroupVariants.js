import React, { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import Select from "react-select";
import Switch from "react-switch";
import {
  Card,
  CardBody,
  Col,
  Container,
  Form,
  Button,
  Input,
  Label,
  Row,
  Table,
} from "reactstrap";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import EditorReact from "./Editor";

import {
  getTravelTourGroups,
  addTourGroupVariant,
  getTourGroupVariants,
  getTourGroupVariantById,
  updateTourGroupVariant,
} from "../../store/TourGroupVariant/action";
import { getCities } from "store/travelCity/action";
import {
  fetchTourGroupsByCityRequest,
} from "store/tickyourlist/travelTourGroup/action";

const optionGroup2 = [
  {
    options: [
      { label: "EN", value: "English" },
      { label: "ES", value: "Spanish" },
      { label: "IT", value: "Italian" },
      { label: "NL", value: "Dutch" },
      { label: "FR", value: "French" },
      { label: "DE", value: "German" },
    ],
  },
];

const optionGroup3 = [
  {
    options: [
      { label: "Available", value: "True" },
      { label: "Not Available", value: "False" },
    ],
  },
];

// Days of week for operating hours
const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

// Default operating hours template (all days, 9 AM - 6 PM)
const getDefaultOperatingHours = () => 
  DAYS_OF_WEEK.map(day => ({
    dayOfWeek: day.value,
    openTime: "09:00",
    closeTime: "18:00",
    enabled: true,
  }));

const AddTourGroupVariants = () => {
  document.title = "Variant Page | Scrollit";

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { variantId } = useParams();
  const [searchParams] = useSearchParams();
  const isEdit = Boolean(variantId);
  
  // Get productId from URL params when adding new variant
  const urlProductId = searchParams.get('productId');
  const urlCityCode = searchParams.get('cityCode');

  const { selectedVariant, travelTourGroups, tourGroupVariants, loading } =
    useSelector(state => state.TourGroupVariant || {});
  
  // Debug log for edit mode
  useEffect(() => {
    if (isEdit) {
      console.log('🔍 Edit mode active, variantId:', variantId);
      console.log('🔍 selectedVariant from Redux:', selectedVariant);
    }
  }, [isEdit, variantId, selectedVariant]);

  // City and Tour Group filters
  const cities = useSelector(state => state.travelCity?.cities || []);
  const tourGroupsByCity = useSelector(state => state.tourGroup?.tourGroupsByCity || []);
  const loadingFilters = useSelector(state => state.tourGroup?.loading || false);

  const [selectedCity, setSelectedCity] = useState('');
  const [selectedTourGroup, setSelectedTourGroup] = useState('');
  const [selectedMulti2, setselectedMulti2] = useState(null);
  const [selectedOpenDated, setSelectedOpenDated] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    ticketDeliveryInfo: "",
    confirmedTicketInfo: "",
    variantInfo: "",
    boosterTags: "",
    externalVariantId: "",
    status: true,
    isPrivate: false,
    isHotelPickup: false,
    hasTimeSlots: false,
    slotDurationMinutes: "",
    notAvailable: false,
    whatsappOnly: false,
  });

  // Operating Hours state
  const [operatingHours, setOperatingHours] = useState(getDefaultOperatingHours());
  const [showOperatingHours, setShowOperatingHours] = useState(false);

  // Fetch initial data
  // useEffect(() => {
  //   dispatch(getTravelTourGroups())
  //   dispatch(getTourGroupVariants())
  // }, [dispatch])

  // Fetch cities on mount
  useEffect(() => {
    dispatch(getCities());
  }, [dispatch]);

  // Restore city filter from URL params on mount
  useEffect(() => {
    const cityCodeFromUrl = searchParams.get('cityCode') || urlCityCode;
    if (cityCodeFromUrl && cities.length > 0 && !selectedCity) {
      const cityFromUrl = cities.find(c => c.cityCode === cityCodeFromUrl);
      if (cityFromUrl) {
        setSelectedCity(cityCodeFromUrl);
        // Fetch tour groups for this city
        dispatch(fetchTourGroupsByCityRequest(cityCodeFromUrl));
      }
    }
  }, [cities, searchParams, urlCityCode, dispatch, selectedCity]);

  useEffect(() => {
    if (isEdit && variantId) {
      dispatch(getTourGroupVariantById(variantId));
      dispatch(getTravelTourGroups());
    } else if (!isEdit) {
      dispatch(getTravelTourGroups());
    }
  }, [dispatch, isEdit, variantId]);

  // Fetch tour groups when city is selected
  useEffect(() => {
    if (selectedCity) {
      dispatch(fetchTourGroupsByCityRequest(selectedCity));
    }
  }, [selectedCity, dispatch]);

  // When tour group is selected, set the Product ID
  useEffect(() => {
    if (selectedTourGroup) {
      // First try to find in tourGroupsByCity (from city filter)
      let matchedProduct = tourGroupsByCity.find(
        tg => (tg._id || tg.id) === selectedTourGroup || (tg._id || tg.id)?.toString() === selectedTourGroup?.toString()
      );
      
      // If not found, try travelTourGroups (all tour groups)
      if (!matchedProduct && travelTourGroups?.length > 0) {
        matchedProduct = travelTourGroups.find(
          group => group._id === selectedTourGroup || group._id?.toString() === selectedTourGroup?.toString()
        );
      }
      
      if (matchedProduct) {
        setselectedMulti2({ 
          label: matchedProduct.name || matchedProduct.title, 
          value: matchedProduct._id || matchedProduct.id 
        });
      }
    }
  }, [selectedTourGroup, tourGroupsByCity, travelTourGroups]);

  useEffect(() => {
    if (isEdit && selectedVariant) {
      const variant = selectedVariant;
      console.log('🟢 Pre-populating form with variant:', variant);
      console.log('🟢 Variant cityCode:', variant.cityCode);
      console.log('🟢 Variant productId:', variant.productId);
      console.log('🟢 Variant product:', variant.product);
      
      // Pre-populate form data
      setFormData({
        name: variant.name || "",
        ticketDeliveryInfo: variant.ticketDeliveryInfo || "",
        confirmedTicketInfo: variant.confirmedTicketInfo || "",
        variantInfo: variant.variantInfo || "",
        boosterTags: Array.isArray(variant.boosterTags)
          ? variant.boosterTags.join(", ")
          : variant.boosterTags || "",
        externalVariantId: variant.externalVariantId || "",
        status: variant.status !== undefined ? variant.status : true,
        isPrivate: variant.isPrivate || false,
        isHotelPickup: variant.isHotelPickup || false,
        hasTimeSlots: variant.hasTimeSlots || false,
        slotDurationMinutes: variant.slotDurationMinutes || "",
        notAvailable: variant.notAvailable || false,
        whatsappOnly: variant.whatsappOnly || false,
      });

      // Pre-populate City - check multiple possible locations
      const cityCode = variant.cityCode || variant.city?.cityCode || variant.city?.code || (variant.productId && variant.productId.cityCode);
      if (cityCode) {
        console.log('🏙️ Setting city:', cityCode);
        setSelectedCity(cityCode);
        // Fetch tour groups for this city
        dispatch(fetchTourGroupsByCityRequest(cityCode));
      } else {
        console.warn('⚠️ No cityCode found in variant:', variant);
      }

      // Pre-populate Tour Group (productId) - handle both ObjectId object and string
      let productId = variant.productId;
      if (!productId && variant.product) {
        productId = variant.product._id || variant.product.id || variant.product;
      }
      
      // Convert to string if it's an ObjectId object
      if (productId) {
        const productIdStr = typeof productId === 'object' && productId._id 
          ? productId._id.toString() 
          : (typeof productId === 'object' && productId.toString 
            ? productId.toString() 
            : String(productId));
        console.log('📦 Setting tour group (productId):', productId, 'as string:', productIdStr);
        setSelectedTourGroup(productIdStr);
      } else {
        console.warn('⚠️ No productId found in variant:', variant);
      }

      setSelectedOpenDated(
        variant.openDated === true
          ? { label: "Available", value: "True" }
          : { label: "Not Available", value: "False" }
      );

      // Load operating hours if they exist
      if (variant.operatingHours && variant.operatingHours.length > 0) {
        setShowOperatingHours(true);
        // Merge existing hours with default template
        const hoursMap = new Map(
          variant.operatingHours.map(h => [h.dayOfWeek, h])
        );
        setOperatingHours(
          DAYS_OF_WEEK.map(day => {
            const existing = hoursMap.get(day.value);
            return existing
              ? { ...existing, enabled: true }
              : { dayOfWeek: day.value, openTime: "09:00", closeTime: "18:00", enabled: false };
          })
        );
      }

      // Set hasTimeSlots toggle if operating hours exist
      if (variant.hasTimeSlots !== undefined) {
        setFormData(prev => ({ ...prev, hasTimeSlots: variant.hasTimeSlots }));
      }
    }
  }, [isEdit, selectedVariant, dispatch]);

  // When tour groups are loaded in edit mode, ensure tour group is set correctly
  useEffect(() => {
    if (isEdit && selectedVariant && selectedCity && tourGroupsByCity?.length > 0 && selectedTourGroup) {
      let productId = selectedVariant.productId;
      if (!productId && selectedVariant.product) {
        productId = selectedVariant.product._id || selectedVariant.product.id || selectedVariant.product;
      }
      const productIdStr = typeof productId === 'object' && productId._id 
        ? productId._id.toString() 
        : (typeof productId === 'object' && productId.toString 
          ? productId.toString() 
          : String(productId || ''));
      
      const matchedTourGroup = tourGroupsByCity.find(
        tg => (tg._id || tg.id)?.toString() === productIdStr || (tg._id || tg.id)?.toString() === selectedTourGroup?.toString()
      );
      if (matchedTourGroup && (matchedTourGroup._id || matchedTourGroup.id)?.toString() !== selectedTourGroup?.toString()) {
        console.log('🔄 Updating selected tour group to match:', matchedTourGroup);
        setSelectedTourGroup((matchedTourGroup._id || matchedTourGroup.id).toString());
      }
    }
  }, [isEdit, selectedVariant, selectedCity, tourGroupsByCity, selectedTourGroup]);

  const productOptions = useMemo(() => {
    if (!Array.isArray(travelTourGroups)) return [];

    return travelTourGroups
      .filter(group => group.name && group._id)
      .map(group => ({
        label: group.name,
        value: group._id,
      }));
  }, [travelTourGroups]);

  const handleInputChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const createPayload = () => {
    // Filter operating hours to only include enabled days
    const enabledOperatingHours = showOperatingHours
      ? operatingHours
          .filter(h => h.enabled)
          .map(({ dayOfWeek, openTime, closeTime }) => ({
            dayOfWeek,
            openTime,
            closeTime,
          }))
      : [];

    return {
      productId: selectedMulti2?.value || selectedTourGroup,
      cityCode: selectedCity || (isEdit && selectedVariant?.cityCode),
      openDated: selectedOpenDated?.value === "True",
      name: formData.name,
      ticketDeliveryInfo: formData.ticketDeliveryInfo,
      confirmedTicketInfo: formData.confirmedTicketInfo,
      variantInfo: formData.variantInfo,
      boosterTags: formData.boosterTags
        ? formData.boosterTags
            .split(",")
            .map(tag => tag.trim())
            .filter(Boolean)
        : [],
      operatingHours: enabledOperatingHours,
      status: formData.status,
      isPrivate: formData.isPrivate,
      isHotelPickup: formData.isHotelPickup,
      hasTimeSlots: formData.hasTimeSlots || showOperatingHours,
      slotDurationMinutes: formData.slotDurationMinutes ? Number(formData.slotDurationMinutes) : undefined,
      notAvailable: formData.notAvailable,
      whatsappOnly: formData.whatsappOnly,
      externalVariantId: formData.externalVariantId ? Number(formData.externalVariantId) : undefined,
    };
  };

  const handleSubmitClick = e => {
    e.preventDefault();
    const payload = createPayload();
    dispatch(addTourGroupVariant(payload));
  };

  const handleUpdateClick = e => {
    e.preventDefault();
    const payload = createPayload();
    dispatch(updateTourGroupVariant(variantId, payload));
    // Preserve city filter from URL params
    const cityCode = searchParams.get('cityCode');
    const url = cityCode 
      ? `/tour-group-variants-data?cityCode=${cityCode}`
      : "/tour-group-variants-data";
    navigate(url);
  };

  const handleCancelClick = () => {
    // Preserve city filter from URL params
    const cityCode = searchParams.get('cityCode');
    const url = cityCode 
      ? `/tour-group-variants-data?cityCode=${cityCode}`
      : "/tour-group-variants-data";
    navigate(url);
  };

  return (
    <div className="page-content">
      <Container fluid={true}>
        <Breadcrumbs title="Forms" breadcrumbItem="Variant Page" />

        <Row>
          <Col lg="12">
            <Card>
              <CardBody>
                <h4 className="card-title mb-4">
                  {isEdit ? "Edit Variant" : "Add Variant"} Details
                </h4>
                <Form onSubmit={isEdit ? handleUpdateClick : handleSubmitClick}>
                  <Row>
                    <Col lg="6">
                      <Label>City *</Label>
                      <Select
                        isClearable
                        isSearchable
                        placeholder="Select City"
                        options={cities.map(city => ({
                          value: city.cityCode,
                          label: `${city.cityName} (${city.cityCode})`
                        }))}
                        value={selectedCity ? cities.find(c => c.cityCode === selectedCity) ? {
                          value: selectedCity,
                          label: `${cities.find(c => c.cityCode === selectedCity)?.cityName} (${selectedCity})`
                        } : null : null}
                        onChange={(option) => {
                          setSelectedCity(option?.value || '');
                          setSelectedTourGroup('');
                          setselectedMulti2(null);
                        }}
                        isDisabled={cities.length === 0 || isEdit}
                        isLoading={loadingFilters && !isEdit}
                      />
                      {isEdit && selectedVariant?.cityCode && (
                        <small className="text-muted d-block mt-1">
                          City Code: {selectedVariant.cityCode}
                        </small>
                      )}
                    </Col>

                    <Col lg="6">
                      <Label>Tour Group *</Label>
                      <Select
                        isClearable
                        isSearchable
                        placeholder={selectedCity || (isEdit && selectedCity) ? "Select Tour Group" : "Select City first"}
                        options={tourGroupsByCity.map(tg => ({
                          value: (tg._id || tg.id)?.toString(),
                          label: tg.name || tg.title
                        }))}
                        value={selectedTourGroup ? (() => {
                          const found = tourGroupsByCity.find(tg => 
                            (tg._id || tg.id)?.toString() === selectedTourGroup?.toString()
                          );
                          return found ? {
                            value: selectedTourGroup,
                            label: found.name || found.title
                          } : null;
                        })() : null}
                        onChange={(option) => {
                          setSelectedTourGroup(option?.value || '');
                        }}
                        isDisabled={!selectedCity && !isEdit || loadingFilters}
                        isLoading={loadingFilters && (selectedCity || isEdit)}
                      />
                    </Col>
                  </Row>

                  <Row className="mt-3">
                    <Col lg="6">
                      <Label>Name</Label>
                      <Input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter Name"
                      />
                    </Col>

                    <Col lg="6">
                      <Label>Product Id (Auto-filled from Tour Group)</Label>
                      <Select
                        value={selectedMulti2}
                        onChange={setselectedMulti2}
                        options={productOptions}
                        isLoading={loading}
                        placeholder={selectedMulti2 ? selectedMulti2.label : "Will be auto-filled when Tour Group is selected"}
                        isDisabled={true}
                      />
                      {isEdit && selectedVariant && (
                        <small className="text-info d-block mt-1">
                          Product ID: {selectedVariant.productId || selectedMulti2?.value || 'N/A'}
                        </small>
                      )}
                    </Col>
                  </Row>

                  <Row className="mt-3">
                    <Col lg="6">
                      <Label>TicketDeliveryInfo</Label>
                      <EditorReact
                        value={formData.ticketDeliveryInfo}
                        onChange={val =>
                          setFormData(prev => ({
                            ...prev,
                            ticketDeliveryInfo: val,
                          }))
                        }
                      />
                    </Col>
                    <Col lg="6">
                      <Label>ConfirmedTicketInfo</Label>{" "}
                      <EditorReact
                        value={formData.confirmedTicketInfo}
                        onChange={val =>
                          setFormData(prev => ({
                            ...prev,
                            confirmedTicketInfo: val,
                          }))
                        }
                      />
                    </Col>
                  </Row>

                  <Row className="mt-3">
                    <Col lg="6">
                      <Label>VariantInfo</Label>
                      <EditorReact
                        value={formData.variantInfo}
                        onChange={val =>
                          setFormData(prev => ({ ...prev, variantInfo: val }))
                        }
                      />
                    </Col>
                    <Col lg="6">
                      <Label>BoosterTags</Label>
                      <EditorReact
                        value={formData.boosterTags}
                        onChange={val =>
                          setFormData(prev => ({ ...prev, boosterTags: val }))
                        }
                      />
                    </Col>
                  </Row>

                  <Row className="mt-3">
                    <Col lg="6">
                      <Label>Open Dated</Label>
                      <Select
                        value={selectedOpenDated}
                        onChange={setSelectedOpenDated}
                        options={optionGroup3}
                      />
                    </Col>
                    <Col lg="6">
                      <Label>External Variant ID</Label>
                      <Input
                        type="number"
                        name="externalVariantId"
                        value={formData.externalVariantId}
                        onChange={handleInputChange}
                        placeholder="External source variant ID for syncing pricing"
                      />
                    </Col>
                  </Row>

                  {/* Status and Availability Section */}
                  <Row className="mt-3">
                    <Col lg="12">
                      <Card className="border">
                        <CardBody>
                          <h5 className="mb-3">Status & Availability Settings</h5>
                          <Row>
                            <Col lg="6" className="mb-3">
                              <div className="d-flex align-items-center gap-2">
                                <Switch
                                  checked={formData.status}
                                  onChange={(checked) =>
                                    setFormData(prev => ({ ...prev, status: checked }))
                                  }
                                  onColor="#86d3ff"
                                  onHandleColor="#2693e6"
                                  handleDiameter={20}
                                  uncheckedIcon={false}
                                  checkedIcon={false}
                                  boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                                  activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                                  height={24}
                                  width={48}
                                  id="statusSwitch"
                                />
                                <Label htmlFor="statusSwitch" className="mb-0" style={{ cursor: "pointer", userSelect: "none" }}>
                                  Status (Active/Inactive)
                                </Label>
                              </div>
                            </Col>
                            <Col lg="6" className="mb-3">
                              <div className="d-flex align-items-center gap-2">
                                <Switch
                                  checked={formData.notAvailable}
                                  onChange={(checked) =>
                                    setFormData(prev => ({ ...prev, notAvailable: checked }))
                                  }
                                  onColor="#86d3ff"
                                  onHandleColor="#2693e6"
                                  handleDiameter={20}
                                  uncheckedIcon={false}
                                  checkedIcon={false}
                                  boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                                  activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                                  height={24}
                                  width={48}
                                  id="notAvailableSwitch"
                                />
                                <Label htmlFor="notAvailableSwitch" className="mb-0" style={{ cursor: "pointer", userSelect: "none" }}>
                                  Not Available
                                </Label>
                              </div>
                            </Col>
                            <Col lg="6" className="mb-3">
                              <div className="d-flex align-items-center gap-2">
                                <Switch
                                  checked={formData.isPrivate}
                                  onChange={(checked) =>
                                    setFormData(prev => ({ ...prev, isPrivate: checked }))
                                  }
                                  onColor="#86d3ff"
                                  onHandleColor="#2693e6"
                                  handleDiameter={20}
                                  uncheckedIcon={false}
                                  checkedIcon={false}
                                  boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                                  activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                                  height={24}
                                  width={48}
                                  id="isPrivateSwitch"
                                />
                                <Label htmlFor="isPrivateSwitch" className="mb-0" style={{ cursor: "pointer", userSelect: "none" }}>
                                  Is Private
                                </Label>
                              </div>
                            </Col>
                            <Col lg="6" className="mb-3">
                              <div className="d-flex align-items-center gap-2">
                                <Switch
                                  checked={formData.isHotelPickup}
                                  onChange={(checked) =>
                                    setFormData(prev => ({ ...prev, isHotelPickup: checked }))
                                  }
                                  onColor="#86d3ff"
                                  onHandleColor="#2693e6"
                                  handleDiameter={20}
                                  uncheckedIcon={false}
                                  checkedIcon={false}
                                  boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                                  activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                                  height={24}
                                  width={48}
                                  id="isHotelPickupSwitch"
                                />
                                <Label htmlFor="isHotelPickupSwitch" className="mb-0" style={{ cursor: "pointer", userSelect: "none" }}>
                                  Is Hotel Pickup
                                </Label>
                              </div>
                            </Col>
                            <Col lg="6" className="mb-3">
                              <div className="d-flex align-items-center gap-2">
                                <Switch
                                  checked={formData.whatsappOnly}
                                  onChange={(checked) =>
                                    setFormData(prev => ({ ...prev, whatsappOnly: checked }))
                                  }
                                  onColor="#86d3ff"
                                  onHandleColor="#2693e6"
                                  handleDiameter={20}
                                  uncheckedIcon={false}
                                  checkedIcon={false}
                                  boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                                  activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                                  height={24}
                                  width={48}
                                  id="whatsappOnlySwitch"
                                />
                                <Label htmlFor="whatsappOnlySwitch" className="mb-0" style={{ cursor: "pointer", userSelect: "none" }}>
                                  WhatsApp Only Booking
                                </Label>
                              </div>
                            </Col>
                          </Row>
                        </CardBody>
                      </Card>
                    </Col>
                  </Row>

                  {/* Time Slots Section */}
                  <Row className="mt-3">
                    <Col lg="12">
                      <Card className="border">
                        <CardBody>
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="mb-0">
                              <i className="mdi mdi-clock-time-four-outline me-2"></i>
                              Time Slots Configuration
                            </h5>
                            <div className="d-flex align-items-center gap-2">
                              <Switch
                                checked={formData.hasTimeSlots}
                                onChange={(checked) => {
                                  setFormData(prev => ({ ...prev, hasTimeSlots: checked }));
                                  if (checked) {
                                    setShowOperatingHours(true);
                                  }
                                }}
                                onColor="#86d3ff"
                                onHandleColor="#2693e6"
                                handleDiameter={20}
                                uncheckedIcon={false}
                                checkedIcon={false}
                                boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                                activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                                height={24}
                                width={48}
                                id="hasTimeSlotsSwitch"
                              />
                              <Label
                                htmlFor="hasTimeSlotsSwitch"
                                className="mb-0"
                                style={{ cursor: "pointer", userSelect: "none" }}
                              >
                                Has Time Slots
                              </Label>
                            </div>
                          </div>
                          {formData.hasTimeSlots && (
                            <Row>
                              <Col lg="6">
                                <Label>Slot Duration (Minutes)</Label>
                                <Input
                                  type="number"
                                  name="slotDurationMinutes"
                                  value={formData.slotDurationMinutes}
                                  onChange={handleInputChange}
                                  placeholder="e.g., 30, 60, 90"
                                  min="1"
                                />
                                <small className="text-muted d-block mt-1">
                                  Duration of each time slot in minutes
                                </small>
                              </Col>
                            </Row>
                          )}
                        </CardBody>
                      </Card>
                    </Col>
                  </Row>

                  {/* Operating Hours Section */}
                  <Row className="mt-4">
                    <Col lg="12">
                      <Card className="border">
                        <CardBody>
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="mb-0">
                              <i className="mdi mdi-clock-outline me-2"></i>
                              Operating Hours
                            </h5>
                            <div className="d-flex align-items-center gap-2">
                              <Switch
                                checked={showOperatingHours}
                                onChange={(checked) => {
                                  setShowOperatingHours(checked);
                                  if (checked) {
                                    setFormData(prev => ({ ...prev, hasTimeSlots: true }));
                                  }
                                }}
                                onColor="#86d3ff"
                                onHandleColor="#2693e6"
                                handleDiameter={20}
                                uncheckedIcon={false}
                                checkedIcon={false}
                                boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                                activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                                height={24}
                                width={48}
                                id="enableOperatingHours"
                                disabled={!formData.hasTimeSlots}
                              />
                              <Label
                                htmlFor="enableOperatingHours"
                                className="mb-0"
                                style={{ cursor: formData.hasTimeSlots ? "pointer" : "not-allowed", userSelect: "none" }}
                              >
                                Enable Operating Hours {!formData.hasTimeSlots && "(Enable 'Has Time Slots' first)"}
                              </Label>
                            </div>
                          </div>

                          {showOperatingHours && (
                            <>
                              <p className="text-muted small mb-3">
                                Set the opening and closing times for each day. These times will be displayed as "Closes at X:XX" on the booking page.
                              </p>
                              <Table responsive className="table-bordered">
                                <thead className="table-light">
                                  <tr>
                                    <th style={{ width: "50px" }}>Active</th>
                                    <th style={{ width: "120px" }}>Day</th>
                                    <th>Open Time</th>
                                    <th>Close Time</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {operatingHours.map((hour, index) => (
                                    <tr key={hour.dayOfWeek}>
                                      <td className="text-center">
                                        <Input
                                          type="checkbox"
                                          checked={hour.enabled}
                                          onChange={e => {
                                            const updated = [...operatingHours];
                                            updated[index].enabled = e.target.checked;
                                            setOperatingHours(updated);
                                          }}
                                        />
                                      </td>
                                      <td>
                                        <strong>{DAYS_OF_WEEK[index].label}</strong>
                                      </td>
                                      <td>
                                        <Input
                                          type="time"
                                          value={hour.openTime}
                                          disabled={!hour.enabled}
                                          onChange={e => {
                                            const updated = [...operatingHours];
                                            updated[index].openTime = e.target.value;
                                            setOperatingHours(updated);
                                          }}
                                        />
                                      </td>
                                      <td>
                                        <Input
                                          type="time"
                                          value={hour.closeTime}
                                          disabled={!hour.enabled}
                                          onChange={e => {
                                            const updated = [...operatingHours];
                                            updated[index].closeTime = e.target.value;
                                            setOperatingHours(updated);
                                          }}
                                        />
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </Table>

                              {/* Quick Actions */}
                              <div className="d-flex gap-2 mt-2">
                                <Button
                                  color="outline-primary"
                                  size="sm"
                                  onClick={() => {
                                    setOperatingHours(
                                      operatingHours.map(h => ({ ...h, enabled: true }))
                                    );
                                  }}
                                >
                                  Enable All Days
                                </Button>
                                <Button
                                  color="outline-secondary"
                                  size="sm"
                                  onClick={() => {
                                    // Enable weekdays only (Mon-Fri)
                                    setOperatingHours(
                                      operatingHours.map(h => ({
                                        ...h,
                                        enabled: h.dayOfWeek >= 1 && h.dayOfWeek <= 5,
                                      }))
                                    );
                                  }}
                                >
                                  Weekdays Only
                                </Button>
                                <Button
                                  color="outline-info"
                                  size="sm"
                                  onClick={() => {
                                    // Set all to same time as first enabled
                                    const first = operatingHours.find(h => h.enabled);
                                    if (first) {
                                      setOperatingHours(
                                        operatingHours.map(h => ({
                                          ...h,
                                          openTime: first.openTime,
                                          closeTime: first.closeTime,
                                        }))
                                      );
                                    }
                                  }}
                                >
                                  Apply First Time to All
                                </Button>
                              </div>
                            </>
                          )}
                        </CardBody>
                      </Card>
                    </Col>
                  </Row>

                  <div className="mt-4">
                    {isEdit ? (
                      <Button type="submit" color="warning" className="me-2">
                        Update
                      </Button>
                    ) : (
                      <Button type="submit" color="primary" className="me-2">
                        Submit
                      </Button>
                    )}
                    <Button color="secondary" onClick={handleCancelClick}>
                      Cancel
                    </Button>
                  </div>
                </Form>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AddTourGroupVariants;

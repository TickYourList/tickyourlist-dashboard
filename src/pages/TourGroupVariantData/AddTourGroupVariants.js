import React, { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import CreatableSelect from "react-select/creatable";
import Select from "react-select";
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
} from "reactstrap";
import { useParams, useNavigate } from "react-router-dom";
import Breadcrumbs from "../../components/Common/Breadcrumb";

import {
  getTravelTourGroups,
  addTourGroupVariant,
  getTourGroupVariants,
  updateTourGroupVariant,
} from "../../store/TourGroupVariant/action";

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

const AddTourGroupVariants = () => {
  document.title = "Variant Page | Scrollit";

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { variantId } = useParams();
  const isEdit = Boolean(variantId);

  const { travelTourGroups, tourGroupVariants, loading } = useSelector(
    state => state.TourGroupVariant || {}
  );

  const [selectedMulti2, setselectedMulti2] = useState(null);
  const [selectedOpenDated, setSelectedOpenDated] = useState(null);
  const [boosterTags, setBoosterTags] = useState([]);
  const [boosterTagOptions, setBoosterTagOptions] = useState([
    { label: "BoosterTag1", value: "BoosterTag1" },
    { label: "BoosterTag2", value: "BoosterTag2" },
  ]);

  const [formData, setFormData] = useState({
    name: "",
    ticketDeliveryInfo: "",
    confirmedTicketInfo: "",
    variantInfo: "",
  });

  // Fetch initial data
  useEffect(() => {
    dispatch(getTravelTourGroups());
    dispatch(getTourGroupVariants());
  }, [dispatch]);

  useEffect(() => {
    if (
      isEdit &&
      tourGroupVariants?.length > 0 &&
      travelTourGroups?.length > 0
    ) {
      const variant = tourGroupVariants.find(v => v._id === variantId);
      if (variant) {
        setFormData({
          name: variant.name || "",
          ticketDeliveryInfo: variant.ticketDeliveryInfo || "",
          confirmedTicketInfo: variant.confirmedTicketInfo || "",
          variantInfo: variant.variantInfo || "",
        });

        const matchedProduct = travelTourGroups.find(
          group => group._id === variant.productId
        );

        setselectedMulti2(
          matchedProduct
            ? { label: matchedProduct.name, value: matchedProduct._id }
            : null
        );

        setSelectedOpenDated(
          variant.openDated === true
            ? { label: "Available", value: "True" }
            : { label: "Not Available", value: "False" }
        );

        const tags = (variant.boosterTags || []).map(tag => ({
          label: tag,
          value: tag,
        }));
        setBoosterTags(tags);
        setBoosterTagOptions(prev => [...prev, ...tags]);
      }
    }
  }, [isEdit, variantId, tourGroupVariants, travelTourGroups]);

  const productOptions = useMemo(() => {
    if (!Array.isArray(travelTourGroups)) return [];

    return travelTourGroups
      .filter(group => group.name && group._id)
      .map(group => ({
        label: group.name,
        value: group._id,
      }));
  }, [travelTourGroups]);

  const handleBoosterTagsChange = selected => setBoosterTags(selected || []);
  const handleCreateBoosterTag = inputValue => {
    const newOption = { label: inputValue, value: inputValue };
    setBoosterTagOptions(prev => [...prev, newOption]);
    setBoosterTags(prev => [...(prev || []), newOption]);
  };

  const handleInputChange = e =>
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const createPayload = () => ({
    productId: selectedMulti2?.value,
    boosterTags: boosterTags.map(tag => tag.value),
    openDated: selectedOpenDated?.value === "True",
    name: formData.name,
    ticketDeliveryInfo: formData.ticketDeliveryInfo,
    confirmedTicketInfo: formData.confirmedTicketInfo,
    variantInfo: formData.variantInfo,
  });

  const handleSubmitClick = e => {
    e.preventDefault();
    const payload = createPayload();
    dispatch(addTourGroupVariant(payload));
  };

  const handleUpdateClick = e => {
    e.preventDefault();
    const payload = createPayload();
    dispatch(updateTourGroupVariant(variantId, payload));
  };

  const handleCancelClick = () => {
    navigate("/tour-group-variants-data");
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
                      <Label>Product Id</Label>
                      <Select
                        value={selectedMulti2}
                        onChange={setselectedMulti2}
                        options={productOptions}
                        isLoading={loading}
                        placeholder="Select Product"
                      />
                    </Col>
                  </Row>

                  <Row className="mt-3">
                    <Col lg="6">
                      <Label>TicketDeliveryInfo</Label>
                      <Input
                        type="text"
                        name="ticketDeliveryInfo"
                        value={formData.ticketDeliveryInfo}
                        onChange={handleInputChange}
                        placeholder="Enter TicketDeliveryInfo"
                      />
                    </Col>
                    <Col lg="6">
                      <Label>ConfirmedTicketInfo</Label>
                      <Input
                        type="text"
                        name="confirmedTicketInfo"
                        value={formData.confirmedTicketInfo}
                        onChange={handleInputChange}
                        placeholder="Enter ConfirmedTicketInfo"
                      />
                    </Col>
                  </Row>

                  <Row className="mt-3">
                    <Col lg="6">
                      <Label>VariantInfo</Label>
                      <Input
                        type="text"
                        name="variantInfo"
                        value={formData.variantInfo}
                        onChange={handleInputChange}
                        placeholder="Enter VariantInfo"
                      />
                    </Col>
                    <Col lg="6">
                      <Label>BoosterTags</Label>
                      <CreatableSelect
                        isMulti={true}
                        value={boosterTags}
                        onChange={handleBoosterTagsChange}
                        onCreateOption={handleCreateBoosterTag}
                        options={boosterTagOptions}
                        placeholder="Select or Create Booster Tag"
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

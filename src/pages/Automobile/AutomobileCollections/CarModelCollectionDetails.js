import React from "react";
import update from "immutability-helper";
import { useState } from "react";
import {
  Container,
  Col,
  Row,
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  CardTitle,
  ListGroup,
  ListGroupItem,
  Input,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  CardGroup,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Alert,
  CardLink,
  Label,
  Toast,
  ToastHeader,
  ToastBody,
} from "reactstrap";
import { Link, useNavigate, useParams } from "react-router-dom";
import { HTML5Backend } from "react-dnd-html5-backend";
import { DndProvider } from "react-dnd";
import CollectionProductPreview from "./CollectionProductPreview";
import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getProductList
} from "store/actions";
import { useEffect } from "react";
import { CirclePicker, SketchPicker } from "react-color";
import IconSelector from "./IconSelector";
import { getCollections, deleteCollection, updateCollection } from "store/collections/action";
import { getCarModels } from "store/automobiles/carModels/actions";

export default function CarModelCollectionDetails() {
  const dispatch = useDispatch();
  const history = useNavigate();
  const { _id } = useParams();

  // Getting collections and carModels from store
  const { collections, carModels } = useSelector(state => ({
    collections: state.collection.collections,
    carModels: state.CarModel.carModels,
  }));

  //states for Modals
  const [modal, setModal] = useState(false);
  const [modal1, setModal1] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showIconSelector, setShowIconSelector] = useState(false);
  const [toast, setToast] = useState(false);
  const [toastDetails, setToastDetails] = useState({ title: "", message: "" });
  const toggle1 = () => setModal1(!modal1);
  const toggle2 = () => setShowIconSelector(!showIconSelector);
  const toggleToast = () => setToast(!toast);

  //states for data
  const [carModelList, setCarModelList] = useState([]);

  // Getting page specific collection from collections
  const collection = collections?.filter(collection => collection._id === _id)[0];

  // Creating a local set of values that will enable editing
  const [collectionName, setCollectionName] = useState(
    collection ? collection.name : ""
  );
  const [collectionImage, setCollectionImage] = useState(
    collection ? collection.image : ""
  );
  const [collectionImageUrl, setCollectionImageUrl] = useState(collection ? collection?.media?.url : undefined);
  const [collectionCarModelIds, setCollectionCarModelIds] = useState(
    collection ? collection.carModels.filter(model => model) : []
  );
  const [collectionColor, setCollectionColor] = useState(
    collection ? collection.color : ""
  );
  const [collectionIcon, setCollectionIcon] = useState(
    collection ? collection.icon : ""
  );

  const [carModelsToAdd, setCarModelsToAdd] = useState([]);

  // call APIs if products or collections is empty
  useEffect(() => {
    if (!carModels?.length) {
      dispatch(getCarModels());
    }
  }, [carModels]);

  useEffect(() => {
    if (!collections && !collections?.length) {
      dispatch(getCollections());
    }
  }, [collections]);

  // redirect to collections page if a wrong id is entered in the address bar by the user
  useEffect(() => {
    if (!collection && _id !== "untitled-collection") {
      console.log('datacheck');
      history("/automobile-collections");
    }
  }, [collection, carModels]);

  useEffect(() => {
    if(carModels) {
    setCarModelList(carModels);
    }
  },[carModels]);

  useEffect(() => {
    const modelsToAdd = carModels?.filter(carModel => {
      // Check if carModel._id is not in collectionCarModelIds
      return !collectionCarModelIds.some(modelId => {
        if (typeof modelId === 'object') {
          return modelId._id === carModel._id;
        } else {
          return modelId === carModel._id;
        }
      });
    });
    
    setCarModelsToAdd(
      modelsToAdd
    );
  }, [collectionCarModelIds, carModels]);

  // updating products array after drag drop action
  const moveCollectionProductPreview = useCallback((dragIndex, hoverIndex) => {
    setCollectionCarModelIds(prevCards =>
      update(prevCards, {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, prevCards[dragIndex]],
        ],
      })
    );
  }, []);

  // delete products in array
  const deleteCollectionProductPreview = useCallback(deleteIndex => {
    setCollectionCarModelIds(prevCards =>
      update(prevCards, {
        $splice: [[deleteIndex, 1]],
      })
    );
  });

  // rendering drag drop product cards
  const renderCollectionProductPreview = useCallback(
    (collectionProduct, index, carModels) => {
        // const prod = products?.find(product => product._id === collectionProduct._id);
        const prod = collectionProduct;
      return (
        <CollectionProductPreview
          key={prod?._id}
          index={index}
          id={prod?._id}
          img={prod?.media?.[0]?.url ?? prod?.media?.url}
          text={prod?.modelName}
          moveCollectionProductPreview={moveCollectionProductPreview}
          deleteCollectionProductPreview={deleteCollectionProductPreview}
          mutable={collectionName !== "All Car Models"}
        />
      );
    },
    []
  );

  // handling save action
  const handleSaveCollection = () => {
    try {
      const collection = new FormData();
      collection.append("name", collectionName ? collectionName : "Untitled Collection");
      if (collectionImage) {
        collection.append("image", collectionImage);
      } else if (collectionImageUrl) {
        collection.append('imageUrl', collectionImageUrl);
      }
      collection.append("color", collectionColor);
      collection.append("icon", collectionIcon);
      collectionCarModelIds.forEach((carModelId) => {
        if(typeof carModelId == 'object') {
          collection.append("carModels[]", carModelId._id);
        } else {
          collection.append("carModels[]", carModelId);
        }
      });
      collection.append("_id", _id);
      dispatch(
        updateCollection(collection, history, './automobile-collections')
      );
    } catch (error) {
      console.error(error);
    }
  };

  // update fuction after save collection to site is defined
  const handleSaveCollectiontoSite = () => {
    console.log("I do nothing!!");
  };

  const handleDeleteCollection = () => {
    dispatch(deleteCollection(_id, history));
  };
  const toggle = () => setModal(!modal);

  const resizeFile = file => {
    setCollectionImage(file);
  };

  const handleRemoveImage = () => {
    setCollectionImageUrl(undefined);
  };

  // if (!productList?.length) {
  //   return (
  //     <React.Fragment>
  //       <div className="page-content">
  //         <Spinner
  //           style={{
  //             position: "absolute",
  //             left: "50%",
  //             top: "50%",
  //           }}
  //         />
  //       </div>
  //     </React.Fragment>
  //   );
  // } else {
    return (
      <React.Fragment>
        <div className="page-content">
          <Container fluid className="mx-auto" style={{ maxWidth: "1300px" }}>
            <Row>
              <Col>
                <Row>
                  <Col>
                    <Link to={"/automobile-collections"}>Collections</Link> &gt;{" "}
                    {collection ? collection.name : "Untitled Car Model"}
                  </Col>
                </Row>
                <Row className="display-6 m-3">
                  {collection ? collection.name : "Untitled Car Model"}
                </Row>
              </Col>
              <Col className="h-100">
                <div className="text-sm-end align-bottom m-4">
                  <UncontrolledDropdown
                    direction="left"
                    className="d-inline mb-2 me-2 align-middle"
                  >
                    <DropdownToggle
                      outline
                      className=" btn-rounded align-middle mb-2"
                      href="#"
                    >
                      <i className="mdi mdi-dots-horizontal" />
                    </DropdownToggle>
                    <DropdownMenu className="dropdown-menu-end">
                      <DropdownItem href="#" onClick={handleSaveCollection}>
                        <i className="mdi mdi-plus text-success me-2" />
                        Add Collection to Site
                      </DropdownItem>
                      <DropdownItem
                        href="#"
                        onClick={() => {
                          handleDeleteCollection();
                        }}
                      >
                        <i className="mdi mdi-delete text-danger me-2" />
                        Delete Collection
                      </DropdownItem>
                    </DropdownMenu>
                  </UncontrolledDropdown>
                  <Button
                    type="button"
                    className="btn-rounded  mb-2 me-2"
                    outline
                    onClick={() => {
                      toggle();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    color="success"
                    className="btn-rounded  mb-2 me-2"
                    onClick={() => {
                      handleSaveCollection();
                    }}
                  >
                    Save
                  </Button>
                </div>
              </Col>
            </Row>
            <Row>
              <Col className="p-3" xs="8">
                <Card className="h-100">
                  <CardHeader>
                    <Col>
                      <Row>
                        <Col>
                          <CardTitle>Car Models in Collection</CardTitle>
                        </Col>
                        <Col>
                          <Row>
                            <CardLink
                              className="text-sm-end"
                              onClick={() => {
                                toggle1();
                              }}
                            >
                              <i className="mdi mdi-plus" /> Add Car Models
                            </CardLink>
                          </Row>
                        </Col>
                      </Row>
                    </Col>
                    <Col></Col>
                  </CardHeader>
                  <CardBody>
                    <DndProvider backend={HTML5Backend}>
                      <Row>
                        <CardGroup>
                          {collectionCarModelIds?.map((id, i) => {
                            let prod;
                            if(typeof id === 'object') {
                              prod = carModels?.find(
                                carModel => carModel._id === id._id
                              );
                            }else {
                             prod = carModels?.find(
                              carModel => carModel._id === id
                            );
                             }
                            return renderCollectionProductPreview(
                              prod,
                              i,
                              carModels
                            );
                          })}
                        </CardGroup>
                      </Row>
                    </DndProvider>
                  </CardBody>
                </Card>
              </Col>
              <Col className="p-3" xs="4">
                <Card>
                  <CardHeader>
                    <CardTitle>Collection Info</CardTitle>
                  </CardHeader>
                  <CardBody>
                    <div className="m-1">
                      <Label for="cname">Collection Name</Label>
                      <Input
                        id="cname"
                        className="m-1"
                        value={collectionName}
                        onChange={event => {
                          setCollectionName(event.target.value);
                        }}
                        disabled={_id === "all-carModels"}
                      />
                    </div>
                    <div className="m-1 mt-3">
                      <Label for="cimg">Collection Image</Label>
                      <div className="mh-50">
                        <Input
                          id="cimg"
                          onChange={async e => {
                            if (
                              ["jpeg", "jpg", "png"].includes(
                                e.target.files[0].name.split(".").pop()
                              )
                            ) {
                              setToastDetails({
                                title: "Image Uploaded",
                                message: `${e.target.files[0].name} has been uploaded.`,
                              });
                              setToast(true);
                              const image = await resizeFile(e.target.files[0]);
                            } else {
                              setToastDetails({
                                title: "Invalid image",
                                message:
                                  "Please upload images with jpg, jpeg or png extension",
                              });
                              setToast(true);
                            }
                          }}
                          type="file"
                        />
                        {collectionImageUrl && (<div style={{ position: "relative" }}> <img src={collectionImageUrl} style={{ maxWidth: "300px", maxHeight: "300px" }} /> 
                        <button
                          style={{ position: "absolute", top: 0, right: 0 }}
                          onClick={handleRemoveImage}
                        ></button>
                        </div>
                        )}
                      </div>
                    </div>
                    <div className="m-1 mt-3">
                      <Row>
                        <Col>
                          <Label for="cimg">Collection Colour</Label>
                          <div>
                            <div
                              style={{
                                padding: "5px",
                                background: "#fff",
                                borderRadius: "1px",
                                boxShadow: "0 0 0 1px rgba(0,0,0,.1)",
                                display: "inline-block",
                                cursor: "pointer",
                              }}
                              onClick={() => {
                                setShowColorPicker(!showColorPicker);
                              }}
                            >
                              <div
                                style={{
                                  width: "36px",
                                  height: "14px",
                                  borderRadius: "2px",
                                  backgroundColor: collectionColor,
                                }}
                              />
                            </div>
                            {showColorPicker ? (
                              <SketchPicker
                                width="130%"
                                color={collectionColor}
                                onChange={e => {
                                  setCollectionColor(e.hex);
                                }}
                              />
                            ) : null}
                          </div>
                        </Col>
                        <Col>
                          <Label for="cimg">Collection Icon</Label>
                          <div>
                            <i
                              onClick={() => {
                                setShowIconSelector(!showIconSelector);
                              }}
                              className={`mdi mdi-${collectionIcon}`}
                              style={{
                                fontSize: "23px",
                                cursor: "pointer",
                                padding: 0,
                                margin: 0,
                              }}
                            ></i>
                          </div>
                        </Col>
                      </Row>
                    </div>
                  </CardBody>
                  <CardFooter className="text-sm-center">
                    <Button
                      type="button"
                      color="success"
                      className="btn-rounded  m-3"
                      onClick={handleSaveCollection}
                    >
                      <i className="mdi mdi-plus me-1" />
                      Add Collection to Site
                    </Button>
                  </CardFooter>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Promote</CardTitle>
                  </CardHeader>
                  <CardBody>
                    <ListGroup flush>
                      <ListGroupItem>
                        <i className="mdi mdi-ticket me-2" />
                        Create coupon
                      </ListGroupItem>
                      <ListGroupItem>
                        <i className="mdi mdi-email-open me-2" />
                        Send email campaign
                      </ListGroupItem>
                    </ListGroup>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </Container>
          <Modal isOpen={modal} toggle={toggle}>
            <ModalHeader toggle={toggle}>Confirmation</ModalHeader>
            <ModalBody>
              <Alert color="warning">
                <i className="mdi mdi-alert-outline me-2"></i>The Changes you
                made will be lost !
              </Alert>
            </ModalBody>
            <ModalFooter>
              <Button color="secondary" onClick={toggle}>
                Go Back
              </Button>{" "}
              <Button
                color="danger"
                onClick={() => {
                  toggle();
                  history("/automobile-collections");
                }}
              >
                Discard Changes
              </Button>
            </ModalFooter>
          </Modal>
          <Modal isOpen={modal1} toggle={toggle1}>
            <ModalHeader toggle={toggle1}>Add Car Models</ModalHeader>
            <ModalBody style={{ overflowY: "scroll" }}>
              <ListGroup style={{ maxHeight: "50vh" }}>
                {/* {console.log('carmodels to add ', collectionCarModelIds)} */}
                {/* {console.log('carModelsToAdd ', carModelsToAdd)} */}
                {carModelsToAdd?.map(carModel => (
                  <ListGroupItem
                    onClick={() => {
                      setCollectionCarModelIds([
                        ...collectionCarModelIds,
                        carModel._id,
                      ]);
                    }}
                    key={carModel._id}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="d-flex">
                      <div>
                        {/* {console.log('url ', carModel.media.url)} */}
                        <img
                          style={{ maxWidth: "10vh" }}
                          src={
                            carModel.media && carModel.media?.[0]?.url
                              ? carModel.media?.[0]?.url
                              : "/default-image.jpg"
                          }
                        />
                      </div>
                      <div className="w-100 mx-3 m-2">
                        <div style={{ fontWeight: 500, fontSize: "16px" }}>
                          {carModel.modelName}
                        </div>
                        {/* <div className="mt-1">
                          {product.productItemsSummary?.productItemsCount}{" "}
                          item(s) available,{" "}
                          {
                            product.productItemsSummary
                              ?.inStockProductItemsCount
                          }{" "}
                          in stock
                        </div> */}
                      </div>
                    </div>
                  </ListGroupItem>
                ))}
              </ListGroup>
              {carModelsToAdd?.length ? null : (
                <Row>
                  <Col className="text-sm-center">
                    This category includes all of the available car models.
                  </Col>
                </Row>
              )}
            </ModalBody>
            <ModalFooter>
              <Button color="secondary" onClick={toggle1}>
                Close
              </Button>
            </ModalFooter>
          </Modal>
          <Modal isOpen={showIconSelector} toggle={toggle2}>
            <ModalHeader toggle={toggle2}>Icon Selector</ModalHeader>
            <ModalBody>
              <IconSelector
                setShowIconSelector={setShowIconSelector}
                collectionIcon={collectionIcon}
                setCollectionIcon={setCollectionIcon}
              />
            </ModalBody>
            <ModalFooter>
              <Button color="secondary" onClick={toggle2}>
                Close
              </Button>
            </ModalFooter>
          </Modal>
          <div
            className="position-fixed top-0 end-0 p-3"
            style={{ zIndex: "1005" }}
          >
            <Toast isOpen={toast}>
              <ToastHeader toggle={toggleToast}>
                {toastDetails.title}
              </ToastHeader>
              <ToastBody>{toastDetails.message}</ToastBody>
            </Toast>
          </div>
        </div>
      </React.Fragment>
    );
  // }
}

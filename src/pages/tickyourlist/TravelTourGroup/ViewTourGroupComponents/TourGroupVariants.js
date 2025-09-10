import React, { useEffect } from "react"
import { useSelector } from "react-redux"
import { useDispatch } from "react-redux"
import { useParams } from "react-router-dom"
import { Button, Card, CardText, CardTitle } from "reactstrap"
import { fetchTourGroupByIdRequest } from "../../../../store/actions"

export default function TourGroupVariants({ isViewing }) {
  const Actions = [
    { icon: "fas fa-edit", btnName: "Edit Variant", iconColor: "text-success" },
    {
      icon: "fas fa-calendar-alt",
      btnName: "Manage Pricing",
      iconColor: "text-info",
    },
    {
      icon: "fas fa-money-bill-wave",
      btnName: "View Booking",
      iconColor: "text-success",
    },
    {
      icon: "fas fa-clone",
      btnName: "Duplicate Variant",
      iconColor: "text-primary",
    },
    {
      icon: "fas fa-trash",
      btnName: "Delete Variant",
      iconColor: "text-danger",
    },
  ]
  const { id } = useParams()
  const dispatch = useDispatch()
  const tourGroup = useSelector(state => state.tourGroup?.tourGroupById)

  useEffect(() => {
    dispatch(fetchTourGroupByIdRequest(id))
  }, [])
  return (
    <React.Fragment>
      <div className={`${isViewing ? "" : "page-content"}`}>
        {tourGroup.variants?.length === 0 ? (
          <h4>No variant data present</h4>
        ) : (
          tourGroup.variants?.map(variant => (
            <Card key={variant._id} className="p-2 border rounded ">
              <div className="d-flex justify-content-between m-0">
                <div className="w-50">
                  <div className="d-flex align-items-center justify-content-between mb-3 ">
                    <CardTitle className="fs-3 mb-0 text-primary">
                      <strong>{variant.name}</strong>
                    </CardTitle>
                    <CardText className="mb-0">
                      {variant.status ? (
                        <Button
                          type="button"
                          className="btn btn-soft-success btn-rounded waves-effect waves-light"
                        >
                          Active
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          className="btn btn-soft-danger btn-rounded waves-effect waves-light"
                        >
                          InActive
                        </Button>
                      )}
                    </CardText>
                  </div>

                  <div className="d-flex">
                    <CardText className="text-primary text-soft">
                      {variant.tours[0]?.name}
                    </CardText>{" "}
                    <CardText className="text-success">
                      <i className="mdi mdi-map-marker"></i>{" "}
                      {tourGroup.city?.name}
                    </CardText>
                  </div>

                  <div className="d-flex flex-wrap ">
                    {variant.listingPrice?.prices?.map(variantPrice => (
                      <Card
                        key={variantPrice._id}
                        className=" bg-soft bg-primary p-1 m-1"
                        style={{ width: "45%" }}
                      >
                        <CardTitle>{variantPrice.type}</CardTitle>

                        <CardText>
                          <span className="text-primary">
                            <b>
                              {" "}
                              {tourGroup.city?.country?.currency?.symbol}{" "}
                              {variantPrice.finalPrice}
                            </b>
                          </span>
                          {"  "}
                          <span
                            style={{
                              textDecoration: "line-through",
                              color: "white",
                            }}
                          >
                            {tourGroup.city?.country?.currency?.symbol}{" "}
                            {variantPrice.originalPrice}
                          </span>
                        </CardText>
                      </Card>
                    ))}
                  </div>
                </div>
                <div className="w-50 d-flex align-items-center justify-content-center h-100">
                  <Card
                    className="align-items-start p-3 bg-light border shadow-sm rounded-3"
                    style={{
                      width: "75%",

                      textAlign: "justify",
                    }}
                  >
                    <CardTitle className="mb-3 fs-5 text-primary">
                      Quick Actions
                    </CardTitle>

                    {Actions.map(action => (
                      <CardText key={action.btnName} className="m-2 w-100">
                        <Button className="w-100 border-0 bg-white text-dark d-flex align-items-center justify-content-start gap-2 px-3 py-2 shadow-sm rounded">
                          <i
                            className={`${action.icon}  ${action.iconColor}`}
                          />
                          {action.btnName}
                        </Button>
                      </CardText>
                    ))}
                  </Card>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </React.Fragment>
  )
}

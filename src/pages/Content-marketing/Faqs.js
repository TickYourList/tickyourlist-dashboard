import React, { useEffect } from "react"
import { Button, Container } from "reactstrap"
import { useDispatch, useSelector } from "react-redux"
import { getFaqsList } from "../../store/faqs/actions"
import { getDashboardPermission } from "../../store/dashboard-sub-admin/actions"
import Breadcrumbs from "components/Common/Breadcrumb"
import TableContainer from "../../components/Common/TableContainer"
import "./faqs.scss"
import { useNavigate } from "react-router-dom"

const FaqsList = () => {
  document.title = "FAQs | Content & Marketing"
  const dispatch = useDispatch()
  const navigate = useNavigate()

  // access reducer directly
  const { faqs, loading, error } = useSelector(state => state.faqsReducer)

  const authUser = JSON.parse(localStorage.getItem("authUser"))?.data
  const userID = authUser?.user?._id
  const role = authUser?.user?.roles[0].code
  // console.log(userID, role)

  const { permissions } = useSelector(state => state.DashboardPermissions || {})
  // console.log(permissions)

  useEffect(() => {
    // Avoid refetching if permissions already exist in Redux
    if (!permissions || permissions.length === 0) {
      dispatch(getDashboardPermission(userID))
    }
  }, [dispatch, permissions, userID])

  useEffect(() => {
    dispatch(getFaqsList())
  }, [dispatch])

  const travelFaqsPermission =
    role === "ADMIN"
      ? {
          module: "tylTravelFaqs",
          canAdd: true,
          canEdit: true,
          canView: true,
          canDelete: true,
        }
      : (Array.isArray(permissions)
          ? permissions.find(module => module.module === "tylTravelFaqs")
          : {}) || {}

  const canAddFaqs = travelFaqsPermission?.canAdd
  const canEditFaqs = travelFaqsPermission?.canEdit
  const canViewFaqs = travelFaqsPermission?.canView
  const canDeleteFaqs = travelFaqsPermission?.canDelete

  const handleAddNewFaqsClick = () => {
    navigate("/add-new-faqs")
    console.log("Faqs button clicked")
  }

  const columns = [
    {
      Header: "City Name",
      accessor: row => row.city?.displayName || "N/A",
    },
    {
      Header: "Country Name",
      accessor: row => row.city?.country || "N/A",
    },
    {
      Header: "Total FAQs",
      accessor: row => row.faqs?.length || 0,
    },
    {
      Header: "Status",
      accessor: row => (row.status ? "Published" : "Not Published"),
    },
    {
      Header: "View FAQ Details",
      Cell: ({ row }) => (
        <Button
          color="primary"
          className="btn-rounded"
          style={{ width: "100px" }}
          onClick={() => {
            console.log("View Faqs Details:", row.original._id)
          }}
        >
          View
        </Button>
      ),
    },
    {
      Header: "Action",
      Cell: ({ row }) => (
        // <div className="d-flex gap-2">
        //   <Button
        //     color="primary"
        //     size="sm"
        //     onClick={() => console.log("Edit clicked", row.original)}
        //   >
        //     Edit
        //   </Button>
        //   <Button
        //     color="danger"
        //     size="sm"
        //     onClick={() => console.log("Delete clicked", row.original)}
        //   >
        //     Delete
        //   </Button>
        // </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {canEditFaqs && (
            <button
              style={{ border: "none", background: "transparent", padding: 0 }}
              onClick={() => {
                console.log("Edit Faqs", row.original._id)
              }}
            >
              <i
                className="bx bxs-pencil"
                style={{ fontSize: "20px", color: "#34c38f" }}
              />
            </button>
          )}
          {canDeleteFaqs && (
            <button
              style={{ border: "none", background: "transparent", padding: 0 }}
              onClick={() => {
                console.log("Delete Faqs", row.original._id)
              }}
            >
              <i
                className="mdi mdi-delete"
                style={{ fontSize: "20px", color: "#f46a6a" }}
              />
            </button>
          )}
        </div>
      ),
    },
  ]

  if (!canViewFaqs) {
    return (
      <div className="page-content">
        <Container
          fluid
          className="d-flex justify-content-center align-items-center"
          style={{ height: "70vh" }}
        >
          <div
            className="alert alert-danger text-center w-100"
            style={{ maxWidth: "600px" }}
          >
            <h5 className="mb-3">Permission Required!</h5>
            <p className="mb-2">
              You do not have permission to access this page. If you believe
              this is a mistake, please contact your administrator.
            </p>
            <p className="mb-0">
              Click{" "}
              <a
                href="/dashboard"
                className="text-primary text-decoration-underline"
              >
                here
              </a>{" "}
              to return to the homepage or navigate to a page you have access
              to.
            </p>
          </div>
        </Container>
      </div>
    )
  }

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs title="Content & Marketing" breadcrumbItem="FAQs" />

        <div className="faqs-list-page">
          <TableContainer
            columns={columns}
            data={faqs || []}
            isGlobalFilter
            isAddNewFaqsOption={canAddFaqs}
            handleAddNewFaqsClick={handleAddNewFaqsClick}
            isPagination
            customPageSize={10}
            className="custom-header-css"
          />
        </div>
      </Container>
    </div>
  )
}

export default FaqsList

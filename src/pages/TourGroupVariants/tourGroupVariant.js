import React, { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { getTourGroupVariants } from "store/TourGroupVariant/action"
import TableContainer from "components/Common/TableContainer"
import { Link } from "react-router-dom"
import {
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap"
import { Edit, DollarSign, Eye, Copy, Trash2, MoreVertical } from "lucide-react"

const TourGroupVariant = () => {
  const dispatch = useDispatch()

  const { tourGroupVariants = [] } = useSelector(
    state => state.TourGroupVariant || {}
  )

  useEffect(() => {
    dispatch(getTourGroupVariants())
  }, [dispatch])

  const columns = [
    {
      Header: "Variant Name",
      accessor: "name",
    },
    {
      Header: "Tour Name",
      accessor: "tourName",
      Cell: ({ row }) => {
        const variantName = row.original?.name || "Unnamed Variant"
        const tourId = row.original?.tourId || "#"
        return (
          <Link
            to={`/tours/${tourId}`}
            className="text-primary text-decoration-underline"
          >
            {variantName}
          </Link>
        )
      },
    },
    {
      Header: "City Code",
      accessor: "cityCode",
    },
    {
      Header: "Price",
      accessor: "price",
      Cell: ({ value }) => `₹ ${parseFloat(value || 0).toFixed(2)}`,
    },
    {
      Header: "Status",
      accessor: "status",
      Cell: ({ value }) => (
        <span className={`badge ${value ? "bg-success" : "bg-secondary"}`}>
          {value ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      Header: "Action",
      Cell: ({ row }) => (
        <UncontrolledDropdown>
          <DropdownToggle tag="button" className="btn btn-light btn-sm">
            <MoreVertical size={16} />
          </DropdownToggle>
          <DropdownMenu end>
            <DropdownItem tag={Link} to={`/edit-variant/${row.original._id}`}>
              <Edit size={14} className="me-2" /> Edit Variant
            </DropdownItem>
            <DropdownItem tag={Link} to={`/manage-pricing/${row.original._id}`}>
              <DollarSign size={14} className="me-2" /> Manage Pricing
            </DropdownItem>
            <DropdownItem tag={Link} to={`/view-bookings/${row.original._id}`}>
              <Eye size={14} className="me-2" /> View Bookings
            </DropdownItem>
            <DropdownItem
              onClick={() => console.log("Duplicate", row.original)}
            >
              <Copy size={14} className="me-2" /> Duplicate Variant
            </DropdownItem>
            <DropdownItem divider />
            <DropdownItem
              className="text-danger"
              onClick={() => console.log("Delete", row.original)}
            >
              <Trash2 size={14} className="me-2" /> Delete Variant
            </DropdownItem>
          </DropdownMenu>
        </UncontrolledDropdown>
      ),
    },
  ]

  return (
    <div className="page-content">
      <h4 className="mb-3">Tour Group Variants</h4>
      <TableContainer
        columns={columns}
        data={tourGroupVariants}
        isGlobalFilter={true}
        customPageSize={10}
        className="custom-header-css"
      />
    </div>
  )
}

export default TourGroupVariant

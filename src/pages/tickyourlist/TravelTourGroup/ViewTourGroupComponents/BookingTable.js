import TableContainer from "components/Common/TableContainer"
import React, { useEffect, useMemo } from "react"
import { useSelector } from "react-redux"
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { getTourGroupBookingDetailRequest } from "store/actions"
import { showToastSuccess } from "helpers/toastBuilder"
export default function BookingTable({ bookingId }) {
  const id = bookingId
  const dispatch = useDispatch()
  const bookingTourGroupById = useSelector(
    state => state.tourGroup?.bookingTourGroupById
  )

  useEffect(() => {
    dispatch(getTourGroupBookingDetailRequest(id))
  }, [])
  const navigate = useNavigate()
  /* console.log(bookingTourGroupById) */
  const handleEdit = id => {
    showToastSuccess("Edit Triggered")
  }

  const handleViewDetails = id => {
    showToastSuccess("View Triggered")
  }

  const handleDelete = row => {
    showToastSuccess("Delete Triggered")
  }

  const columns = useMemo(
    () => [
      {
        Header: "Customer",
        accessor: "customerName",

        Cell: ({ row }) => (
          <span className="text-black fw-bold">
            {row.original.customerName}
          </span>
        ),

        filterable: true,
      },
      {
        Header: "Tour",
        accessor: "tourGroupById.name",
        Cell: ({ row }) => <span>{row.original.tourGroupId?.name || "—"}</span>,
        filterable: true,
      },
      {
        Header: "Date",
        accessor: "bookingDate",
        Cell: ({ row }) => {
          const value = row.original.bookingDate

          return <span>{value ? ` ${value}` : "N/A"}</span>
        },
        filterable: true,
      },
      {
        Header: "Guests ",
        accessor: "guestsCount",
        Cell: ({ row }) => {
          const value = row.original.guestsCount

          return <span>{value ? ` ${value}` : "N/A"}</span>
        },
        filterable: true,
      },
      {
        Header: "Amount ",
        accessor: "amount",
        Cell: ({ row }) => {
          const value = row.original.amount
          const currency = row.original.currency || "$"

          return <span>{value ? `${currency} ${value}` : "N/A"}</span>
        },
        filterable: true,
      },
      {
        Header: "Status",
        accessor: "status",
        Cell: ({ value }) => {
          let colorClassName = "bg-secondary"
          let dispalayText = value

          if (value === "CONFIRMED") {
            colorClassName = "bg-success"
          } else if (value === "PENDING") {
            colorClassName = "bg-warning"
          } else if (value === "CANCELLED") {
            colorClassName = "bg-warning"
          }

          return (
            <span className={`badge rounded-pill ${colorClassName}`}>
              {dispalayText}
            </span>
          )
        },
        filterable: true,
      },

      {
        Header: "Actions",
        Cell: ({ row }) => (
          <div className="d-flex align-items-center justify-content-center gap-4">
            <button
              className="btn p-0 border-0 bg-transparent"
              title="Edit"
              onClick={() => {
                handleEdit(row.original._id)
              }}
            >
              <i className="fas fa-edit font-size-18 text-success"></i>
            </button>
            <button
              className="btn p-0 border-0 bg-transparent"
              title="view"
              onClick={() => {
                handleViewDetails(row.original._id)
              }}
            >
              <i className="fas fa-eye font-size-18 text-primary"></i>
            </button>

            <button
              className="btn p-0 border-0 bg-transparent"
              title="Delete"
              onClick={() => handleDelete(row.original)}
            >
              <i className="fas fa-trash font-size-18 text-danger"></i>
            </button>
          </div>
        ),
      },
    ],
    [navigate]
  )
  return (
    <React.Fragment>
      <div>
 
       {bookingTourGroupById.length > 0 ? (
          <TableContainer
            columns={columns}
            data={bookingTourGroupById || []}
            customPageSize={10}
          />
        ) : (
          <h1>No Booking Data Available</h1>
        )}
      </div>
    </React.Fragment>
  )
}

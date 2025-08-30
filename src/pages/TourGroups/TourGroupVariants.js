import React, { useEffect, useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Link,
  TablePagination,
} from "@mui/material"
import EditIcon from "@mui/icons-material/Edit"
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn"
import BookOnlineIcon from "@mui/icons-material/BookOnline"
import ContentCopyIcon from "@mui/icons-material/ContentCopy"
import DeleteIcon from "@mui/icons-material/Delete"
import { get } from "../../helpers/api_helper"

const TourGroupVariants = () => {
  const [variants, setVariants] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  useEffect(() => {
    setLoading(true)
    get("/v1/tyltraveltourgroupvariant/list")
      .then(res => {
        setVariants(res.data || [])
      })
      .catch(() => setVariants([]))
      .finally(() => setLoading(false))
  }, [])

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = event => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  return (
    <Paper>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Variant Name</TableCell>
              <TableCell>Tour Name</TableCell>
              <TableCell>City</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6}>Loading...</TableCell>
              </TableRow>
            ) : (
              variants
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map(variant => (
                  <TableRow key={variant._id}>
                    <TableCell>{variant.name}</TableCell>
                    <TableCell>
                      <Link
                        href={variant.tour?.link || "#"}
                        target="_blank"
                        rel="noopener"
                      >
                        {variant.tour?.name || "-"}
                      </Link>
                    </TableCell>
                    <TableCell>{variant.tour?.city || "-"}</TableCell>
                    <TableCell>
                      {variant.listingPrice?.prices?.[0]?.finalPrice
                        ? `₹${variant.listingPrice.prices[0].finalPrice}`
                        : "-"}
                    </TableCell>
                    <TableCell>{variant.status || "-"}</TableCell>
                    <TableCell>
                      <Tooltip title="Edit Variant">
                        <IconButton>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Manage Pricing">
                        <IconButton>
                          <MonetizationOnIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="View Bookings">
                        <IconButton>
                          <BookOnlineIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Duplicate Variant">
                        <IconButton>
                          <ContentCopyIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Variant">
                        <IconButton>
                          <DeleteIcon color="error" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={variants.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50]}
      />
    </Paper>
  )
}

export default TourGroupVariants

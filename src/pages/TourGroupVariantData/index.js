import React, { useEffect, useMemo, useState } from "react";
import { Button, Container } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { getTourGroupVariants } from "../../store/TourGroupVariant/action";

import Breadcrumbs from "components/Common/Breadcrumb";
import TableContainer from "components/Common/TableContainer";

import "./index.scss";

const TourGroupVariantsTable = () => {
  document.title = "Tour Group Variants | Scrollit";

  const dispatch = useDispatch();
  const { tourGroupVariants, totalRecords, loading } = useSelector(
    state => state.TourGroupVariant
  );
  console.log(totalRecords);
  // console.log("Tour Group Variants:", tourGroupVariants);

  const [page, setPage] = useState(
    () => Number(localStorage.getItem("variantPage")) || 1
  );
  const [limit, setLimit] = useState(
    () => Number(localStorage.getItem("variantLimit")) || 10
  );

  const total = totalRecords || 0;

  useEffect(() => {
    dispatch(getTourGroupVariants(page, limit));
  }, [dispatch, page, limit]);

  useEffect(() => {
    localStorage.setItem("variantPage", page);
  }, [page]);

  useEffect(() => {
    localStorage.setItem("variantLimit", limit);
  }, [limit]);

  const processedVariants = Array.isArray(tourGroupVariants)
    ? tourGroupVariants.map(row => ({
        ...row,
        name: row.name || "-",
        tourName: row.name || "-",
        city: row.city || "-",
        cityCode: row.cityCode || "-",
        status: row.status ? "Active" : "Inactive",
      }))
    : [];

  const navigate = useNavigate();
  const handleAddTourGroupVariantClicks = () => {
    navigate("add-tour-group-variants");
  };

  const handleEditButtonClick = variantId => {
    console.log("Editing variant with ID:", variantId);
    navigate(`/tour-group-variants/edit/${variantId}`);
  };

  const columns = useMemo(
    () => [
      {
        Header: "Variant Name",
        accessor: "name",
      },
      {
        Header: "Tour Name",
        accessor: "name",
        Cell: ({ row }) => (
          <a href="#" style={{ color: "blue", textDecoration: "underline" }}>
            {row.original.name}
          </a>
        ),
        id: "tourName",
      },
      {
        Header: "City",
        accessor: row => {
          const city = row.city || "-";
          return city;
        },
        id: "cityName",
      },
      {
        Header: "City Code",
        accessor: row => {
          const cityCode = row.cityCode || "-";
          return cityCode;
        },
        id: "cityCode",
      },
      {
        Header: "Price",
        accessor: row =>
          row?.listingPrice?.prices?.[0]?.finalPrice
            ? `₹${row.listingPrice.prices[0].finalPrice}`
            : "-",
        id: "price",
      },
      {
        Header: "Status",
        Cell: ({ row }) => (
          <span
            className={`badge ${
              row.original.notAvailable ? "bg-danger" : "bg-success"
            } text-white`}
          >
            {row.original.notAvailable ? "Inactive" : "Active"}
          </span>
        ),
        id: "status",
      },
      {
        Header: "Actions",
        Cell: ({ row }) => (
          <div className="d-flex justify-content-center gap-2">
            <Button
              style={{ border: "none", background: "transparent", padding: 0 }}
              onClick={() => handleEditButtonClick(row.original._id)}
            >
              <i
                className="bx bxs-pencil"
                title="Edit"
                style={{ color: "#34c38f", fontSize: "18px" }}
              ></i>
            </Button>

            <i className="bx bx-money cursor-pointer" title="Pricing" />
            <i className="bx bx-book-content cursor-pointer" title="Bookings" />
            <i className="bx bx-copy cursor-pointer" title="Duplicate" />
            <i
              className="bx bx-trash text-danger cursor-pointer"
              title="Delete"
            />
          </div>
        ),
        id: "actions",
      },
    ],
    [navigate]
  );

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs title="Tour Groups" breadcrumbItem="Group Variants" />
        <div className="variant-list-page">
          <TableContainer
            columns={columns}
            data={processedVariants}
            isGlobalFilter={true}
            isFilterable={true}
            isAddOptions={false}
            isAddTourGroupVariantOptions={true}
            handleAddTourGroupVariantClicks={handleAddTourGroupVariantClicks}
            customPageSize={limit}
            isCustomPagination={true}
            currentPage={page}
            totalRecords={total}
            pageLimit={limit}
            onCustomPageChange={newPage => setPage(newPage)}
            onCustomPageSizeChange={newLimit => {
              setLimit(newLimit);
              setPage(1);
            }}
            isLoading={loading}
            className="custom-header-css"
          />
        </div>
      </Container>
    </div>
  );
};

export default TourGroupVariantsTable;

import React, { useState, useEffect } from "react";
import { Modal, ModalHeader, ModalBody, Button } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  viewTravelCategoryDetailsRequest,
  fetchCategoryToursRequest,
  fetchCategorySubcategoriesRequest,
  fetchCategoryBookingsRequest
} from "../../store/travelCategories/actions";
import { usePermissions, MODULES, ACTIONS } from '../../helpers/permissions';


const ViewCategoryModal = ({ isOpen, toggle, category, onEdit }) => {
  if (!category) return null;
  const dispatch = useDispatch();
  const navigate = useNavigate()
  const { can } = usePermissions();
  const handleSubCategorySortClick = () => {
    navigate(`/sub-categories/${category._id}/sort`);
  }

  const [activeTab, setActiveTab] = useState("overview");
  const [tourPage, setTourPage] = useState(1);
  const [subCatPage, setSubCatPage] = useState(1);
  const [bookingPage, setBookingPage] = useState(1);

  const pageSize = 10;

  // Pagination helpers
  const paginate = (data, page) => {
    const start = (page - 1) * pageSize;
    return data.slice(start, start + pageSize);
  };


  const { viewCategory, tours, toursLoading,
    subCategories, subCategoriesLoading,
    bookings, bookingsLoading } = useSelector((state) => state.travelCategory);

  useEffect(() => {
    if (isOpen && category?._id) {
      dispatch(viewTravelCategoryDetailsRequest(category._id));
    }
  }, [isOpen, category, dispatch]);

  useEffect(() => {
    if (isOpen) {
      setActiveTab("overview");
    }
  }, [isOpen]);

  const categoryData = viewCategory || category;

  const [tourSearch, setTourSearch] = useState({ id: "", name: "" });
  const [subCatSearch, setSubCatSearch] = useState({ id: "", name: "", city: "" });
  const [bookingSearch, setBookingSearch] = useState({
    id: "",
    name: "",
    phone: "",
    guests: "",
    tour: "",
    date: "",
    price: "",
    amount: ""
  });

  const filteredTours = tours.filter(tour =>
    tour?.id?.toString().toLowerCase().includes(tourSearch.id.toLowerCase()) &&
    tour?.name?.toLowerCase().includes(tourSearch.name.toLowerCase()) &&
    (tourSearch.status === "" || (tour.status ? "active" : "inactive").includes(tourSearch.status.toLowerCase()))
  );

  const filteredSubCategories = subCategories.filter(sub =>
    sub?.id?.toString().toLowerCase().includes(subCatSearch.id.toLowerCase()) &&
    sub?.name?.toLowerCase().includes(subCatSearch.name.toLowerCase()) &&
    sub?.cityCode?.toLowerCase().includes(subCatSearch.city.toLowerCase())
  );

  const filteredBookings = bookings.filter((booking) =>
    (booking?._id?.toString().toLowerCase() || "").includes((bookingSearch.id || "").toLowerCase()) &&
    (booking?.customerName?.toLowerCase() || "").includes((bookingSearch.name || "").toLowerCase()) &&
    (
      `${booking?.phoneCode || ""} ${booking?.phoneNumber || ""}`.toLowerCase() +
      (booking?.email || "").toLowerCase()
    ).includes((bookingSearch.phone || "").toLowerCase()) &&
    (booking?.guestsCount?.toString() || booking?.adultsCount?.toString() || "")
      .toLowerCase()
      .includes((bookingSearch.guests || "").toLowerCase()) &&
    (booking?.tourGroupId?.name?.toLowerCase() || "").includes((bookingSearch.tour || "").toLowerCase()) &&
    (booking?.bookingDate
      ? new Date(booking.bookingDate).toLocaleDateString().toLowerCase()
      : ""
    ).includes((bookingSearch.date || "").toLowerCase()) &&
    (booking?.guestPrice?.toString() || booking?.amount?.toString() || "")
      .toLowerCase()
      .includes((bookingSearch.price || "").toLowerCase()) &&
    (booking?.amount?.toString() || "")
      .toLowerCase()
      .includes((bookingSearch.amount || "").toLowerCase()) &&
    ((bookingSearch.status || "") === "" ||
      (booking?.status?.toLowerCase() || "").includes((bookingSearch.status || "").toLowerCase()))
  );

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (tab === "tours") setTourPage(1);
    if (tab === "subCategories") setSubCatPage(1);
    if (tab === "bookings") setBookingPage(1);

    if (tab === "tours") {
      setTourSearch({ id: "", name: "", status: "" });
    } else if (tab === "subCategories") {
      setSubCatSearch({ id: "", name: "", city: "" });
    } else if (tab === "bookings") {
      setBookingSearch({ id: "", name: "", phone: "", tour: "", date: "", status: "" });
    }
    if (!viewCategory?._id) return;
    switch (tab) {
      case "tours":
        dispatch(fetchCategoryToursRequest(viewCategory._id));
        break;
      case "subCategories":
        dispatch(fetchCategorySubcategoriesRequest(viewCategory._id));
        break;
      case "bookings":
        dispatch(fetchCategoryBookingsRequest(viewCategory._id));
        break;
      default:
        break;
    }
  };

  const {
    name = "Category Name",
    metaDescription = "N/A",
    averageRating = 0,
    isActive = true,
    _id = "",
    medias = [],
    counts: {
      toursCount: totalTours = 0,
      subcategoryCount: subCategoriesCount = 0,
      totalBookingsCount: totalBookings = 0
    } = {},
  } = categoryData;
  const imageUrl = medias?.[0]?.url || "https://via.placeholder.com/100";

  return (
    <Modal
      isOpen={isOpen}
      toggle={toggle}
      size="xl"
      style={{ maxWidth: "1200px", width: "95%" }}
    >
      <ModalHeader toggle={toggle}>Category Overview - {name}</ModalHeader>
      <ModalBody className="p-0" style={{ maxHeight: "80vh", overflowY: "auto", paddingBottom: 0 }}>
        {/* Top Section */}
        <div className="d-flex justify-content-between align-items-start mb-4 p-3">
          <div className="d-flex">
            <img src={imageUrl} alt="Category" style={{ width: "300px", height: "300px", borderRadius: "8px", objectFit: "cover", marginRight: "20px" }} />
            <div style={{ flex: 1 }}>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h1 className="display-7 fw-bold mb-1 me-3">{name}</h1>
                <Button color="success" size="lg" className="rounded-pill" onClick={() => onEdit(_id)}>
                  <i className="fas fa-edit me-1"></i>Edit
                </Button>
              </div>
              <p className="text-muted mb-1" style={{ fontSize: "1.1rem" }}>
                <i className="fas fa-map-marker-alt me-2 text-danger"></i>{categoryData.cityCode || "N/A"}
              </p>
              <p className="text-muted mb-1">{metaDescription}</p>
              <span className={`badge bg-${isActive ? "success" : "danger"}`} style={{ fontSize: "0.9rem", padding: "8px 12px" }}>
                {isActive ? "Active" : "Inactive"}
              </span>

              {/* Cards */}
              <div className="d-flex gap-4 mt-4 flex-wrap">
                {[
                  { value: totalTours, label: "Total Tours", color: "primary" },
                  { value: subCategoriesCount, label: "Sub Categories", color: "success" },
                  { value: totalBookings, label: "Bookings", color: "warning" },
                  { value: averageRating, label: "Avg. Rating", color: "info" }
                ].map((card, idx) => (
                  <div key={idx} className="bg-light p-4 rounded text-center" style={{ minWidth: "150px" }}>
                    <h4 className={`fw-bold text-${card.color} mb-1`}>{card.value}</h4>
                    <p className="text-muted mb-0">{card.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Tabs */}
        <div className="mt-4 bg-white border-bottom" style={{ position: "sticky", top: 0, zIndex: 10, padding: "0 1rem", marginBottom: 0 }}>
          <ul className="nav nav-tabs" style={{ borderBottom: "2px solid #dee2e6" }}>
            {["overview", "tours", "subCategories", "bookings", "analytics"].map((tab) => (
              <li key={tab} className="nav-item">
                <a href="#" className={`nav-link ${activeTab === tab ? "text-primary fw-bold text-decoration-underline" : "text-black"}`}
                  style={{ padding: "12px 20px", fontSize: "1rem" }}
                  onClick={(e) => { e.preventDefault(); handleTabClick(tab); }}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1).replace(/([A-Z])/g, ' $1')}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Content Area */}
        <div className="px-3" style={{ marginTop: 0 }}>
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="p-4 bg-light rounded">
              <h4 className="fw-bold mb-4">Category Details</h4>
              <table className="table table-bordered table-striped" style={{ fontSize: "1rem" }}>
                <tbody>
                  {[
                    ["Heading", categoryData.heading],
                    ["Meta Title", categoryData.metaTitle],
                    ["Meta Description", categoryData.metaDescription],
                    ["Canonical URL", categoryData.canonicalUrl],
                    ["No Index", String(categoryData.noIndex)],
                    ["Micro Brand Meta Title", categoryData.microBrandInfo?.metaTitle],
                    ["Micro Brand Meta Description", categoryData.microBrandInfo?.metaDescription],
                    ["Descriptors", categoryData.microBrandInfo?.descriptors],
                    ["Highlights", categoryData.microBrandInfo?.highlights]
                  ].map(([label, value], idx) => (
                    <tr key={idx}>
                      <th style={{ width: "250px", padding: "12px" }}>{label}</th>
                      <td style={{ padding: "12px" }}>{value || "N/A"}</td>
                    </tr>
                  ))}
                  <tr>
                    <th style={{ padding: "12px" }}>URL Slugs</th>
                    <td style={{ padding: "12px" }}>
                      {categoryData.urlSlugs && Object.keys(categoryData.urlSlugs).length > 0 ? (
                        <ul className="mb-0 ps-3">
                          {Object.entries(categoryData.urlSlugs).map(([lang, slug]) => (
                            <li key={lang}><strong>{lang}:</strong> {slug}</li>
                          ))}
                        </ul>
                      ) : "No URL slugs available."}
                    </td>
                  </tr>
                  <tr>
                    <th style={{ padding: "12px" }}>Supported Languages</th>
                    <td style={{ padding: "12px" }}>
                      {categoryData.microBrandInfo?.supportedLanguages?.length > 0
                        ? categoryData.microBrandInfo.supportedLanguages.join(", ") : "N/A"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Tours Tab */}
          {activeTab === "tours" && (
            <>
              <div className="table-responsive" style={{ maxHeight: "400px", overflowY: "auto", border: "1px solid #dee2e6", borderRadius: "8px", marginTop: 0, scrollbarWidth: "none", msOverflowStyle: "none" }}>
                <style>{`.table-responsive::-webkit-scrollbar { display: none; }`}</style>
                {
                  can(ACTIONS.CAN_EDIT, MODULES.SUBCATEGORY_PERMS) && subCategoriesCount > 0 &&
                  <div className="d-flex justify-content-end my-3">
                  <Button
                    color="info"
                    className="btn-sm me-2"
                    onClick={handleSubCategorySortClick}
                  >
                    Sort Sub Categories
                  </Button>
                  </div>
                }
                <table className="table table-bordered table-hover mb-0" style={{ position: "relative" }}>
                  <thead className="table-light" style={{ position: "sticky", top: 0, zIndex: 9, backgroundColor: "#f8f9fa", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
                    <tr>
                      {[
                        { label: "Tour ID", width: "120px", searchKey: "id", placeholder: "Search ID" },
                        { label: "Tour Image", width: "180px", searchKey: null },
                        { label: "Tour Name", searchKey: "name", placeholder: "Search Name" },
                        { label: "Status", width: "120px", searchKey: null },
                        { label: "Action", width: "100px", searchKey: null }
                      ].map((col, idx) => (
                        <th key={idx} style={{ width: col.width, padding: "12px" }} className="align-top">
                          <div>
                            <strong>{col.label}</strong>
                            {col.searchKey && (
                              <input type="text" className="form-control form-control-sm mt-2" style={{ fontSize: "0.9rem" }}
                                value={tourSearch[col.searchKey]} placeholder={col.placeholder}
                                onChange={(e) => setTourSearch({ ...tourSearch, [col.searchKey]: e.target.value })} />
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tours?.length > 0 ? paginate(filteredTours, tourPage).map((tour, index) => (
                      <tr key={tour._id || index}>
                        <td style={{ padding: "12px" }}>{tour._id || "N/A"}</td>
                        <td style={{ padding: "12px" }}>
                          {tour.imageUploads?.length > 0 ? (
                            <div style={{ width: "100%", height: "100px", overflow: "hidden", borderRadius: "6px" }}>
                              <img src={tour.imageUploads[0].url} alt={tour.imageUploads[0].altText || "Tour Image"}
                                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                            </div>
                          ) : <span className="text-muted">No image</span>}
                        </td>
                        <td style={{ padding: "12px" }}>{tour.name || "N/A"}</td>
                        <td style={{ padding: "12px" }}>
                          <span className={`badge bg-${tour.status ? "success" : "danger"}`} style={{ fontSize: "0.85rem", padding: "6px 10px" }}>
                            {tour.status ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td style={{ padding: "12px" }}>
                          <button className="btn btn-sm btn-outline-primary" title="View"><i className="fas fa-eye"></i></button>
                        </td>
                      </tr>
                    )) : <tr></tr>}
                  </tbody>
                </table>
              </div>
              <div className="d-flex justify-content-end align-items-center gap-2 mt-3">
                <Button size="sm" color="primary" disabled={tourPage === 1} onClick={() => setTourPage(prev => prev - 1)}>
                  <i className="fas fa-arrow-left me-1"></i>Prev
                </Button>
                <span className="text-muted">Page {tourPage} of {Math.ceil(filteredTours.length / pageSize) || 1}</span>
                <Button size="sm" color="primary" disabled={tourPage * pageSize >= filteredTours.length}
                  onClick={() => setTourPage(prev => prev + 1)}>
                  Next<i className="fas fa-arrow-right ms-1"></i>
                </Button>
              </div>
            </>
          )}

          {/* SubCategories Tab */}
          {activeTab === "subCategories" && (
            <>
              <div className="table-responsive" style={{ maxHeight: "400px", overflowY: "auto", border: "1px solid #dee2e6", borderRadius: "8px", marginTop: 0, scrollbarWidth: "none", msOverflowStyle: "none" }}>
                <style>{`.table-responsive::-webkit-scrollbar { display: none; }`}</style>
                <table className="table table-bordered table-hover mb-0" style={{ position: "relative" }}>
                  <thead className="table-light" style={{ position: "sticky", top: 0, zIndex: 9, backgroundColor: "#f8f9fa", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
                    <tr>
                      {[
                        { label: "Sub Category ID", width: "150px", searchKey: "id", placeholder: "Search ID" },
                        { label: "Image", width: "180px", searchKey: null },
                        { label: "Sub Category Name", searchKey: "name", placeholder: "Search Name" },
                        { label: "Category Name", width: "180px", searchKey: "category", placeholder: "Search Category" },
                        { label: "City Name", width: "150px", searchKey: "city", placeholder: "Search City" },
                        { label: "Action", width: "100px", searchKey: null }
                      ].map((col, idx) => (
                        <th key={idx} style={{ width: col.width, padding: "12px" }} className="align-top">
                          <div>
                            <strong>{col.label}</strong>
                            {col.searchKey && (
                              <input type="text" className="form-control form-control-sm mt-2" style={{ fontSize: "0.9rem" }}
                                value={subCatSearch[col.searchKey]} placeholder={col.placeholder}
                                onChange={(e) => setSubCatSearch({ ...subCatSearch, [col.searchKey]: e.target.value })} />
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {subCategories?.length > 0 ? paginate(filteredSubCategories, subCatPage).map((sub, index) => (
                      <tr key={sub._id || index}>
                        <td style={{ padding: "12px" }}>{sub._id || "N/A"}</td>
                        <td style={{ padding: "12px" }}>
                          {sub.medias?.[0]?.url ? (
                            <div style={{ width: "100%", height: "100px", overflow: "hidden", borderRadius: "6px" }}>
                              <img src={sub.medias[0].url} alt="Subcategory"
                                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                            </div>
                          ) : <span className="text-muted">No Image</span>}
                        </td>
                        <td style={{ padding: "12px" }}>{sub.name || "N/A"}</td>
                        <td style={{ padding: "12px" }}>{categoryData?.name || "N/A"}</td>
                        <td style={{ padding: "12px" }}>{sub.cityCode || "N/A"}</td>
                        <td style={{ padding: "12px" }}>
                          <button className="btn btn-sm btn-outline-primary" title="View"><i className="fas fa-eye"></i></button>
                        </td>
                      </tr>
                    )) : <tr></tr>}
                  </tbody>
                </table>
              </div>
              <div className="d-flex justify-content-end align-items-center gap-2 mt-3">
                <Button size="sm" color="primary" disabled={subCatPage === 1} onClick={() => setSubCatPage(prev => prev - 1)}>
                  <i className="fas fa-arrow-left me-1"></i>Prev
                </Button>
                <span className="text-muted">Page {subCatPage} of {Math.ceil(filteredSubCategories.length / pageSize) || 1}</span>
                <Button size="sm" color="primary" disabled={subCatPage * pageSize >= filteredSubCategories.length}
                  onClick={() => setSubCatPage(prev => prev + 1)}>
                  Next<i className="fas fa-arrow-right ms-1"></i>
                </Button>
              </div>
            </>
          )}

          {/* Bookings Tab */}
          {activeTab === "bookings" && (
            <>
              <div className="table-responsive" style={{ maxHeight: "400px", overflowY: "auto", border: "1px solid #dee2e6", borderRadius: "8px", marginTop: 0, scrollbarWidth: "none", msOverflowStyle: "none" }}>
                <style>{`.table-responsive::-webkit-scrollbar { display: none; }`}</style>
                <table className="table table-bordered mb-0" style={{ position: "relative" }}>
                  <thead className="table-light" style={{ position: "sticky", top: 0, zIndex: 9, backgroundColor: "#f8f9fa", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
                    <tr>
                      {[
                        { label: "Booking ID", width: "140px", searchKey: "id", placeholder: "Search ID" },
                        { label: "Customer Name", width: "160px", searchKey: "name", placeholder: "Search Name" },
                        { label: "Customer Info", width: "180px", searchKey: "phone", placeholder: "Search Phone/Email" },
                        { label: "Total Guests", width: "120px", searchKey: "guests", placeholder: "Search Guests" },
                        { label: "Tour Title", searchKey: "tour", placeholder: "Search Tour" },
                        { label: "Booking Date", width: "140px", searchKey: "date", placeholder: "Search Date" },
                        { label: "Guest Price", width: "120px", searchKey: "price", placeholder: "Search Price" },
                        { label: "Total Amount", width: "130px", searchKey: "amount", placeholder: "Search Amount" },
                        { label: "Status", width: "120px", searchKey: null },
                        { label: "Action", width: "100px", searchKey: null }
                      ].map((col, idx) => (
                        <th key={idx} style={{ width: col.width, padding: "12px" }} className={col.searchKey ? "" : "align-top"}>
                          <div>
                            <strong>{col.label}</strong>
                            {col.searchKey && (
                              <input type="text" className="form-control form-control-sm mt-2" style={{ fontSize: "0.9rem" }}
                                value={bookingSearch[col.searchKey]} placeholder={col.placeholder}
                                onChange={(e) => setBookingSearch({ ...bookingSearch, [col.searchKey]: e.target.value })} />
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {bookingsLoading ? (
                      <tr><td colSpan="10" className="text-center" style={{ padding: "20px" }}>Loading bookings...</td></tr>
                    ) : bookings?.length > 0 ? paginate(filteredBookings, bookingPage).map((booking, index) => (
                      <tr key={booking._id || index}>
                        <td style={{ padding: "12px" }}>{booking._id}</td>
                        <td style={{ padding: "12px" }}>{booking.customerName}</td>
                        <td style={{ padding: "12px" }}>
                          <div style={{ color: "#1a1a1a" }}>{booking.hasContactInfo}</div>
                          <div>{`${booking.phoneCode || ""} ${booking.phoneNumber || ""}`}</div>
                        </td>
                        <td style={{ padding: "12px" }}>{booking.guestsCount ?? booking.adultsCount ?? "N/A"}</td>
                        <td style={{ padding: "12px" }}>{booking.tourGroupId?.name || "N/A"}</td>
                        <td style={{ padding: "12px", color: "#0c6df6ff" }}>
                          {booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString() : "N/A"}
                        </td>
                        <td style={{ padding: "12px" }}>{booking.guestPrice ?? booking.amount ?? "N/A"}</td>
                        <td style={{ padding: "12px" }}>{booking.amount || "N/A"}</td>
                        <td style={{ padding: "12px" }}>
                          <span className={`badge bg-${booking.status === "Confirmed" ? "success" : "warning"}`}
                            style={{ fontSize: "0.85rem", padding: "6px 10px" }}>
                            {booking.status || "Pending"}
                          </span>
                        </td>
                        <td style={{ padding: "12px" }}>
                          {booking.status === "Confirmed" && (
                            <button className="btn btn-sm btn-primary">
                              <i className="fas fa-file-download"></i>
                            </button>
                          )}
                        </td>
                      </tr>
                    )) : <tr></tr>}
                  </tbody>
                </table>
              </div>
              <div className="d-flex justify-content-end align-items-center gap-2 mt-3">
                <Button size="sm" color="primary" disabled={bookingPage === 1} onClick={() => setBookingPage(prev => prev - 1)}>
                  <i className="fas fa-arrow-left me-1"></i>Prev
                </Button>
                <span className="text-muted">Page {bookingPage} of {Math.ceil(filteredBookings.length / pageSize) || 1}</span>
                <Button size="sm" color="primary" disabled={bookingPage * pageSize >= filteredBookings.length}
                  onClick={() => setBookingPage(prev => prev + 1)}>
                  Next<i className="fas fa-arrow-right ms-1"></i>
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Cancel Button */}
        <div className="text-end border-top bg-white p-3" style={{ position: "sticky", bottom: "0", zIndex: 1 }}>
          <Button color="secondary" size="lg" onClick={toggle}>Cancel</Button>
        </div>
      </ModalBody>
    </Modal>
  );
};

export default ViewCategoryModal;

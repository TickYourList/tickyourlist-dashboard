import React, { useState } from "react";
import { Modal, ModalHeader, ModalBody, Button } from "reactstrap";

const ViewCategoryModal = ({ isOpen, toggle, category, onEdit }) => {
  if (!category) return null;

  const [activeTab, setActiveTab] = useState("overview");

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const {
    name = "Category Name",
    description = "Explore this travel category",
    totalTours = 0,
    subCategoriesCount = 0,
    totalBookings = 0,
    averageRating = 0,
    isActive = true,
    _id = "",
  } = category;

  const imageUrl =
    category?.medias?.[0]?.url || "https://via.placeholder.com/100";

  return (
   <Modal
  isOpen={isOpen}
  toggle={toggle}
  size="lg"
  style={{ maxWidth: "900px", width: "90%" }}
> {/* ⬅️ Modal made wider */}
      <ModalHeader toggle={toggle}>Category Overview - {name}</ModalHeader>
      <ModalBody>
        {/* Top Section: Image + Name/Description */}
        <div className="d-flex justify-content-between align-items-start mb-4">
          <div className="d-flex">
            {/* Image */}
            <img
              src={imageUrl}
              alt="Category"
              style={{
                width: "250px",
                height: "250px",
                borderRadius: "8px",
                objectFit: "cover",
                marginRight: "16px",
              }}
            />

            {/* Name + Description + Cards + Button */}
            <div>
              <h1 className="display-8 fw-bold mb-1">{name}</h1>
              <p className="text-muted mb-1">{description}</p>
              <span className={`badge bg-${isActive ? "success" : "danger"}`}>
                {isActive ? "Active" : "Inactive"}
              </span>

              {/* ✅ Cards aligned just below name/description */}
              <div className="d-flex gap-3 mt-3 flex-wrap">
                <div
                  className="bg-light p-3 rounded text-center"
                  style={{ minWidth: "130px" }}
                >
                  <h5 className="fw-bold text-primary mb-1">{totalTours}</h5>
                  <p className="text-muted mb-0">Total Tours</p>
                </div>
                <div
                  className="bg-light p-3 rounded text-center"
                  style={{ minWidth: "130px" }}
                >
                  <h5 className="fw-bold text-success mb-1">{subCategoriesCount}</h5>
                  <p className="text-muted mb-0">Sub Categories</p>
                </div>
                <div
                  className="bg-light p-3 rounded text-center"
                  style={{ minWidth: "130px" }}
                >
                  <h5 className="fw-bold text-warning mb-1">{totalBookings}</h5>
                  <p className="text-muted mb-0">Bookings</p>
                </div>
                <div
                  className="bg-light p-3 rounded text-center"
                  style={{ minWidth: "130px" }}
                >
                  <h5 className="fw-bold text-info mb-1">{averageRating}</h5>
                  <p className="text-muted mb-0">Avg. Rating</p>
                </div>
              </div>

              {/* ✅ Edit Button moved just below cards */}
              <div className="mt-3">
                <Button color="primary" onClick={() => onEdit(_id)}>
                  Edit Category
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs with extra spacing from top section */}
        <div className="mt-4">
          <ul className="nav nav-tabs">
            <li className="nav-item">
              <button
                className={`nav-link text-black ${activeTab === "overview" ? "bg-primary text-white" : ""}`}
                onClick={() => handleTabClick("overview")}
              >
                Overview
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link text-black ${activeTab === "tours" ? "bg-primary text-white" : ""}`}
                onClick={() => handleTabClick("tours")}
              >
                Tours
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link text-black ${activeTab === "subCategories" ? "bg-primary text-white" : ""}`}
                onClick={() => handleTabClick("subCategories")}
              >
                Sub Categories
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link text-black ${activeTab === "bookings" ? "bg-primary text-white" : ""}`}
                onClick={() => handleTabClick("bookings")}
              >
                Bookings
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link text-black ${activeTab === "analytics" ? "bg-primary text-white" : ""}`}
                onClick={() => handleTabClick("analytics")}
              >
                Analytics
              </button>
            </li>
          </ul>

          {/* Content Area */}
          <div className="mt-3">
            {activeTab === "overview" && <p>Overview data will appear here.</p>}
            {activeTab === "tours" && <p>Tours API data will appear here.</p>}
            {activeTab === "subCategories" && (
              <p>Sub Categories API data will appear here.</p>
            )}
            {activeTab === "bookings" && (
              <p>Bookings API data will appear here.</p>
            )}
            {activeTab === "analytics" && (
              <p>Analytics API data will appear here.</p>
            )}
          </div>
        </div>

        {/* Cancel */}
        <div className="text-end mt-4">
          <Button color="secondary" onClick={toggle}>
            Cancel
          </Button>
        </div>
      </ModalBody>
    </Modal>
  );
};

export default ViewCategoryModal;

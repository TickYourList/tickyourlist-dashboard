import React, { useEffect, useState } from "react"
import { FaEdit, FaMoneyBill, FaEye, FaCopy, FaTrash } from "react-icons/fa"

const API_URL =
  "https://api.univolentsolutions.com/v1/tyltraveltourgroupvariant/list?page=1&limit=20"

function TourGroupVariantsTable() {
  const [variants, setVariants] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(data => {
        setVariants(data.data.variants || data.data || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <div>Loading...</div>

  return (
    <div style={{ padding: 24 }}>
      <h2>Tour Group Variants</h2>
      <table
        border="1"
        cellPadding="8"
        cellSpacing="0"
        style={{ width: "100%", borderCollapse: "collapse" }}
      >
        <thead>
          <tr>
            <th>Variant Name</th>
            <th>Tour Name (Clickable)</th>
            <th>City</th>
            <th>Price</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {variants.map(variant => (
            <tr key={variant._id}>
              <td>{variant.name}</td>
              <td>
                <a
                  href={`#${variant.productId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {variant.productId}
                </a>
              </td>
              <td>{variant.cityCode || "N/A"}</td>
              <td>
                {variant.listingPrice &&
                variant.listingPrice.prices &&
                variant.listingPrice.prices.length > 0
                  ? variant.listingPrice.prices[0].finalPrice
                  : "N/A"}
              </td>
              <td>
                {variant.status ? (
                  <span style={{ color: "green" }}>Active</span>
                ) : (
                  <span style={{ color: "red" }}>Inactive</span>
                )}
              </td>
              <td>
                <FaEdit
                  title="Edit"
                  style={{ margin: "0 5px", cursor: "pointer" }}
                />
                <FaMoneyBill
                  title="Manage Pricing"
                  style={{ margin: "0 5px", cursor: "pointer" }}
                />
                <FaEye
                  title="View Bookings"
                  style={{ margin: "0 5px", cursor: "pointer" }}
                />
                <FaCopy
                  title="Duplicate"
                  style={{ margin: "0 5px", cursor: "pointer" }}
                />
                <FaTrash
                  title="Delete"
                  style={{ margin: "0 5px", cursor: "pointer", color: "red" }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default TourGroupVariantsTable

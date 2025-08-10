import React from "react"
import { Link } from "react-router-dom"

const CustId = cell => {
  return (
    <Link to="#" className="text-body fw-bold">
      {cell.value ? cell.value : ""}
    </Link>
  )
}

const Name = cell => {
  return cell.value ? cell.value : ""
}

const CityCode = cell => {
  return cell.value ? cell.value : ""
}

const Tours = cell => {
  return cell.value ? cell.value : ""
}

const Status = cell => {
  return cell.value ? cell.value : ""
}

export { CustId, Name, CityCode, Tours, Status }

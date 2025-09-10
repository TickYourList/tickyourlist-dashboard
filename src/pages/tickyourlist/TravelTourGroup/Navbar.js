import React from "react"
import { NavLink } from "react-router-dom"
import { NavItem } from "reactstrap"
import PropTypes from "prop-types"
import classnames from "classnames"

export default function Navbar({ activeTab, setactiveTab, passedSteps = [] }) {
  const steps = [
    "Tour Details",
    "URL Slugs",
    "Location",
    "Ticket Info",
    "Additional Info",
    "Summary",
    "Image Uploads",
    "Product Images",
    "Safety Images",
    "Safety Videos",
  ]

  return (
    <ul>
      {steps.map((label, index) => {
        const step = index + 1
        const isActive = activeTab === step
        return (
          <NavItem key={step} className={classnames({ current: isActive })}>
            <NavLink
              className={classnames({ active: isActive })}
              onClick={() => setactiveTab(step)}
              disabled={!passedSteps.includes(step)}
            >
              <span className="number">{step}.</span> {label}
            </NavLink>
          </NavItem>
        )
      })}
    </ul>
  )
}

Navbar.propTypes = {
  activeTab: PropTypes.number,
  setactiveTab: PropTypes.func,
  passedSteps: PropTypes.arrayOf(PropTypes.number),
}
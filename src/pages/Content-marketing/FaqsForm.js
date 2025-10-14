import React, { useEffect, useState } from "react"
import { Row, Col, Card, CardBody, Form, Container } from "reactstrap"
import { useDispatch } from "react-redux"
import Select from "react-select"
import { addNewFaqs, updateFaqs } from "../../store/faqs/actions"
import { getCitiesList, getFaqsByCity } from "../../helpers/location_management_helper"
import EditorReact from "./Editor"
import FaqPreview from "./FaqPreview"
import "./faqs.scss"

import Breadcrumbs from "components/Common/Breadcrumb"
import { useNavigate, useParams } from "react-router-dom"

const FaqsForm = () => {
  document.title = "Content & Marketing | FAQs"

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { cityCode } = useParams()

  const [city, setCity] = useState(null)
  const [formRows, setFormRows] = useState([])
  const [cities, setCities] = useState([])
  const [loadingCities, setLoadingCities] = useState(false)
  const [loadingFaq, setLoadingFaq] = useState(false)
  const [faqId, setFaqId] = useState(null) // Store FAQ ID for updates
  const [faqData, setFaqData] = useState(null) // Store raw FAQ data
  const [previewModal, setPreviewModal] = useState(false)

  // Fetch cities on mount
  useEffect(() => {
    const fetchCities = async () => {
      try {
        setLoadingCities(true)
        const response = await getCitiesList()
        const cityOptions = response.data.travelCityList.map(city => ({
          value: city.cityCode,
          label: `${city.name} (${city.cityCode})`,
        }))
        setCities(cityOptions)
      } catch (error) {
        console.error("Error fetching cities:", error)
      } finally {
        setLoadingCities(false)
      }
    }
    fetchCities()
  }, [])

  // Fetch FAQ details by cityCode when editing
  useEffect(() => {
    const fetchFaqDetails = async () => {
      if (cityCode) {
        try {
          setLoadingFaq(true)
          const response = await getFaqsByCity(cityCode)
          
          if (response?.statusCode === "10000" && response.data) {
            // API returns data.faqs array, get first item
            const faqsArray = response.data.faqs || []
            const data = faqsArray[0] // Get first FAQ document
            
            if (data) {
              // Store raw FAQ data
              setFaqData(data)
              
              // Store FAQ ID for updates
              if (data._id) {
                setFaqId(data._id)
              }
              
              // Set FAQ rows with proper data
              if (data.faqs && data.faqs.length > 0) {
                const rows = data.faqs.map((faq, idx) => {
                  // Clean the strings to ensure no hidden characters
                  const cleanQuestion = faq.question ? faq.question.trim() : ""
                  const cleanAnswer = faq.answer ? faq.answer.trim() : ""
                  
                  return {
                    id: faq._id || Date.now() + idx,
                    question: cleanQuestion,
                    answer: cleanAnswer,
                    status: faq.status ? "true" : "false",
                  }
                })
                setFormRows(rows)
              } else {
                setFormRows([{ id: Date.now(), question: "", answer: "", status: "" }])
              }
            } else {
              setFormRows([{ id: Date.now(), question: "", answer: "", status: "" }])
            }
          } else {
            setFormRows([{ id: Date.now(), question: "", answer: "", status: "" }])
          }
        } catch (error) {
          console.error("Error fetching FAQ details:", error)
          // Initialize with empty row if fetch fails
          setFormRows([{ id: Date.now(), question: "", answer: "", status: "" }])
        } finally {
          setLoadingFaq(false)
        }
      } else {
        // Initialize with one empty row for new FAQ
        setFormRows([{ id: Date.now(), question: "", answer: "", status: "" }])
      }
    }
    
    fetchFaqDetails()
  }, [cityCode])
  
  // Set city dropdown after cities are loaded and we have FAQ data
  useEffect(() => {
    if (faqData && cities.length > 0 && faqData.cityCode) {
      const selectedCity = cities.find(c => c.value === faqData.cityCode)
      if (selectedCity) {
        setCity(selectedCity)
      } else {
        // Fallback: create city option from FAQ data
        const cityOption = {
          value: faqData.cityCode,
          label: `${faqData.city?.displayName || faqData.city?.name || faqData.cityCode} (${faqData.cityCode})`,
        }
        setCity(cityOption)
      }
    }
  }, [faqData, cities])

  const handleChange = (id, field, value) => {
    setFormRows(rows =>
      rows.map(row => (row.id === id ? { ...row, [field]: value } : row))
    )
  }

  const createPayload = () => {
    const payload = {
      city: city?.value || city,
      faqs: formRows.map(row => ({
        question: row.question,
        answer: row.answer,
        status: row.status === "true",
      })),
    }
    
    // Only add id for updates
    if (faqId) {
      payload.id = faqId
    }
    
    return payload
  }

  const handleSubmitClick = e => {
    e.preventDefault()
    const payload = createPayload()
    const { id, ...updatedPayload } = payload
    dispatch(addNewFaqs(updatedPayload))
    navigate("/faqs-list")
  }

  const handleUpdateClick = e => {
    e.preventDefault()
    const payload = createPayload()
    dispatch(updateFaqs(payload))
    navigate("/faqs-list")
  }

  const handleCancelClick = () => {
    navigate("/faqs-list")
  }

  const onAddFormRow = () => {
    const newRow = { id: Date.now(), question: "", answer: "", status: "" }
    setFormRows([...formRows, newRow])
  }

  const onDeleteFormRow = id => {
    if (formRows.length > 1) {
      setFormRows(formRows.filter(row => row.id !== id))
    }
  }

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs
          title="Content & Marketing"
          breadcrumbItem={cityCode ? "Edit FAQs" : "Add New FAQs"}
        />
        <Row>
          <Col xs={12}>
            <Card>
              <CardBody>
                <h6 className="mb-4 card-title">
                  {cityCode ? "Edit FAQs" : "Add New FAQs"}
                </h6>
                {loadingFaq && (
                  <div className="text-center mb-3">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">Loading FAQ details...</p>
                  </div>
                )}
                <Form
                  className="repeater"
                  onSubmit={cityCode ? handleUpdateClick : handleSubmitClick}
                >
                  {/* City Dropdown - Searchable */}
                  <Row className="mb-4">
                    <Col lg={12} className="mb-3">
                      <label>City <span className="text-danger">*</span></label>
                      <Select
                        value={city}
                        onChange={setCity}
                        options={cities}
                        isLoading={loadingCities}
                        isDisabled={loadingCities || loadingFaq}
                        placeholder={loadingCities ? "Loading cities..." : "Select or search city..."}
                        isClearable
                        isSearchable
                        classNamePrefix="select"
                      />
                      {!city && (
                        <small className="text-muted">
                          Start typing to search for a city
                        </small>
                      )}
                    </Col>
                  </Row>

                  {/* FAQ Rows */}
                  {formRows.map(formRow => (
                    <Row key={formRow.id} className="mb-4">
                      {/* Question */}
                      <Col lg={12} className="mb-3">
                        <label>Question</label>
                        <EditorReact
                          key={`question-${formRow.id}`}
                          value={formRow.question}
                          onChange={val =>
                            handleChange(formRow.id, "question", val)
                          }
                        />
                      </Col>

                      {/* Answer */}
                      <Col lg={12} className="mb-3">
                        <label>Answer</label>
                        <EditorReact
                          key={`answer-${formRow.id}`}
                          value={formRow.answer}
                          onChange={val =>
                            handleChange(formRow.id, "answer", val)
                          }
                        />
                      </Col>

                      {/* Status */}
                      <Col lg={12} className="mb-3">
                        <label>Status</label>
                        <select
                          className="form-control"
                          value={formRow.status}
                          onChange={e =>
                            handleChange(formRow.id, "status", e.target.value)
                          }
                        >
                          <option value="" disabled>
                            Select Status
                          </option>
                          <option value="true">Published</option>
                          <option value="false">Not Published</option>
                        </select>
                      </Col>

                      <Col lg={12} className="text-end">
                        <input
                          type="button"
                          className="btn btn-danger"
                          value="Delete"
                          onClick={() => onDeleteFormRow(formRow.id)}
                        />
                      </Col>
                    </Row>
                  ))}

                  {/* Action Buttons */}
                  <div className="d-flex justify-content-between mt-3">
                    <button
                      type="button"
                      className="btn btn-info"
                      onClick={() => setPreviewModal(true)}
                      disabled={loadingFaq || formRows.length === 0}
                    >
                      <i className="mdi mdi-eye me-1"></i>
                      Preview
                    </button>
                    <div className="d-flex gap-2">
                      <input
                        type="button"
                        className="btn btn-success"
                        value="Add More"
                        onClick={onAddFormRow}
                        disabled={loadingFaq}
                      />
                      <button 
                        type="submit" 
                        className="btn btn-primary"
                        disabled={loadingFaq || !city}
                      >
                        {cityCode ? "Update" : "Submit"}
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={handleCancelClick}
                        disabled={loadingFaq}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </Form>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Preview Modal */}
      <FaqPreview
        isOpen={previewModal}
        toggle={() => setPreviewModal(!previewModal)}
        faqs={formRows}
        cityName={city?.label}
      />
    </div>
  )
}

export default FaqsForm
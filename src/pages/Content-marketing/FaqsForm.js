import React, { useState } from "react";
import { Row, Col, Card, CardBody, Form, Container } from "reactstrap";
import { useDispatch } from "react-redux";
import { addNewFaqs } from "../../store/faqs/actions";
import Breadcrumbs from "components/Common/Breadcrumb";
import { useNavigate } from "react-router-dom";

const FaqsForm = () => {
  document.title = "Content & Marketing | Add New Faqs";
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [city, setCity] = useState("");

  const [formRows, setFormRows] = useState([
    { id: 1, question: "", answer: "", status: "" },
  ]);

  // handle input change
  const handleChange = (id, field, value) => {
    setFormRows(rows =>
      rows.map(row => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  // handle submit
  const handleSubmit = e => {
    e.preventDefault();

    const payload = {
      city,
      faqs: formRows.map(row => ({
        question: row.question,
        answer: row.answer,
        status: row.status === "true", // convert to boolean
      })),
    };

    dispatch(addNewFaqs(payload));
    navigate("/faqs-list");
  };

  const onAddFormRow = () => {
    const newRow = { id: Date.now(), question: "", answer: "", status: "" };
    setFormRows([...formRows, newRow]);
  };

  const onDeleteFormRow = id => {
    if (formRows.length > 1) {
      setFormRows(formRows.filter(row => row.id !== id));
    }
  };

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs
          title="Content & Marketing"
          breadcrumbItem="Add New FAQs"
        />
        <Row>
          <Col xs={12}>
            <Card>
              <CardBody>
                <h6 className="mb-4 card-title">FAQs</h6>
                <Form
                  className="repeater"
                  encType="multipart/form-data"
                  onSubmit={handleSubmit}
                >
                  {/* City field (only once) */}
                  <Row className="mb-4">
                    <Col lg={12} className="mb-3">
                      <label>City</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter City (e.g., DUBAI,RIYADH)"
                        value={city}
                        onChange={e => setCity(e.target.value)}
                        required
                      />
                    </Col>
                  </Row>

                  {/*Faqs Rows */}
                  <div>
                    {(formRows || []).map(formRow => (
                      <Row key={formRow.id} className="mb-4">
                        {/* Question */}
                        <Col lg={12} className="mb-3">
                          <label>Question</label>
                          <textarea
                            className="form-control"
                            placeholder="Enter your question"
                            rows="2"
                            value={formRow.question}
                            onChange={e =>
                              handleChange(
                                formRow.id,
                                "question",
                                e.target.value
                              )
                            }
                          />
                        </Col>

                        {/* Answer */}
                        <Col lg={12} className="mb-3">
                          <label>Answer</label>
                          <textarea
                            className="form-control"
                            placeholder="Enter the answer"
                            rows="3"
                            value={formRow.answer}
                            onChange={e =>
                              handleChange(formRow.id, "answer", e.target.value)
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

                        {/* Delete */}
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
                  </div>

                  {/* Action Buttons */}
                  <div className="d-flex justify-content-end gap-2 mt-3">
                    <input
                      type="button"
                      className="btn btn-success"
                      value="Add More"
                      onClick={onAddFormRow}
                    />
                    <button type="submit" className="btn btn-primary">
                      Submit
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => navigate("/faqs-list")}
                    >
                      Cancel
                    </button>
                  </div>
                </Form>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default FaqsForm;

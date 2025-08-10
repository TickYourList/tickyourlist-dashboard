// Location.js
import { ErrorMessage, Field } from "formik"
import React from "react"
import { Row, Col, Label, Input, FormGroup } from "reactstrap"

export default function Location({ title, Prefix }) {
  return (
    <Row>
      <h5 className="mb-3">{title}</h5>
      <Row>
        <Col md={6}>
          <FormGroup>
            <Label>
              Latitude <span className="text-danger">*</span>
            </Label>
            <Field as={Input} name={`${Prefix}.latitude`} />

            <ErrorMessage
              component={"span"}
              className="text-danger"
              name={`${Prefix}.latitude`}
            />
          </FormGroup>
        </Col>
        <Col md={6}>
          <FormGroup>
            <Label>
              Longitude <span className="text-danger">*</span>
            </Label>
            <Field as={Input} name={`${Prefix}.longitude`} />
            <ErrorMessage
              component={"span"}
              className="text-danger"
              name={`${Prefix}.longitude`}
            />
          </FormGroup>
        </Col>
      </Row>
      <FormGroup>
        <Label>
          Address Line 1 <span className="text-danger">*</span>
        </Label>
        <Field as={Input} name={`${Prefix}.addressLine1`} />
        <ErrorMessage
          component={"span"}
          className="text-danger"
          name={`${Prefix}.addressLine1`}
        />
      </FormGroup>
      <FormGroup>
        <Label>Address Line 2</Label>
        <Field as={Input} name={`${Prefix}.addressLine2`} />
        <ErrorMessage
          component={"span"}
          className="text-danger"
          name={`${Prefix}.addressLine2`}
        />
      </FormGroup>
      <Row>
        <Col md={4}>
          <FormGroup>
            <Label>
              City <span className="text-danger">*</span>
            </Label>
            <Field as={Input} name={`${Prefix}.cityName`} />
            <ErrorMessage
              component={"span"}
              className="text-danger"
              name={`${Prefix}.cityName`}
            />
          </FormGroup>
        </Col>
        <Col md={4}>
          <FormGroup>
            <Label>Postal Code</Label>
            <Field as={Input} type="number" name={`${Prefix}.postalCode`} />
            <ErrorMessage
              component={"span"}
              className="text-danger"
              name={`${Prefix}.postalCode`}
            />
          </FormGroup>
        </Col>
        <Col md={4}>
          <FormGroup>
            <Label>
              State <span className="text-danger">*</span>
            </Label>
            <Field as={Input} type="text" name={`${Prefix}.state`} />
            <ErrorMessage
              component={"span"}
              className="text-danger"
              name={`${Prefix}.state`}
            />
          </FormGroup>
        </Col>
      </Row>
      <FormGroup>
        <Label>
          Country Code <span className="text-danger">*</span>
        </Label>
        <Field as={Input} name={`${Prefix}.countryCode`} />
        <ErrorMessage
          component={"span"}
          className="text-danger"
          name={`${Prefix}.countryCode`}
        />
      </FormGroup>
    </Row>
  )
}
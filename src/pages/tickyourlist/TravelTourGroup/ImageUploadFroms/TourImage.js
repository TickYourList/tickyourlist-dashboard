import { Field, FieldArray, useFormikContext, ErrorMessage } from "formik"
import {
  Row,
  Col,
  Label,
  Input,
  Button,
  FormGroup,
  FormFeedback,
} from "reactstrap"
import React, { useEffect } from "react"

export default function TourImages() {
  const { values, setFieldValue, touched, errors } = useFormikContext()

  return (
    <FieldArray name="imageUploads">
      {({ push, remove }) => (
        <div>
          {values.imageUploads?.map((imageItem, index) => (
            <Row key={index} className="mb-3">
              <Col md="3">
                <FormGroup>
                  <Label>Alt Text</Label>
                  <Field
                    as={Input}
                    type="text"
                    name={`imageUploads[${index}].altText`}
                    invalid={
                      touched.imageUploads?.[index]?.altText &&
                      !!errors.imageUploads?.[index]?.altText
                    }
                  />
                  <ErrorMessage
                    name={`imageUploads[${index}].altText`}
                    component={FormFeedback}
                  />
                </FormGroup>
              </Col>

              <Col md="4">
                <FormGroup>
                  {imageItem.url && (
                    <div className="mb-2">
                      <img
                        src={imageItem.url || URL.createObjectURL(imageItem)}
                        alt={imageItem.altText || "Preview"}
                        style={{ width: "100px", height: "100px" }}
                      />
                    </div>
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    style={
                      imageItem.url ? { marginTop: 0 } : { marginTop: "1.6rem" }
                    }
                    onChange={event => {
                      const file = event.currentTarget.files[0]
                      setFieldValue(`imageUploads[${index}].image`, file)
                    }}
                  />
                </FormGroup>
              </Col>

              <Col md="2" className="mt-auto mb-auto">
                <Button
                  color="danger"
                  onClick={() => remove(index)}
                  style={{ marginTop: "0.7rem" }}
                  disabled={values.imageUploads.length <= 5}
                >
                  Remove
                </Button>
              </Col>
            </Row>
          ))}

          <Button
            color="success"
            onClick={() =>
              push({
                altText: "",
                image: null,
              })
            }
            disabled={values.imageUploads.length >= 15}
          >
            Add More
          </Button>
        </div>
      )}
    </FieldArray>
  )
}

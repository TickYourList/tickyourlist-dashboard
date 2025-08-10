import { useFormikContext } from "formik"
import React from "react"
import { Button } from "reactstrap"

export default function FormikSubmitButton({ isEdit, setModal }) {
  const { isValid } = useFormikContext()
  return (
    <React.Fragment>
      <Button
        color={isValid ? "primary" : "secondary"}
        type="submit"
        disabled={!isValid}
        onClick={() => setModal(false)}
      >
        {isEdit ? "Update" : "Submit"}
      </Button>
    </React.Fragment>
  )
}
import React from "react"
import { Modal, ModalHeader, ModalBody, Button } from "reactstrap"
import "./faqs.scss"

const FaqPreview = ({ isOpen, toggle, faqs, cityName }) => {
  // Filter out empty FAQs
  const validFaqs = faqs.filter(faq => faq.question?.trim() || faq.answer?.trim())

  return (
    <Modal
      isOpen={isOpen}
      toggle={toggle}
      size="lg"
      centered
      scrollable
    >
      <ModalHeader toggle={toggle}>
        FAQ Preview - {cityName || "No City Selected"}
      </ModalHeader>
      <ModalBody className="faq-preview-modal-body">
        <div className="faq-preview-container">
          {validFaqs.length > 0 ? (
            validFaqs.map((faq, index) => (
              <div key={faq.id} className="faq-preview-item mb-4">
                <div className="faq-preview-header d-flex align-items-start">
                  <span className="faq-number badge bg-primary me-3">
                    {index + 1}
                  </span>
                  <div className="flex-grow-1">
                    <div className="faq-question mb-3">
                      <div 
                        dangerouslySetInnerHTML={{ 
                          __html: faq.question || '<p class="text-muted">No question</p>' 
                        }}
                      />
                    </div>
                    <div className="faq-answer">
                      <div 
                        dangerouslySetInnerHTML={{ 
                          __html: faq.answer || '<p class="text-muted">No answer</p>' 
                        }}
                      />
                    </div>
                    <div className="mt-2">
                      <span className={`badge ${faq.status === "true" ? "bg-success" : "bg-secondary"}`}>
                        {faq.status === "true" ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>
                {index < validFaqs.length - 1 && (
                  <hr className="my-4" />
                )}
              </div>
            ))
          ) : (
            <div className="text-center text-muted py-5">
              <i className="mdi mdi-information-outline faq-empty-icon"></i>
              <p className="mt-3">No FAQ content to preview</p>
              <small>Add questions and answers to see the preview</small>
            </div>
          )}
        </div>
      </ModalBody>
      <div className="modal-footer">
        <Button color="secondary" onClick={toggle}>
          Close
        </Button>
      </div>
    </Modal>
  )
}

export default FaqPreview


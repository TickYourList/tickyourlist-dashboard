import React from "react";
import { Row, Col, Button } from "reactstrap";

const SlugList = ({ slugsEntered, onRemove }) => {
  const hasSlugs = Object.keys(slugsEntered).length > 0;

  return (
    <>
      {hasSlugs && (
        <>
          <h6 className="mt-4">All Added URL Slugs</h6>
          <Row className="mb-2">
            <Col md={3}><strong>Language</strong></Col>
            <Col md={7}><strong>Slug</strong></Col>
            <Col md={2}></Col>
          </Row>

          {Object.entries(slugsEntered).map(([lang, slug]) => (
            <Row key={lang} className="align-items-center mb-2">
              <Col md={3}>{lang}</Col>
              <Col md={7}>{slug}</Col>
              <Col md={2}>
                <Button
                  color="danger"
                  size="sm"
                  onClick={() => onRemove(lang)}
                >
                  Remove
                </Button>
              </Col>
            </Row>
          ))}
        </>
      )}
    </>
  );
};

export default SlugList;

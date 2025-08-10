import React, { useState } from "react";
import { Row, Col, Input, Button } from "reactstrap";
import { getSlugInputClass } from "./helper";

const defaultLanguages = [
  "EN", "ES", "FR", "IT", "DE", "PT",
  "NL", "PL", "DA", "NO", "RO", "RU", "SV", "TR"
];

const URLSlugsSection = ({ slugsEntered, setSlugsEntered }) => {
  const [selectedLang, setSelectedLang] = useState("");
  const [currentSlug, setCurrentSlug] = useState("");
  const [slugMessage, setSlugMessage] = useState("");

  const handleAddCustomSlug = () => {
    const lang = selectedLang.trim().toUpperCase();
    const slug = currentSlug.trim();

    let errorMsgs = [];
    let successMsgs = [];

    if (!lang || !slug) {
      errorMsgs.push("Both language and slug are required.");
    } else if (!/^[A-Z]{2,5}$/.test(lang)) {
      errorMsgs.push("Language code must be 2–5 uppercase letters.");
    } else if (slugsEntered[lang]) {
      errorMsgs.push(`Language "${lang}" already exists.`);
    } else {
      setSlugsEntered((prev) => ({ ...prev, [lang]: slug }));
      setSelectedLang("");
      setCurrentSlug("");
      successMsgs.push(`Added "${lang}" with slug "${slug}"`);
    }

    // Check if any existing slugs are empty
    Object.entries(slugsEntered).forEach(([langKey, value]) => {
      if (!value.trim()) {
        errorMsgs.push(`Slug for ${langKey} is empty.`);
      }
    });

    setSlugMessage(errorMsgs.length > 0 ? errorMsgs.join(" | ") : successMsgs.join(" | "));
  };

  return (
    <>
      <h5 className="mt-4">URL Slugs</h5>
      <Row className="mb-1">
        <Col><strong>Language</strong></Col>
        <Col md={11}><strong>URL Slug</strong></Col>
      </Row>

      {/* Predefined Language Slugs */}
      {defaultLanguages.reduce((rows, lang, i) => {
        if (i % 2 === 0) rows.push(defaultLanguages.slice(i, i + 2));
        return rows;
      }, []).map((pair, rowIndex) => (
        <Row key={rowIndex} className="align-items-center mb-2">
          {pair.map((lang) => (
            <Col md={6} key={lang}>
              <Row className="align-items-center">
                <Col md={1} className="p-1 text-end">
                  <span>{lang}</span>
                </Col>
                <Col md={1} className="p-1 text-center">:</Col>
                <Col md={7} className="p-1">
                  <Input
                    type="text"
                    bsSize="sm"
                    placeholder={`/tours-${lang.toLowerCase()}/`}
                    value={slugsEntered[lang] || ""}
                    onChange={(e) =>
                      setSlugsEntered({
                        ...slugsEntered,
                        [lang]: e.target.value,
                      })
                    }
                    className={getSlugInputClass(slugsEntered, lang)}
                  />
                </Col>
                <Col md={2} className="p-1">
                  {slugsEntered[lang] && (
                    <Button
                      color="danger"
                      size="sm"
                      onClick={() => {
                        const updated = { ...slugsEntered };
                        delete updated[lang];
                        setSlugsEntered(updated);
                      }}
                    >
                      ×
                    </Button>
                  )}
                </Col>
              </Row>
            </Col>
          ))}
        </Row>
      ))}

      {/* Custom Language Slug */}
      <Row className="align-items-center mt-2">
        <Col md={6}>
          <Row className="align-items-center">
            <Col md={1} className="p-1 text-end">
              <Input
                type="text"
                bsSize="sm"
                placeholder="Lang"
                value={selectedLang}
                onChange={(e) => setSelectedLang(e.target.value.toUpperCase())}
              />
            </Col>
            <Col md={1} className="p-1 text-center">:</Col>
            <Col md={7} className="p-1">
              <Input
                type="text"
                bsSize="sm"
                placeholder="/custom-slug/"
                value={currentSlug}
                onChange={(e) => setCurrentSlug(e.target.value)}
              />
            </Col>
            <Col md={2} className="p-1" />
          </Row>
        </Col>
      </Row>

      {/* Add Slug Button */}
      <Row className="mt-3 mb-2">
        <Col>
          <Button
            color="success"
            size="sm"
            disabled={!selectedLang.trim() || !currentSlug.trim()}
            onClick={handleAddCustomSlug}
          >
            Add Slug
          </Button>
        </Col>
      </Row>

      {/* Message */}
      {/* {slugMessage && (
        <Row className="mb-3">
          <Col>
            <div className="text-muted">{slugMessage}</div>
          </Col>
        </Row>
      )} */}
    </>
  );
};

export default URLSlugsSection;

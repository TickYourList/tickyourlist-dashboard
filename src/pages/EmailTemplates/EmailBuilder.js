import React, { useState, useCallback } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Button,
  FormGroup,
  Label,
  Input,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Badge,
  Alert,
} from "reactstrap";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { post } from "../../helpers/api_helper";
import toastr from "toastr";
import "toastr/build/toastr.min.css";

// Available block types
const BLOCK_TYPES = [
  { id: "header", icon: "bx-heading", label: "Header", color: "primary" },
  { id: "text", icon: "bx-text", label: "Text Block", color: "info" },
  { id: "image", icon: "bx-image", label: "Image", color: "success" },
  { id: "button", icon: "bx-pointer", label: "Button", color: "warning" },
  { id: "divider", icon: "bx-minus", label: "Divider", color: "secondary" },
  { id: "spacer", icon: "bx-expand-vertical", label: "Spacer", color: "light" },
  { id: "columns", icon: "bx-columns", label: "2 Columns", color: "dark" },
  { id: "social", icon: "bx-share-alt", label: "Social Links", color: "danger" },
  { id: "footer", icon: "bx-dock-bottom", label: "Footer", color: "secondary" },
];

// Default content for each block type
const getDefaultContent = (type) => {
  const defaults = {
    header: { text: "Your Email Headline", size: "h1", align: "center" },
    text: { text: "Enter your text content here. You can use {{customerName}} to personalize.", align: "left" },
    image: { src: "https://via.placeholder.com/600x200", alt: "Image", width: "100%" },
    button: { text: "Click Here", url: "https://www.tickyourlist.com", color: "#4CAF50", align: "center" },
    divider: { style: "solid", color: "#e0e0e0" },
    spacer: { height: "20px" },
    columns: { left: "Left column content", right: "Right column content" },
    social: { facebook: "#", twitter: "#", instagram: "#", linkedin: "#" },
    footer: { text: "© 2025 TickYourList. All rights reserved.", unsubscribe: true },
  };
  return defaults[type] || {};
};

// Generate HTML from block
const blockToHtml = (block) => {
  const { type, content } = block;
  
  switch (type) {
    case "header":
      const Tag = content.size || "h1";
      return `<${Tag} style="margin: 0; padding: 20px 0; text-align: ${content.align}; color: #333;">${content.text}</${Tag}>`;
    
    case "text":
      return `<p style="margin: 0; padding: 15px 0; font-size: 16px; line-height: 1.6; text-align: ${content.align}; color: #555;">${content.text}</p>`;
    
    case "image":
      return `<div style="text-align: center; padding: 15px 0;"><img src="${content.src}" alt="${content.alt}" style="max-width: ${content.width}; height: auto; border-radius: 8px;" /></div>`;
    
    case "button":
      return `<div style="text-align: ${content.align}; padding: 20px 0;"><a href="${content.url}" style="display: inline-block; padding: 14px 28px; background-color: ${content.color}; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600;">${content.text}</a></div>`;
    
    case "divider":
      return `<hr style="border: none; border-top: 1px ${content.style} ${content.color}; margin: 20px 0;" />`;
    
    case "spacer":
      return `<div style="height: ${content.height};"></div>`;
    
    case "columns":
      return `<table width="100%" cellpadding="0" cellspacing="0" style="margin: 15px 0;"><tr><td width="50%" style="padding: 10px; vertical-align: top;">${content.left}</td><td width="50%" style="padding: 10px; vertical-align: top;">${content.right}</td></tr></table>`;
    
    case "social":
      return `<div style="text-align: center; padding: 20px 0;">${content.facebook ? `<a href="${content.facebook}" style="margin: 0 10px;"><img src="https://cdn-icons-png.flaticon.com/32/733/733547.png" alt="Facebook" /></a>` : ''}${content.twitter ? `<a href="${content.twitter}" style="margin: 0 10px;"><img src="https://cdn-icons-png.flaticon.com/32/733/733579.png" alt="Twitter" /></a>` : ''}${content.instagram ? `<a href="${content.instagram}" style="margin: 0 10px;"><img src="https://cdn-icons-png.flaticon.com/32/2111/2111463.png" alt="Instagram" /></a>` : ''}</div>`;
    
    case "footer":
      return `<div style="text-align: center; padding: 30px 20px; background-color: #f8f9fa; color: #666; font-size: 12px;"><p style="margin: 0;">${content.text}</p>${content.unsubscribe ? '<p style="margin: 10px 0 0;"><a href="{{unsubscribeUrl}}" style="color: #888;">Unsubscribe</a></p>' : ''}</div>`;
    
    default:
      return "";
  }
};

const EmailBuilder = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  document.title = "Email Builder | TickYourList Dashboard";

  const [blocks, setBlocks] = useState([
    { id: "1", type: "header", content: { text: "Welcome to TickYourList!", size: "h1", align: "center" } },
    { id: "2", type: "text", content: { text: "Hello {{customerName}},\n\nThank you for being a valued customer!", align: "left" } },
    { id: "3", type: "button", content: { text: "Explore Tours", url: "https://www.tickyourlist.com", color: "#4CAF50", align: "center" } },
  ]);
  
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [draggedBlock, setDraggedBlock] = useState(null);
  const [previewModal, setPreviewModal] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");
  const [saveModal, setSaveModal] = useState(false);
  const [templateName, setTemplateName] = useState("");

  // Customization
  const [customization, setCustomization] = useState({
    primaryColor: "#4CAF50",
    backgroundColor: "#f4f7fa",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  });

  // Add a new block
  const addBlock = (type) => {
    const newBlock = {
      id: Date.now().toString(),
      type,
      content: getDefaultContent(type),
    };
    setBlocks([...blocks, newBlock]);
    setSelectedBlock(newBlock.id);
    toastr.success(`${type.charAt(0).toUpperCase() + type.slice(1)} block added`);
  };

  // Remove a block
  const removeBlock = (blockId) => {
    setBlocks(blocks.filter(b => b.id !== blockId));
    if (selectedBlock === blockId) setSelectedBlock(null);
  };

  // Move block up
  const moveBlockUp = (index) => {
    if (index === 0) return;
    const newBlocks = [...blocks];
    [newBlocks[index - 1], newBlocks[index]] = [newBlocks[index], newBlocks[index - 1]];
    setBlocks(newBlocks);
  };

  // Move block down
  const moveBlockDown = (index) => {
    if (index === blocks.length - 1) return;
    const newBlocks = [...blocks];
    [newBlocks[index], newBlocks[index + 1]] = [newBlocks[index + 1], newBlocks[index]];
    setBlocks(newBlocks);
  };

  // Update block content
  const updateBlockContent = (blockId, newContent) => {
    setBlocks(blocks.map(b => 
      b.id === blockId ? { ...b, content: { ...b.content, ...newContent } } : b
    ));
  };

  // Generate full HTML
  const generateHtml = () => {
    const bodyHtml = blocks.map(blockToHtml).join("\n");
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: ${customization.backgroundColor}; font-family: ${customization.fontFamily};">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <div style="background: linear-gradient(135deg, ${customization.primaryColor} 0%, ${customization.primaryColor}dd 100%); padding: 20px; text-align: center;">
      <img src="https://tickyourlist-images.s3.ap-south-1.amazonaws.com/tyllogo-white.png" alt="TickYourList" style="height: 40px;" />
    </div>
    <div style="padding: 30px;">
      ${bodyHtml}
    </div>
  </div>
</body>
</html>`;
  };

  // Preview email
  const handlePreview = () => {
    setPreviewHtml(generateHtml());
    setPreviewModal(true);
  };

  // Save template
  const handleSave = async () => {
    if (!templateName) {
      toastr.error("Please enter a template name");
      return;
    }

    try {
      const htmlContent = generateHtml();
      const response = await post("/v1/tyl-email-templates/create", {
        name: templateName,
        templateType: "custom",
        subject: templateName,
        htmlContent,
        variables: ["customerName", "unsubscribeUrl"],
        isActive: true,
        fromEmail: "bookings@tickyourlist.com",
      });

      if (response.success) {
        toastr.success("Template saved successfully!");
        setSaveModal(false);
        navigate("/email-templates");
      } else {
        toastr.error(response.message || "Failed to save template");
      }
    } catch (error) {
      toastr.error("Failed to save template");
    }
  };

  // Use in campaign
  const handleUseCampaign = () => {
    const htmlContent = generateHtml();
    sessionStorage.setItem("builderHtmlContent", htmlContent);
    navigate("/email-campaigns/create?fromBuilder=true");
  };

  // Get selected block
  const getSelectedBlock = () => blocks.find(b => b.id === selectedBlock);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="Email Marketing" breadcrumbItem="Email Builder" />

          <Row>
            {/* Left: Block Library */}
            <Col md={2}>
              <Card>
                <CardBody>
                  <h6 className="mb-3">
                    <i className="bx bx-plus-circle me-1"></i> Add Blocks
                  </h6>
                  <div className="d-grid gap-2">
                    {BLOCK_TYPES.map((block) => (
                      <Button
                        key={block.id}
                        color={block.color}
                        outline
                        size="sm"
                        className="text-start"
                        onClick={() => addBlock(block.id)}
                      >
                        <i className={`bx ${block.icon} me-2`}></i>
                        {block.label}
                      </Button>
                    ))}
                  </div>
                </CardBody>
              </Card>

              {/* Quick Variables */}
              <Card className="mt-3">
                <CardBody>
                  <h6 className="mb-2">Quick Variables</h6>
                  <div className="d-flex flex-wrap gap-1">
                    {["customerName", "bookingId", "tourName", "amount"].map(v => (
                      <Badge
                        key={v}
                        color="info"
                        style={{ cursor: "pointer", fontSize: "10px" }}
                        onClick={() => {
                          navigator.clipboard.writeText(`{{${v}}}`);
                          toastr.success(`{{${v}}} copied!`);
                        }}
                      >
                        {v}
                      </Badge>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </Col>

            {/* Center: Canvas */}
            <Col md={6}>
              <Card>
                <CardBody style={{ backgroundColor: customization.backgroundColor, minHeight: "600px" }}>
                  {/* Email Header */}
                  <div
                    style={{
                      background: `linear-gradient(135deg, ${customization.primaryColor} 0%, ${customization.primaryColor}dd 100%)`,
                      padding: "20px",
                      textAlign: "center",
                      borderRadius: "8px 8px 0 0",
                      marginBottom: "0",
                    }}
                  >
                    <img
                      src="https://tickyourlist-images.s3.ap-south-1.amazonaws.com/tyllogo-white.png"
                      alt="Logo"
                      style={{ height: "40px" }}
                    />
                  </div>

                  {/* Content Area */}
                  <div
                    style={{
                      backgroundColor: "#fff",
                      padding: "20px",
                      borderRadius: "0 0 8px 8px",
                      minHeight: "400px",
                    }}
                  >
                    {blocks.length === 0 ? (
                      <div className="text-center py-5 text-muted">
                        <i className="bx bx-plus-circle" style={{ fontSize: "48px" }}></i>
                        <p className="mt-2">Click blocks on the left to add content</p>
                      </div>
                    ) : (
                      blocks.map((block, index) => (
                        <div
                          key={block.id}
                          className={`position-relative mb-2 ${selectedBlock === block.id ? 'border border-primary rounded' : ''}`}
                          style={{
                            cursor: "pointer",
                            padding: "10px",
                            backgroundColor: selectedBlock === block.id ? "#f0f7ff" : "transparent",
                            borderRadius: "4px",
                          }}
                          onClick={() => setSelectedBlock(block.id)}
                        >
                          {/* Block Controls */}
                          {selectedBlock === block.id && (
                            <div
                              className="position-absolute"
                              style={{ top: "-10px", right: "10px", zIndex: 10 }}
                            >
                              <Badge color="primary" className="me-1">{block.type}</Badge>
                              <Button
                                color="light"
                                size="sm"
                                className="p-1"
                                onClick={(e) => { e.stopPropagation(); moveBlockUp(index); }}
                                disabled={index === 0}
                              >
                                <i className="bx bx-up-arrow-alt"></i>
                              </Button>
                              <Button
                                color="light"
                                size="sm"
                                className="p-1"
                                onClick={(e) => { e.stopPropagation(); moveBlockDown(index); }}
                                disabled={index === blocks.length - 1}
                              >
                                <i className="bx bx-down-arrow-alt"></i>
                              </Button>
                              <Button
                                color="danger"
                                size="sm"
                                className="p-1"
                                onClick={(e) => { e.stopPropagation(); removeBlock(block.id); }}
                              >
                                <i className="bx bx-trash"></i>
                              </Button>
                            </div>
                          )}

                          {/* Block Preview */}
                          <div dangerouslySetInnerHTML={{ __html: blockToHtml(block) }} />
                        </div>
                      ))
                    )}
                  </div>
                </CardBody>
              </Card>

              {/* Action Buttons */}
              <div className="d-flex justify-content-between mt-3">
                <Button color="secondary" outline onClick={() => navigate("/email-templates")}>
                  <i className="bx bx-arrow-back me-1"></i> Back
                </Button>
                <div className="d-flex gap-2">
                  <Button color="info" outline onClick={handlePreview}>
                    <i className="bx bx-show me-1"></i> Preview
                  </Button>
                  <Button color="success" onClick={() => setSaveModal(true)}>
                    <i className="bx bx-save me-1"></i> Save Template
                  </Button>
                  <Button color="primary" onClick={handleUseCampaign}>
                    <i className="bx bx-send me-1"></i> Use in Campaign
                  </Button>
                </div>
              </div>
            </Col>

            {/* Right: Properties Panel */}
            <Col md={4}>
              <Card>
                <CardBody>
                  <h6 className="mb-3">
                    <i className="bx bx-palette me-2"></i>
                    Email Settings
                  </h6>
                  
                  <FormGroup>
                    <Label className="small">Primary Color</Label>
                    <div className="d-flex">
                      <Input
                        type="color"
                        value={customization.primaryColor}
                        onChange={(e) => setCustomization({ ...customization, primaryColor: e.target.value })}
                        style={{ width: "50px", height: "38px" }}
                      />
                      <Input
                        type="text"
                        value={customization.primaryColor}
                        onChange={(e) => setCustomization({ ...customization, primaryColor: e.target.value })}
                        className="ms-2"
                      />
                    </div>
                  </FormGroup>

                  <FormGroup>
                    <Label className="small">Background Color</Label>
                    <div className="d-flex">
                      <Input
                        type="color"
                        value={customization.backgroundColor}
                        onChange={(e) => setCustomization({ ...customization, backgroundColor: e.target.value })}
                        style={{ width: "50px", height: "38px" }}
                      />
                      <Input
                        type="text"
                        value={customization.backgroundColor}
                        onChange={(e) => setCustomization({ ...customization, backgroundColor: e.target.value })}
                        className="ms-2"
                      />
                    </div>
                  </FormGroup>
                </CardBody>
              </Card>

              {/* Block Properties */}
              {selectedBlock && getSelectedBlock() && (
                <Card className="mt-3">
                  <CardBody>
                    <h6 className="mb-3">
                      <i className="bx bx-edit me-2"></i>
                      Edit {getSelectedBlock().type.charAt(0).toUpperCase() + getSelectedBlock().type.slice(1)}
                    </h6>

                    {getSelectedBlock().type === "header" && (
                      <>
                        <FormGroup>
                          <Label className="small">Header Text</Label>
                          <Input
                            type="text"
                            value={getSelectedBlock().content.text}
                            onChange={(e) => updateBlockContent(selectedBlock, { text: e.target.value })}
                          />
                        </FormGroup>
                        <FormGroup>
                          <Label className="small">Size</Label>
                          <Input
                            type="select"
                            value={getSelectedBlock().content.size}
                            onChange={(e) => updateBlockContent(selectedBlock, { size: e.target.value })}
                          >
                            <option value="h1">Large (H1)</option>
                            <option value="h2">Medium (H2)</option>
                            <option value="h3">Small (H3)</option>
                          </Input>
                        </FormGroup>
                        <FormGroup>
                          <Label className="small">Alignment</Label>
                          <div className="btn-group w-100">
                            {["left", "center", "right"].map(align => (
                              <Button
                                key={align}
                                color={getSelectedBlock().content.align === align ? "primary" : "light"}
                                size="sm"
                                onClick={() => updateBlockContent(selectedBlock, { align })}
                              >
                                <i className={`bx bx-align-${align}`}></i>
                              </Button>
                            ))}
                          </div>
                        </FormGroup>
                      </>
                    )}

                    {getSelectedBlock().type === "text" && (
                      <>
                        <FormGroup>
                          <Label className="small">Text Content</Label>
                          <Input
                            type="textarea"
                            rows={4}
                            value={getSelectedBlock().content.text}
                            onChange={(e) => updateBlockContent(selectedBlock, { text: e.target.value })}
                          />
                        </FormGroup>
                        <FormGroup>
                          <Label className="small">Alignment</Label>
                          <div className="btn-group w-100">
                            {["left", "center", "right"].map(align => (
                              <Button
                                key={align}
                                color={getSelectedBlock().content.align === align ? "primary" : "light"}
                                size="sm"
                                onClick={() => updateBlockContent(selectedBlock, { align })}
                              >
                                <i className={`bx bx-align-${align}`}></i>
                              </Button>
                            ))}
                          </div>
                        </FormGroup>
                      </>
                    )}

                    {getSelectedBlock().type === "image" && (
                      <>
                        <FormGroup>
                          <Label className="small">Image URL</Label>
                          <Input
                            type="text"
                            value={getSelectedBlock().content.src}
                            onChange={(e) => updateBlockContent(selectedBlock, { src: e.target.value })}
                            placeholder="https://..."
                          />
                        </FormGroup>
                        <FormGroup>
                          <Label className="small">Alt Text</Label>
                          <Input
                            type="text"
                            value={getSelectedBlock().content.alt}
                            onChange={(e) => updateBlockContent(selectedBlock, { alt: e.target.value })}
                          />
                        </FormGroup>
                      </>
                    )}

                    {getSelectedBlock().type === "button" && (
                      <>
                        <FormGroup>
                          <Label className="small">Button Text</Label>
                          <Input
                            type="text"
                            value={getSelectedBlock().content.text}
                            onChange={(e) => updateBlockContent(selectedBlock, { text: e.target.value })}
                          />
                        </FormGroup>
                        <FormGroup>
                          <Label className="small">Button URL</Label>
                          <Input
                            type="text"
                            value={getSelectedBlock().content.url}
                            onChange={(e) => updateBlockContent(selectedBlock, { url: e.target.value })}
                          />
                        </FormGroup>
                        <FormGroup>
                          <Label className="small">Button Color</Label>
                          <div className="d-flex">
                            <Input
                              type="color"
                              value={getSelectedBlock().content.color}
                              onChange={(e) => updateBlockContent(selectedBlock, { color: e.target.value })}
                              style={{ width: "50px" }}
                            />
                            <Input
                              type="text"
                              value={getSelectedBlock().content.color}
                              onChange={(e) => updateBlockContent(selectedBlock, { color: e.target.value })}
                              className="ms-2"
                            />
                          </div>
                        </FormGroup>
                        <FormGroup>
                          <Label className="small">Alignment</Label>
                          <div className="btn-group w-100">
                            {["left", "center", "right"].map(align => (
                              <Button
                                key={align}
                                color={getSelectedBlock().content.align === align ? "primary" : "light"}
                                size="sm"
                                onClick={() => updateBlockContent(selectedBlock, { align })}
                              >
                                <i className={`bx bx-align-${align}`}></i>
                              </Button>
                            ))}
                          </div>
                        </FormGroup>
                      </>
                    )}

                    {getSelectedBlock().type === "spacer" && (
                      <FormGroup>
                        <Label className="small">Height</Label>
                        <Input
                          type="select"
                          value={getSelectedBlock().content.height}
                          onChange={(e) => updateBlockContent(selectedBlock, { height: e.target.value })}
                        >
                          <option value="10px">Small (10px)</option>
                          <option value="20px">Medium (20px)</option>
                          <option value="40px">Large (40px)</option>
                          <option value="60px">Extra Large (60px)</option>
                        </Input>
                      </FormGroup>
                    )}

                    {getSelectedBlock().type === "footer" && (
                      <>
                        <FormGroup>
                          <Label className="small">Footer Text</Label>
                          <Input
                            type="text"
                            value={getSelectedBlock().content.text}
                            onChange={(e) => updateBlockContent(selectedBlock, { text: e.target.value })}
                          />
                        </FormGroup>
                        <FormGroup check>
                          <Input
                            type="checkbox"
                            checked={getSelectedBlock().content.unsubscribe}
                            onChange={(e) => updateBlockContent(selectedBlock, { unsubscribe: e.target.checked })}
                          />
                          <Label check className="small">Show Unsubscribe Link</Label>
                        </FormGroup>
                      </>
                    )}
                  </CardBody>
                </Card>
              )}

              {/* Tips */}
              <Card className="mt-3 border-0 bg-light">
                <CardBody>
                  <h6><i className="bx bx-bulb text-warning me-1"></i> Tips</h6>
                  <ul className="small mb-0 ps-3">
                    <li>Click blocks to select and edit</li>
                    <li>Use ↑↓ arrows to reorder blocks</li>
                    <li>Use <code>{"{{customerName}}"}</code> for personalization</li>
                    <li>Keep emails under 600px wide for mobile</li>
                  </ul>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Preview Modal */}
      <Modal isOpen={previewModal} toggle={() => setPreviewModal(false)} size="xl">
        <ModalHeader toggle={() => setPreviewModal(false)}>Email Preview</ModalHeader>
        <ModalBody style={{ backgroundColor: "#f4f7fa", padding: "20px" }}>
          <div className="d-flex justify-content-center gap-2 mb-3">
            <Button color="light" size="sm">
              <i className="bx bx-desktop me-1"></i> Desktop
            </Button>
            <Button color="light" size="sm">
              <i className="bx bx-mobile me-1"></i> Mobile
            </Button>
          </div>
          <iframe
            srcDoc={previewHtml}
            title="Email Preview"
            style={{ width: "100%", height: "600px", border: "none", borderRadius: "8px", backgroundColor: "#fff" }}
          />
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setPreviewModal(false)}>Close</Button>
        </ModalFooter>
      </Modal>

      {/* Save Modal */}
      <Modal isOpen={saveModal} toggle={() => setSaveModal(false)}>
        <ModalHeader toggle={() => setSaveModal(false)}>Save Template</ModalHeader>
        <ModalBody>
          <FormGroup>
            <Label>Template Name</Label>
            <Input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="e.g., Holiday Promo 2025"
            />
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setSaveModal(false)}>Cancel</Button>
          <Button color="primary" onClick={handleSave}>
            <i className="bx bx-save me-1"></i> Save Template
          </Button>
        </ModalFooter>
      </Modal>
    </React.Fragment>
  );
};

export default EmailBuilder;


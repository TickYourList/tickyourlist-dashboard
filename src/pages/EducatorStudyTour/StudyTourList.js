import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Container, Row, Col, Card, CardBody, Button, Badge, Spinner,
  Modal, ModalHeader, ModalBody, ModalFooter, Form, Label, Input,
} from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import ConfirmModal from "../../components/Common/ConfirmModal";
import { showToastSuccess, showToastError } from "../../helpers/toastBuilder";
import { usePermissions, ACTIONS, MODULES } from "../../helpers/permissions";
import { getStudyTours, createStudyTour, deleteStudyTour } from "../../apis/educatorStudyTour";

const STATUS_COLORS = { draft: "secondary", open: "success", closed: "warning", completed: "info", archived: "dark" };

const EMPTY = {
  name: "", slug: "", year: new Date().getFullYear() + 1, destinationCountry: "Finland",
  status: "draft", summary: "",
  doubleOccupancyPerPerson: 240000, singleSupplementMin: 45000, singleSupplementMax: 50000,
};

const StudyTourList = () => {
  document.title = "Educator Study Tours | TickYourList";

  const { can } = usePermissions();
  const canAdd = can(ACTIONS.CAN_ADD, MODULES.STUDY_TOUR_PERMS);
  const canDelete = can(ACTIONS.CAN_DELETE, MODULES.STUDY_TOUR_PERMS);

  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getStudyTours();
      setTours(res?.data?.tours || []);
    } catch (e) {
      showToastError(e?.response?.data?.message || "Failed to load study tours", "Error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onChange = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.slug) { showToastError("Name and slug are required", "Validation"); return; }
    setSaving(true);
    try {
      await createStudyTour({
        name: form.name,
        slug: form.slug.trim().toLowerCase().replace(/\s+/g, "-"),
        year: Number(form.year) || undefined,
        destinationCountry: form.destinationCountry,
        status: form.status,
        summary: form.summary,
        pricing: {
          currency: "INR",
          doubleOccupancyPerPerson: Number(form.doubleOccupancyPerPerson) || undefined,
          singleSupplementMin: Number(form.singleSupplementMin) || undefined,
          singleSupplementMax: Number(form.singleSupplementMax) || undefined,
          inclusions: [], exclusions: [],
        },
      });
      showToastSuccess("Study tour created", "Success");
      setModal(false); setForm(EMPTY); load();
    } catch (e2) {
      showToastError(e2?.response?.data?.message || "Failed to create study tour", "Error");
    } finally {
      setSaving(false);
    }
  };

  const remove = (tour) => {
    setConfirm({
      title: "Delete study tour",
      message: `Delete “${tour.name}”? Participants will remain in the database. This cannot be undone.`,
      confirmLabel: "Delete tour",
      confirmWord: "DELETE",
      onConfirm: async () => {
        try { await deleteStudyTour(tour._id); showToastSuccess("Deleted", "Success"); load(); }
        catch (e) { showToastError(e?.response?.data?.message || "Delete failed", "Error"); throw e; }
      },
    });
  };

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs title="Study Tours" breadcrumbItem="Educator Study Tours" />

        <Row className="mb-3">
          <Col><h5 className="mb-0">Programmes</h5></Col>
          <Col className="text-end">
            {canAdd && (
              <Button color="primary" onClick={() => setModal(true)}>
                <i className="bx bx-plus me-1" /> New Study Tour
              </Button>
            )}
          </Col>
        </Row>

        {loading ? (
          <div className="text-center py-5"><Spinner color="primary" /></div>
        ) : tours.length === 0 ? (
          <Card><CardBody className="text-center text-muted py-5">
            No study tours yet. Create your first programme (e.g. "Finland Education Study Tour 2026").
          </CardBody></Card>
        ) : (
          <Row>
            {tours.map((t) => (
              <Col xl={4} md={6} key={t._id}>
                <Card className="h-100">
                  <CardBody>
                    <div className="d-flex justify-content-between align-items-start">
                      <h5 className="mb-1">{t.name}</h5>
                      <Badge color={STATUS_COLORS[t.status] || "secondary"}>{t.status}</Badge>
                    </div>
                    <p className="text-muted mb-2">
                      <i className="bx bx-map me-1" />{t.destinationCountry}{t.year ? ` · ${t.year}` : ""}
                    </p>
                    {t.pricing?.doubleOccupancyPerPerson ? (
                      <p className="mb-2"><strong>₹{Number(t.pricing.doubleOccupancyPerPerson).toLocaleString("en-IN")}</strong>
                        <span className="text-muted"> / person (double)</span></p>
                    ) : null}
                    {t.summary ? <p className="text-muted small">{t.summary}</p> : null}
                    <div className="mt-3 d-flex gap-2">
                      <Link to={`/educator-study-tours/${t._id}`} className="btn btn-soft-primary btn-sm">
                        <i className="bx bx-group me-1" /> Manage Participants
                      </Link>
                      {canDelete && (
                        <Button color="soft-danger" size="sm" onClick={() => remove(t)}>
                          <i className="bx bx-trash" />
                        </Button>
                      )}
                    </div>
                  </CardBody>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>

      <Modal isOpen={modal} toggle={() => setModal(!modal)} centered>
        <ModalHeader toggle={() => setModal(!modal)}>New Study Tour</ModalHeader>
        <Form onSubmit={submit}>
          <ModalBody>
            <div className="mb-3">
              <Label>Name *</Label>
              <Input value={form.name} onChange={onChange("name")} placeholder="Finland Education Study Tour 2026" />
            </div>
            <Row>
              <Col md={7} className="mb-3">
                <Label>Slug * (used in the public form URL)</Label>
                <Input value={form.slug} onChange={onChange("slug")} placeholder="finland-study-tour-2026" />
              </Col>
              <Col md={5} className="mb-3">
                <Label>Year</Label>
                <Input type="number" value={form.year} onChange={onChange("year")} />
              </Col>
            </Row>
            <Row>
              <Col md={7} className="mb-3">
                <Label>Destination Country</Label>
                <Input value={form.destinationCountry} onChange={onChange("destinationCountry")} />
              </Col>
              <Col md={5} className="mb-3">
                <Label>Status</Label>
                <Input type="select" value={form.status} onChange={onChange("status")}>
                  <option value="draft">Draft</option>
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                  <option value="completed">Completed</option>
                </Input>
              </Col>
            </Row>
            <Row>
              <Col md={4} className="mb-3">
                <Label>Double / person (₹)</Label>
                <Input type="number" value={form.doubleOccupancyPerPerson} onChange={onChange("doubleOccupancyPerPerson")} />
              </Col>
              <Col md={4} className="mb-3">
                <Label>Single supp. min (₹)</Label>
                <Input type="number" value={form.singleSupplementMin} onChange={onChange("singleSupplementMin")} />
              </Col>
              <Col md={4} className="mb-3">
                <Label>Single supp. max (₹)</Label>
                <Input type="number" value={form.singleSupplementMax} onChange={onChange("singleSupplementMax")} />
              </Col>
            </Row>
            <div className="mb-2">
              <Label>Summary</Label>
              <Input type="textarea" rows={2} value={form.summary} onChange={onChange("summary")} />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="light" onClick={() => setModal(false)} type="button">Cancel</Button>
            <Button color="primary" type="submit" disabled={saving}>
              {saving ? <Spinner size="sm" /> : "Create"}
            </Button>
          </ModalFooter>
        </Form>
      </Modal>

      <ConfirmModal config={confirm} onClose={() => setConfirm(null)} />
    </div>
  );
};

export default StudyTourList;

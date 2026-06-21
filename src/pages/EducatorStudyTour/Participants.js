import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Container, Row, Col, Card, CardBody, Button, Badge, Spinner, Input, Label,
  Modal, ModalHeader, ModalBody, ModalFooter, Form, Nav, NavItem, NavLink,
  TabContent, TabPane, Table,
} from "reactstrap";
import classnames from "classnames";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { showToastSuccess, showToastError } from "../../helpers/toastBuilder";
import {
  getStudyTour, getParticipants, getParticipant, createParticipant,
  updateParticipant, deleteParticipant, previewMessage, sendMessage,
  getTourAnalytics, getTourWeather, getManifest, runAutomations, bulkMessage,
  PARTICIPANT_STAGES, STAGE_LABELS, STAGE_COLORS, MESSAGE_TEMPLATES,
} from "../../helpers/educator_study_tour_helper";

const inr = (n) => (typeof n === "number" ? `₹${n.toLocaleString("en-IN")}` : "—");
const fmt = (d) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—");

const Participants = () => {
  const { tourId } = useParams();
  document.title = "Study Tour Participants | TickYourList";

  const [tour, setTour] = useState(null);
  const [stageCounts, setStageCounts] = useState({});
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filterStage, setFilterStage] = useState("");
  const [search, setSearch] = useState("");
  const [soloOnly, setSoloOnly] = useState(false);

  const [detail, setDetail] = useState(null); // participant being viewed
  const [activeTab, setActiveTab] = useState("profile");
  const [addModal, setAddModal] = useState(false);
  const [msgModal, setMsgModal] = useState(false);

  const loadTour = async () => {
    try {
      const res = await getStudyTour(tourId);
      setTour(res?.data?.tour || null);
      setStageCounts(res?.data?.stageCounts || {});
    } catch (e) { showToastError("Failed to load tour", "Error"); }
  };

  const loadParticipants = async () => {
    setLoading(true);
    try {
      const res = await getParticipants({
        studyTour: tourId,
        stage: filterStage || undefined,
        search: search || undefined,
        solo: soloOnly ? "true" : undefined,
      });
      setParticipants(res?.data?.participants || []);
    } catch (e) { showToastError("Failed to load participants", "Error"); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadTour(); }, [tourId]);
  useEffect(() => { loadParticipants(); /* eslint-disable-next-line */ }, [tourId, filterStage, soloOnly]);

  const openDetail = async (id) => {
    try {
      const res = await getParticipant(id);
      setDetail(res?.data?.participant || null);
      setActiveTab("profile");
    } catch (e) { showToastError("Failed to load participant", "Error"); }
  };

  const patch = async (id, data, msg = "Updated") => {
    try {
      const res = await updateParticipant(id, data);
      showToastSuccess(msg, "Success");
      const updated = res?.data?.participant;
      if (updated) setDetail((d) => (d && d._id === id ? updated : d));
      loadParticipants(); loadTour();
    } catch (e) { showToastError(e?.response?.data?.message || "Update failed", "Error"); }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this participant permanently?")) return;
    try { await deleteParticipant(id); showToastSuccess("Deleted", "Success"); setDetail(null); loadParticipants(); loadTour(); }
    catch (e) { showToastError("Delete failed", "Error"); }
  };

  const filtered = useMemo(() => participants, [participants]);

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs title={<Link to="/educator-study-tours">Study Tours</Link>} breadcrumbItem={tour?.name || "Participants"} />

        {/* Advanced cohort tools */}
        <CohortTools tourId={tourId} onChanged={() => { loadParticipants(); loadTour(); }} />

        {/* Stage board */}
        <Row className="mb-3">
          {PARTICIPANT_STAGES.filter((s) => s !== "cancelled").map((s) => (
            <Col key={s} xs={6} md={3} xl={true} className="mb-2">
              <Card className="mb-0" role="button" onClick={() => setFilterStage(filterStage === s ? "" : s)}
                    style={{ border: filterStage === s ? "2px solid #556ee6" : undefined }}>
                <CardBody className="p-2 text-center">
                  <h4 className="mb-0">{stageCounts[s] || 0}</h4>
                  <small className="text-muted">{STAGE_LABELS[s]}</small>
                </CardBody>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Filters */}
        <Card><CardBody>
          <Row className="g-2 align-items-end">
            <Col md={4}>
              <Label className="mb-1">Search</Label>
              <div className="d-flex gap-2">
                <Input value={search} onChange={(e) => setSearch(e.target.value)}
                       placeholder="Name, email, institution, phone"
                       onKeyDown={(e) => e.key === "Enter" && loadParticipants()} />
                <Button color="primary" onClick={loadParticipants}><i className="bx bx-search" /></Button>
              </div>
            </Col>
            <Col md={3}>
              <Label className="mb-1">Stage</Label>
              <Input type="select" value={filterStage} onChange={(e) => setFilterStage(e.target.value)}>
                <option value="">All stages</option>
                {PARTICIPANT_STAGES.map((s) => <option key={s} value={s}>{STAGE_LABELS[s]}</option>)}
              </Input>
            </Col>
            <Col md={2}>
              <div className="form-check mt-4">
                <input className="form-check-input" type="checkbox" id="soloOnly" checked={soloOnly}
                       onChange={(e) => setSoloOnly(e.target.checked)} />
                <Label className="form-check-label" for="soloOnly">Solo travellers</Label>
              </div>
            </Col>
            <Col md={3} className="text-end">
              <Button color="success" onClick={() => setAddModal(true)}>
                <i className="bx bx-user-plus me-1" /> Add (Concierge)
              </Button>
            </Col>
          </Row>
        </CardBody></Card>

        {/* Table */}
        <Card><CardBody>
          {loading ? (
            <div className="text-center py-4"><Spinner color="primary" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center text-muted py-4">No participants found.</div>
          ) : (
            <div className="table-responsive">
              <Table className="table align-middle mb-0">
                <thead><tr>
                  <th>Name</th><th>Institution</th><th>Stage</th><th>Occupancy</th>
                  <th>Cluster</th><th>Contact</th><th className="text-end">Actions</th>
                </tr></thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p._id}>
                      <td>
                        <Link to="#" onClick={(e) => { e.preventDefault(); openDetail(p._id); }} className="fw-semibold">
                          {p.fullName}
                        </Link>
                        {p.isSolo ? <Badge color="soft-info" className="ms-2">Solo</Badge> : null}
                        {p.source === "concierge" ? <Badge color="soft-secondary" className="ms-1">Concierge</Badge> : null}
                      </td>
                      <td>{p.institutionName || "—"}</td>
                      <td><Badge color={STAGE_COLORS[p.stage] || "secondary"}>{STAGE_LABELS[p.stage] || p.stage}</Badge></td>
                      <td className="text-capitalize">{p.occupancy || "—"}</td>
                      <td>{p.travelCluster || "—"}</td>
                      <td><div className="small">{p.email}<br />{p.mobile}</div></td>
                      <td className="text-end">
                        <Button color="soft-primary" size="sm" className="me-1" onClick={() => openDetail(p._id)}>
                          <i className="bx bx-show" />
                        </Button>
                        <Button color="soft-success" size="sm" className="me-1"
                                onClick={() => { setDetail(p); setMsgModal(true); }}>
                          <i className="bx bx-envelope" />
                        </Button>
                        <Button color="soft-danger" size="sm" onClick={() => remove(p._id)}>
                          <i className="bx bx-trash" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </CardBody></Card>
      </Container>

      {/* Detail modal */}
      <ParticipantDetailModal
        participant={detail && !msgModal ? detail : null}
        tour={tour}
        activeTab={activeTab} setActiveTab={setActiveTab}
        onClose={() => setDetail(null)}
        onPatch={patch}
        onMessage={() => setMsgModal(true)}
      />

      {/* Send message modal */}
      <SendMessageModal
        isOpen={msgModal}
        participant={detail}
        onClose={() => setMsgModal(false)}
        onSent={() => { setMsgModal(false); if (detail) openDetail(detail._id); }}
      />

      {/* Add concierge modal */}
      <AddParticipantModal
        isOpen={addModal}
        tourId={tourId}
        onClose={() => setAddModal(false)}
        onAdded={() => { setAddModal(false); loadParticipants(); loadTour(); }}
      />
    </div>
  );
};

/* ----------------------- Detail modal (tabs) --------------------------- */
const ParticipantDetailModal = ({ participant, tour, activeTab, setActiveTab, onClose, onPatch, onMessage }) => {
  const [ops, setOps] = useState({});
  useEffect(() => {
    if (participant) {
      setOps({
        stage: participant.stage || "registered",
        travelCluster: participant.travelCluster || "",
        isSolo: !!participant.isSolo,
        quotedAmount: participant.quotedAmount || "",
        paidAmount: participant.paidAmount || "",
        coordName: participant.assignedCoordinator?.name || "",
        coordPhone: participant.assignedCoordinator?.phone || "",
        internalNotes: participant.internalNotes || "",
      });
    }
  }, [participant]);

  if (!participant) return null;
  const p = participant;

  const saveOps = () => onPatch(p._id, {
    stage: ops.stage,
    travelCluster: ops.travelCluster,
    isSolo: ops.isSolo,
    quotedAmount: ops.quotedAmount === "" ? undefined : Number(ops.quotedAmount),
    paidAmount: ops.paidAmount === "" ? undefined : Number(ops.paidAmount),
    assignedCoordinator: { name: ops.coordName, phone: ops.coordPhone },
    internalNotes: ops.internalNotes,
  }, "Participant updated");

  const verifyDoc = (idx, status) => {
    const documents = (p.documents || []).map((d, i) => i === idx ? { ...d, status } : d);
    onPatch(p._id, { documents }, "Document updated");
  };

  return (
    <Modal isOpen={!!participant} toggle={onClose} size="xl" scrollable>
      <ModalHeader toggle={onClose}>
        {p.fullName} <Badge color={STAGE_COLORS[p.stage]} className="ms-2">{STAGE_LABELS[p.stage]}</Badge>
      </ModalHeader>
      <ModalBody>
        <Nav tabs className="mb-3">
          {["profile", "ops", "documents", "visa", "flight", "comms"].map((t) => (
            <NavItem key={t}>
              <NavLink className={classnames({ active: activeTab === t })} onClick={() => setActiveTab(t)} role="button">
                <span className="text-capitalize">{t === "comms" ? "Communications" : t}</span>
              </NavLink>
            </NavItem>
          ))}
        </Nav>

        <TabContent activeTab={activeTab}>
          {/* PROFILE */}
          <TabPane tabId="profile">
            <Row>
              <Col md={6}>
                <h6 className="text-muted">Personal</h6>
                <Info label="Full name" value={p.fullName} />
                <Info label="Designation" value={p.designation} />
                <Info label="Institution" value={p.institutionName} />
                <Info label="Email" value={p.email} />
                <Info label="Mobile" value={p.mobile} />
                <Info label="City / State" value={[p.city, p.state].filter(Boolean).join(", ")} />
                <Info label="IDA Member" value={p.idaMember ? `Yes${p.idaMembershipNumber ? ` (${p.idaMembershipNumber})` : ""}` : "No"} />
              </Col>
              <Col md={6}>
                <h6 className="text-muted">Trip preferences</h6>
                <Info label="Occupancy" value={p.occupancy} />
                <Info label="Meal" value={p.mealPreference} />
                <Info label="Allergies" value={(p.allergies || []).join(", ")} />
                <Info label="Travel assistance" value={(p.travelAssistance || []).join(", ")} />
                <Info label="Wants extension" value={p.wantsExtension} />
                <Info label="Accompanying" value={p.hasAccompanying ? `${(p.accompanyingPersons || []).length} person(s)` : "No"} />
                <Info label="Emergency" value={p.emergencyName ? `${p.emergencyName} (${p.emergencyRelationship || ""}) ${p.emergencyPhone || ""}` : "—"} />
              </Col>
            </Row>
            {p.medicalCondition ? <div className="alert alert-warning mt-2 mb-0"><strong>Medical:</strong> {p.medicalCondition}</div> : null}
            {p.mainReason ? <div className="mt-3"><h6 className="text-muted">Main reason</h6><p className="mb-0">{p.mainReason}</p></div> : null}
          </TabPane>

          {/* OPS */}
          <TabPane tabId="ops">
            <Row className="g-3">
              <Col md={4}>
                <Label>Stage</Label>
                <Input type="select" value={ops.stage} onChange={(e) => setOps({ ...ops, stage: e.target.value })}>
                  {PARTICIPANT_STAGES.map((s) => <option key={s} value={s}>{STAGE_LABELS[s]}</option>)}
                </Input>
              </Col>
              <Col md={4}>
                <Label>Travel cluster</Label>
                <Input value={ops.travelCluster} onChange={(e) => setOps({ ...ops, travelCluster: e.target.value })}
                       placeholder="e.g. Mumbai group" />
              </Col>
              <Col md={4} className="d-flex align-items-end">
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" id="soloFlag" checked={ops.isSolo}
                         onChange={(e) => setOps({ ...ops, isSolo: e.target.checked })} />
                  <Label className="form-check-label" for="soloFlag">Solo traveller</Label>
                </div>
              </Col>
              <Col md={4}>
                <Label>Quoted amount (₹)</Label>
                <Input type="number" value={ops.quotedAmount} onChange={(e) => setOps({ ...ops, quotedAmount: e.target.value })} />
              </Col>
              <Col md={4}>
                <Label>Paid amount (₹)</Label>
                <Input type="number" value={ops.paidAmount} onChange={(e) => setOps({ ...ops, paidAmount: e.target.value })} />
              </Col>
              <Col md={4}>
                <Label>Coordinator name</Label>
                <Input value={ops.coordName} onChange={(e) => setOps({ ...ops, coordName: e.target.value })} />
              </Col>
              <Col md={4}>
                <Label>Coordinator phone</Label>
                <Input value={ops.coordPhone} onChange={(e) => setOps({ ...ops, coordPhone: e.target.value })} />
              </Col>
              <Col md={12}>
                <Label>Internal notes</Label>
                <Input type="textarea" rows={3} value={ops.internalNotes} onChange={(e) => setOps({ ...ops, internalNotes: e.target.value })} />
              </Col>
            </Row>
            <Button color="primary" className="mt-3" onClick={saveOps}>Save ops details</Button>
          </TabPane>

          {/* DOCUMENTS */}
          <TabPane tabId="documents">
            {(p.documents || []).length === 0 ? <p className="text-muted">No document checklist.</p> : (
              <Table className="align-middle">
                <thead><tr><th>Document</th><th>Required</th><th>Status</th><th>File</th><th>Action</th></tr></thead>
                <tbody>
                  {p.documents.map((d, i) => (
                    <tr key={d.key}>
                      <td>{d.label}</td>
                      <td>{d.required ? "Yes" : "Optional"}</td>
                      <td><Badge color={d.status === "verified" ? "success" : d.status === "uploaded" ? "info" : d.status === "rejected" ? "danger" : "secondary"}>{d.status}</Badge></td>
                      <td>{d.fileUrl ? <a href={d.fileUrl} target="_blank" rel="noreferrer">View</a> : "—"}</td>
                      <td>
                        <Button size="sm" color="soft-success" className="me-1" onClick={() => verifyDoc(i, "verified")}>Verify</Button>
                        <Button size="sm" color="soft-danger" onClick={() => verifyDoc(i, "rejected")}>Reject</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </TabPane>

          {/* VISA */}
          <TabPane tabId="visa">
            <Info label="Scheduled" value={p.visaAppointment?.scheduled ? "Yes" : "No"} />
            <Info label="Date / time" value={`${fmt(p.visaAppointment?.date)} ${p.visaAppointment?.time || ""}`} />
            <Info label="Centre" value={p.visaAppointment?.centreName} />
            <Info label="Address" value={p.visaAppointment?.centreAddress} />
            <Info label="Reference" value={p.visaAppointment?.referenceNumber} />
            <Info label="Document deadline" value={fmt(p.visaAppointment?.documentDeadline)} />
            <Info label="Passport" value={p.passportNumber} />
            <Info label="Passport expiry" value={fmt(p.passportExpiry)} />
            <Info label="Schengen visa" value={p.hasSchengenVisa ? "Yes" : "No"} />
            <Info label="Past refusal" value={p.visaRefusal?.has ? `Yes — ${p.visaRefusal.country || ""} ${p.visaRefusal.year || ""}` : "No"} />
            <p className="text-muted mt-2 small">Edit visa appointment details via Ops &gt; the API, or use "Send Visa Appointment" message after setting these.</p>
          </TabPane>

          {/* FLIGHT */}
          <TabPane tabId="flight">
            <Info label="Booked" value={p.flight?.booked ? "Yes" : "No"} />
            <Info label="PNR" value={p.flight?.pnr} />
            <Info label="Outbound" value={p.flight?.outbound ? `${p.flight.outbound.airline || ""} ${p.flight.outbound.flightNumber || ""} · ${fmt(p.flight.outbound.date)}` : "—"} />
            <Info label="Return" value={p.flight?.return ? `${p.flight.return.airline || ""} ${p.flight.return.flightNumber || ""} · ${fmt(p.flight.return.date)}` : "—"} />
            <Info label="Departure city" value={p.departureCity} />
            <Info label="Departure airport" value={p.departureAirport} />
          </TabPane>

          {/* COMMS */}
          <TabPane tabId="comms">
            {(p.communications || []).length === 0 ? <p className="text-muted">No messages sent yet.</p> : (
              <Table className="align-middle">
                <thead><tr><th>When</th><th>Channel</th><th>Template</th><th>To</th><th>Status</th></tr></thead>
                <tbody>
                  {[...p.communications].reverse().map((c, i) => (
                    <tr key={i}>
                      <td className="small">{new Date(c.sentAt).toLocaleString("en-IN")}</td>
                      <td className="text-capitalize">{c.channel}</td>
                      <td>{c.templateKey}</td>
                      <td className="small">{c.to || "—"}</td>
                      <td><Badge color={c.status === "sent" ? "success" : c.status === "failed" ? "danger" : "warning"}>{c.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </TabPane>
        </TabContent>
      </ModalBody>
      <ModalFooter>
        <Button color="success" onClick={onMessage}><i className="bx bx-envelope me-1" /> Send Message</Button>
        <Button color="light" onClick={onClose}>Close</Button>
      </ModalFooter>
    </Modal>
  );
};

const Info = ({ label, value }) => (
  <div className="d-flex mb-1">
    <div className="text-muted" style={{ width: 150, flexShrink: 0 }}>{label}</div>
    <div className="fw-semibold">{value || "—"}</div>
  </div>
);

/* ----------------------- Send message modal ---------------------------- */
const SendMessageModal = ({ isOpen, participant, onClose, onSent }) => {
  const [templateKey, setTemplateKey] = useState("registration_received");
  const [channels, setChannels] = useState({ email: true, whatsapp: false, sms: false });
  const [vars, setVars] = useState({});
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (isOpen) { setPreview(null); setVars({}); } }, [isOpen, participant]);

  const doPreview = async () => {
    if (!participant) return;
    try {
      const res = await previewMessage(participant._id, templateKey, vars);
      setPreview(res?.data?.rendered || null);
    } catch (e) { showToastError("Preview failed", "Error"); }
  };

  const doSend = async () => {
    if (!participant) return;
    const chans = Object.entries(channels).filter(([, v]) => v).map(([k]) => k);
    if (!chans.length) { showToastError("Select at least one channel", "Validation"); return; }
    setBusy(true);
    try {
      const res = await sendMessage(participant._id, templateKey, chans, vars);
      const entries = res?.data?.entries || [];
      const ok = entries.filter((e) => e.status === "sent").length;
      showToastSuccess(`${ok}/${entries.length} channel(s) sent`, "Message dispatched");
      onSent();
    } catch (e) { showToastError(e?.response?.data?.message || "Send failed", "Error"); }
    finally { setBusy(false); }
  };

  if (!participant) return null;

  return (
    <Modal isOpen={isOpen} toggle={onClose} size="xl" scrollable>
      <ModalHeader toggle={onClose}>Send message to {participant.fullName}</ModalHeader>
      <ModalBody>
        <Row>
          <Col md={5}>
            <Label>Template</Label>
            <Input type="select" value={templateKey} onChange={(e) => { setTemplateKey(e.target.value); setPreview(null); }}>
              {MESSAGE_TEMPLATES.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
            </Input>

            <Label className="mt-3">Channels</Label>
            <div className="d-flex gap-3">
              {["email", "whatsapp", "sms"].map((c) => (
                <div className="form-check" key={c}>
                  <input className="form-check-input" type="checkbox" id={`ch-${c}`} checked={channels[c]}
                         onChange={(e) => setChannels({ ...channels, [c]: e.target.checked })} />
                  <Label className="form-check-label text-capitalize" for={`ch-${c}`}>{c}</Label>
                </div>
              ))}
            </div>

            {templateKey === "payment_instructions" && (
              <>
                <Label className="mt-3">Amount (₹)</Label>
                <Input type="number" value={vars.amount || ""} onChange={(e) => setVars({ ...vars, amount: Number(e.target.value) })} />
                <Label className="mt-2">Payment link</Label>
                <Input value={vars.paymentLink || ""} onChange={(e) => setVars({ ...vars, paymentLink: e.target.value })} />
              </>
            )}
            {templateKey === "document_request" && (
              <>
                <Label className="mt-3">Upload link</Label>
                <Input value={vars.uploadLink || ""} onChange={(e) => setVars({ ...vars, uploadLink: e.target.value })} />
                <Label className="mt-2">Deadline</Label>
                <Input type="date" value={vars.deadline || ""} onChange={(e) => setVars({ ...vars, deadline: e.target.value })} />
              </>
            )}
            {templateKey === "weather_packing" && (
              <>
                <Label className="mt-3">Temperature range</Label>
                <Input value={vars.temperatureRange || ""} onChange={(e) => setVars({ ...vars, temperatureRange: e.target.value })} placeholder="8°C to 14°C" />
              </>
            )}
            {templateKey === "sightseeing_extension" && (
              <>
                <Label className="mt-3">Response deadline</Label>
                <Input type="date" value={vars.responseDeadline || ""} onChange={(e) => setVars({ ...vars, responseDeadline: e.target.value })} />
              </>
            )}
            {templateKey === "thank_you" && (
              <>
                <Label className="mt-3">Feedback link</Label>
                <Input value={vars.feedbackLink || ""} onChange={(e) => setVars({ ...vars, feedbackLink: e.target.value })} />
              </>
            )}
            {templateKey === "custom" && (
              <>
                <Label className="mt-3">Subject</Label>
                <Input value={vars.subject || ""} onChange={(e) => setVars({ ...vars, subject: e.target.value })} />
                <Label className="mt-2">Heading</Label>
                <Input value={vars.heading || ""} onChange={(e) => setVars({ ...vars, heading: e.target.value })} />
                <Label className="mt-2">Message</Label>
                <Input type="textarea" rows={4} value={vars.message || ""} onChange={(e) => setVars({ ...vars, message: e.target.value })} />
              </>
            )}

            <Button color="secondary" outline className="mt-3" onClick={doPreview}>
              <i className="bx bx-show me-1" /> Preview email
            </Button>
          </Col>
          <Col md={7}>
            <Label>Email preview</Label>
            {preview ? (
              <div style={{ border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden" }}>
                <div className="p-2 bg-light small"><strong>Subject:</strong> {preview.subject}</div>
                <iframe title="preview" srcDoc={preview.html} style={{ width: "100%", height: 460, border: 0 }} />
              </div>
            ) : (
              <div className="text-muted border rounded p-4 text-center">Click "Preview email" to render.</div>
            )}
          </Col>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color="light" onClick={onClose}>Cancel</Button>
        <Button color="success" onClick={doSend} disabled={busy}>
          {busy ? <Spinner size="sm" /> : <><i className="bx bx-send me-1" /> Send now</>}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

/* ----------------------- Add concierge modal --------------------------- */
const AddParticipantModal = ({ isOpen, tourId, onClose, onAdded }) => {
  const [f, setF] = useState({});
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (isOpen) setF({}); }, [isOpen]);

  const submit = async (e) => {
    e.preventDefault();
    if (!f.fullName || !f.email || !f.mobile) { showToastError("Name, email, mobile required", "Validation"); return; }
    setBusy(true);
    try {
      await createParticipant({ ...f, studyTour: tourId });
      showToastSuccess("Participant added", "Success");
      onAdded();
    } catch (e2) { showToastError(e2?.response?.data?.message || "Failed", "Error"); }
    finally { setBusy(false); }
  };

  return (
    <Modal isOpen={isOpen} toggle={onClose} centered>
      <ModalHeader toggle={onClose}>Add participant (on their behalf)</ModalHeader>
      <Form onSubmit={submit}>
        <ModalBody>
          <div className="mb-2"><Label>Full name *</Label><Input value={f.fullName || ""} onChange={(e) => setF({ ...f, fullName: e.target.value })} /></div>
          <Row>
            <Col md={6} className="mb-2"><Label>Email *</Label><Input type="email" value={f.email || ""} onChange={(e) => setF({ ...f, email: e.target.value })} /></Col>
            <Col md={6} className="mb-2"><Label>Mobile *</Label><Input value={f.mobile || ""} onChange={(e) => setF({ ...f, mobile: e.target.value })} placeholder="+91…" /></Col>
          </Row>
          <Row>
            <Col md={6} className="mb-2"><Label>Institution</Label><Input value={f.institutionName || ""} onChange={(e) => setF({ ...f, institutionName: e.target.value })} /></Col>
            <Col md={6} className="mb-2"><Label>Designation</Label><Input value={f.designation || ""} onChange={(e) => setF({ ...f, designation: e.target.value })} /></Col>
          </Row>
          <Row>
            <Col md={6} className="mb-2"><Label>Occupancy</Label>
              <Input type="select" value={f.occupancy || ""} onChange={(e) => setF({ ...f, occupancy: e.target.value })}>
                <option value="">—</option><option value="double">Double</option><option value="single">Single</option>
              </Input>
            </Col>
            <Col md={6} className="mb-2"><Label>Travel cluster</Label><Input value={f.travelCluster || ""} onChange={(e) => setF({ ...f, travelCluster: e.target.value })} /></Col>
          </Row>
        </ModalBody>
        <ModalFooter>
          <Button color="light" type="button" onClick={onClose}>Cancel</Button>
          <Button color="primary" type="submit" disabled={busy}>{busy ? <Spinner size="sm" /> : "Add"}</Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
};

/* ----------------------- Cohort tools panel ---------------------------- */
const rowsToCsv = (rows) => {
  if (!rows || !rows.length) return "";
  const headers = Object.keys(rows[0]);
  const esc = (v) => { const s = v == null ? "" : String(v); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  return [headers.join(","), ...rows.map((r) => headers.map((h) => esc(r[h])).join(","))].join("\n");
};
const downloadCsv = (filename, csv) => {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
};

const CohortTools = ({ tourId, onChanged }) => {
  const [analytics, setAnalytics] = useState(null);
  const [weather, setWeather] = useState(null);
  const [busy, setBusy] = useState("");
  const [bulkOpen, setBulkOpen] = useState(false);

  const loadAnalytics = async () => {
    try { const r = await getTourAnalytics(tourId); setAnalytics(r?.data?.analytics || null); }
    catch (e) { /* silent */ }
  };
  useEffect(() => { loadAnalytics(); /* eslint-disable-next-line */ }, [tourId]);

  const fetchWeather = async () => {
    setBusy("weather");
    try { const r = await getTourWeather(tourId); setWeather(r?.data?.weather || null); }
    catch (e) { showToastError("Weather unavailable", "Error"); }
    finally { setBusy(""); }
  };

  const exportManifest = async (type) => {
    setBusy(type);
    try {
      const r = await getManifest(tourId, type);
      const rows = r?.data?.rows || [];
      if (!rows.length) { showToastError("No data to export", "Manifest"); return; }
      downloadCsv(`${type}-manifest.csv`, rowsToCsv(rows));
    } catch (e) { showToastError("Export failed", "Error"); }
    finally { setBusy(""); }
  };

  const runReminders = async () => {
    if (!window.confirm("Run due reminders now? This sends any deadline-driven messages that are due today.")) return;
    setBusy("automations");
    try {
      const r = await runAutomations(tourId);
      const res = r?.data?.result || {};
      showToastSuccess(`Sent ${res.sent || 0}, skipped ${res.skipped || 0}, failed ${res.failed || 0}`, "Reminders");
      onChanged && onChanged();
    } catch (e) { showToastError("Automation run failed", "Error"); }
    finally { setBusy(""); }
  };

  const a = analytics;
  return (
    <Card><CardBody>
      <Row className="align-items-center">
        <Col>
          <h6 className="mb-0"><i className="bx bx-trending-up me-1" /> Cohort Tools</h6>
        </Col>
        <Col className="text-end">
          <Button size="sm" color="soft-info" className="me-2" onClick={fetchWeather} disabled={busy === "weather"}>
            {busy === "weather" ? <Spinner size="sm" /> : <><i className="bx bx-cloud me-1" />Live weather</>}
          </Button>
          <Button size="sm" color="soft-success" className="me-2" onClick={() => setBulkOpen(true)}>
            <i className="bx bx-broadcast me-1" />Bulk message
          </Button>
          <Button size="sm" color="soft-warning" onClick={runReminders} disabled={busy === "automations"}>
            {busy === "automations" ? <Spinner size="sm" /> : <><i className="bx bx-bell me-1" />Run reminders</>}
          </Button>
        </Col>
      </Row>

      {a && (
        <Row className="mt-3 g-2">
          <Stat label="Headcount" value={a.totalHeadcount} sub={`${a.totalParticipants} leads`} />
          <Stat label="Solo" value={a.soloTravellers} />
          <Stat label="Collection" value={`${a.revenue?.collectionRate || 0}%`} sub={`₹${(a.revenue?.paidTotal || 0).toLocaleString("en-IN")}`} />
          <Stat label="Outstanding" value={`₹${(a.revenue?.outstanding || 0).toLocaleString("en-IN")}`} />
          <Stat label="Docs done" value={`${a.documents?.completionRate || 0}%`} sub={`${a.documents?.completed}/${a.documents?.required}`} />
          <Stat label="Wants extension" value={a.extensionDemand?.yes || 0} />
        </Row>
      )}

      {weather && (
        <div className="alert alert-info mt-3 mb-0">
          <strong><i className="bx bx-map-pin me-1" />{weather.place}:</strong> {weather.temperatureRange} · {weather.condition}
          {weather.indicative ? " (indicative)" : ""} — <span className="text-muted">{weather.packingHint}</span>
        </div>
      )}

      <div className="mt-3">
        <span className="text-muted me-2 small">Export manifests:</span>
        {["rooming", "dietary", "flight"].map((t) => (
          <Button key={t} size="sm" color="light" className="me-2 text-capitalize" onClick={() => exportManifest(t)} disabled={busy === t}>
            <i className="bx bx-download me-1" />{t} CSV
          </Button>
        ))}
      </div>

      <BulkMessageModal isOpen={bulkOpen} tourId={tourId} onClose={() => setBulkOpen(false)} onSent={() => { setBulkOpen(false); onChanged && onChanged(); }} />
    </CardBody></Card>
  );
};

const Stat = ({ label, value, sub }) => (
  <Col xs={6} md={2}>
    <div className="border rounded p-2 text-center h-100">
      <h5 className="mb-0">{value}</h5>
      <small className="text-muted d-block">{label}</small>
      {sub ? <small className="text-muted" style={{ fontSize: 11 }}>{sub}</small> : null}
    </div>
  </Col>
);

const BulkMessageModal = ({ isOpen, tourId, onClose, onSent }) => {
  const [templateKey, setTemplateKey] = useState("custom");
  const [stage, setStage] = useState("");
  const [channels, setChannels] = useState({ email: true, whatsapp: false, sms: false });
  const [vars, setVars] = useState({});
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (isOpen) { setVars({}); setStage(""); } }, [isOpen]);

  const send = async () => {
    const chans = Object.entries(channels).filter(([, v]) => v).map(([k]) => k);
    if (!chans.length) { showToastError("Select a channel", "Validation"); return; }
    if (!window.confirm("Send this message to the whole (filtered) cohort?")) return;
    setBusy(true);
    try {
      const r = await bulkMessage(tourId, templateKey, chans, vars, stage || undefined);
      const d = r?.data || {};
      showToastSuccess(`${d.sent || 0}/${d.recipients || 0} sent`, "Bulk message");
      onSent();
    } catch (e) { showToastError("Bulk send failed", "Error"); }
    finally { setBusy(false); }
  };

  return (
    <Modal isOpen={isOpen} toggle={onClose} centered>
      <ModalHeader toggle={onClose}>Bulk message to cohort</ModalHeader>
      <ModalBody>
        <Label>Template</Label>
        <Input type="select" value={templateKey} onChange={(e) => setTemplateKey(e.target.value)}>
          {MESSAGE_TEMPLATES.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
        </Input>
        <Label className="mt-2">Only stage (optional)</Label>
        <Input type="select" value={stage} onChange={(e) => setStage(e.target.value)}>
          <option value="">All stages</option>
          {PARTICIPANT_STAGES.map((s) => <option key={s} value={s}>{STAGE_LABELS[s]}</option>)}
        </Input>
        <Label className="mt-2">Channels</Label>
        <div className="d-flex gap-3">
          {["email", "whatsapp", "sms"].map((c) => (
            <div className="form-check" key={c}>
              <input className="form-check-input" type="checkbox" id={`bch-${c}`} checked={channels[c]}
                     onChange={(e) => setChannels({ ...channels, [c]: e.target.checked })} />
              <Label className="form-check-label text-capitalize" for={`bch-${c}`}>{c}</Label>
            </div>
          ))}
        </div>
        {templateKey === "custom" && (
          <>
            <Label className="mt-2">Subject</Label>
            <Input value={vars.subject || ""} onChange={(e) => setVars({ ...vars, subject: e.target.value })} />
            <Label className="mt-2">Heading</Label>
            <Input value={vars.heading || ""} onChange={(e) => setVars({ ...vars, heading: e.target.value })} />
            <Label className="mt-2">Message</Label>
            <Input type="textarea" rows={3} value={vars.message || ""} onChange={(e) => setVars({ ...vars, message: e.target.value })} />
          </>
        )}
        {templateKey === "weather_packing" && (
          <p className="text-muted small mt-2">Leave temperature blank — a live forecast is fetched automatically.</p>
        )}
      </ModalBody>
      <ModalFooter>
        <Button color="light" onClick={onClose}>Cancel</Button>
        <Button color="success" onClick={send} disabled={busy}>{busy ? <Spinner size="sm" /> : "Send to cohort"}</Button>
      </ModalFooter>
    </Modal>
  );
};

export default Participants;

/**
 * Support Tickets — help-desk view for /contact submissions.
 * Status tabs with counts, search, conversation thread per ticket,
 * reply (emails the customer) and status changes (resolution emails too).
 */

import React, { useCallback, useEffect, useState } from "react";
import {
    Container, Row, Col, Card, CardBody, Button, Input, Table, Badge,
    Spinner, Alert, Nav, NavItem, NavLink, Modal, ModalHeader, ModalBody, ModalFooter,
} from "reactstrap";
import classnames from "classnames";
import Breadcrumbs from "components/Common/Breadcrumb";
import { showToastSuccess, showToastError } from "helpers/toastBuilder";
import { getSupportTickets, replySupportTicket, setSupportTicketStatus } from "helpers/admin_ops_helper";

const STATUS_TABS = [
    { key: "", label: "All" },
    { key: "OPEN", label: "Open" },
    { key: "IN_PROGRESS", label: "In Progress" },
    { key: "RESOLVED", label: "Resolved" },
    { key: "CLOSED", label: "Closed" },
];

const STATUS_COLORS = { OPEN: "danger", IN_PROGRESS: "warning", RESOLVED: "success", CLOSED: "secondary" };

const SupportTickets = () => {
    document.title = "Support Tickets | TickYourList Dashboard";

    const [tickets, setTickets] = useState([]);
    const [counts, setCounts] = useState({});
    const [loading, setLoading] = useState(true);
    const [statusTab, setStatusTab] = useState("");
    const [q, setQ] = useState("");
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);

    const [selected, setSelected] = useState(null);
    const [reply, setReply] = useState("");
    const [replying, setReplying] = useState(false);

    const load = useCallback(async (p = 1, status = statusTab, query = q) => {
        setLoading(true);
        try {
            const res = await getSupportTickets({ page: p, limit: 20, ...(status ? { status } : {}), ...(query ? { q: query } : {}) });
            setTickets(res?.data?.tickets || []);
            setCounts(res?.data?.statusCounts || {});
            setTotal(res?.data?.total || 0);
            setPage(p);
        } catch (e) {
            showToastError(e?.response?.data?.message || "Failed to load tickets");
        } finally {
            setLoading(false);
        }
    }, [statusTab, q]);

    useEffect(() => { load(1, statusTab, q); /* eslint-disable-line */ }, [statusTab]);

    const handleReply = async () => {
        if (!reply.trim()) return;
        setReplying(true);
        try {
            const res = await replySupportTicket(selected._id, reply.trim());
            if (res?.data?.emailSent === false) {
                showToastError("Reply saved, but the email to the customer failed — retry or contact them directly");
            } else {
                showToastSuccess("Reply sent — the customer has been emailed");
            }
            setSelected(res?.data?.ticket || null);
            setReply("");
            load(page);
        } catch (e) {
            showToastError(e?.response?.data?.message || "Failed to send reply");
        } finally {
            setReplying(false);
        }
    };

    const handleStatus = async (status) => {
        try {
            const res = await setSupportTicketStatus(selected._id, status);
            showToastSuccess(`Ticket marked ${status.toLowerCase().replace("_", " ")}${status === "RESOLVED" ? " — customer notified" : ""}`);
            setSelected(res?.data?.ticket || null);
            load(page);
        } catch (e) {
            showToastError(e?.response?.data?.message || "Failed to update status");
        }
    };

    const totalPages = Math.max(1, Math.ceil(total / 20));

    return (
        <div className="page-content">
            <Container fluid>
                <Breadcrumbs title="Business Ops" breadcrumbItem="Support Tickets" />

                <Card>
                    <CardBody>
                        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                            <Nav pills>
                                {STATUS_TABS.map((t) => (
                                    <NavItem key={t.key}>
                                        <NavLink
                                            style={{ cursor: "pointer" }}
                                            className={classnames({ active: statusTab === t.key })}
                                            onClick={() => setStatusTab(t.key)}
                                        >
                                            {t.label}
                                            {t.key && counts[t.key] ? <Badge color="light" className="ms-1 text-dark">{counts[t.key]}</Badge> : null}
                                        </NavLink>
                                    </NavItem>
                                ))}
                            </Nav>
                            <div className="d-flex gap-2" style={{ maxWidth: 360 }}>
                                <Input
                                    bsSize="sm"
                                    placeholder="Search email, name, ticket #"
                                    value={q}
                                    onChange={(e) => setQ(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && load(1)}
                                />
                                <Button size="sm" color="primary" onClick={() => load(1)}>Search</Button>
                            </div>
                        </div>

                        {loading ? (
                            <div className="text-center py-5"><Spinner color="primary" /></div>
                        ) : tickets.length === 0 ? (
                            <Alert color="info">No tickets{statusTab ? ` with status ${statusTab}` : ""} 🎉</Alert>
                        ) : (
                            <Table responsive hover className="align-middle">
                                <thead>
                                    <tr>
                                        <th>Ticket</th>
                                        <th>Customer</th>
                                        <th>Last message</th>
                                        <th>Status</th>
                                        <th>Updated</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tickets.map((t) => {
                                        const last = t.messages?.[t.messages.length - 1];
                                        return (
                                            <tr key={t._id} style={{ cursor: "pointer" }} onClick={() => setSelected(t)}>
                                                <td>
                                                    <code>{t.ticketNumber}</code>
                                                    {t.subject && <div><small className="text-muted">{t.subject}</small></div>}
                                                </td>
                                                <td>
                                                    <div className="fw-semibold">{t.name}</div>
                                                    <small className="text-muted">{t.email}</small>
                                                </td>
                                                <td style={{ maxWidth: 320 }}>
                                                    <span className="text-truncate d-inline-block w-100" title={last?.body}>
                                                        {last?.sender === "SUPPORT" ? "↩ " : ""}{last?.body}
                                                    </span>
                                                </td>
                                                <td><Badge color={STATUS_COLORS[t.status] || "secondary"}>{t.status.replace("_", " ")}</Badge></td>
                                                <td style={{ whiteSpace: "nowrap" }}>{new Date(t.updatedAt).toLocaleString()}</td>
                                                <td><Button size="sm" color="light" onClick={(e) => { e.stopPropagation(); setSelected(t); }}>Open</Button></td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </Table>
                        )}

                        {totalPages > 1 && (
                            <div className="d-flex justify-content-center align-items-center gap-2 mt-3">
                                <Button size="sm" color="light" disabled={page <= 1} onClick={() => load(page - 1)}>Prev</Button>
                                <span className="text-muted small">{page} / {totalPages}</span>
                                <Button size="sm" color="light" disabled={page >= totalPages} onClick={() => load(page + 1)}>Next</Button>
                            </div>
                        )}
                    </CardBody>
                </Card>

                {/* Thread modal */}
                <Modal isOpen={!!selected} toggle={() => setSelected(null)} size="lg">
                    {selected && (
                        <>
                            <ModalHeader toggle={() => setSelected(null)}>
                                <code>{selected.ticketNumber}</code>{" "}
                                <Badge color={STATUS_COLORS[selected.status]} className="ms-2">{selected.status.replace("_", " ")}</Badge>
                            </ModalHeader>
                            <ModalBody>
                                <p className="mb-3">
                                    <strong>{selected.name}</strong> · <a href={`mailto:${selected.email}`}>{selected.email}</a>
                                    {selected.phone ? <> · {selected.phone}</> : null}
                                    <br />
                                    <small className="text-muted">
                                        {selected.subject ? <>Topic: {selected.subject} · </> : null}
                                        Opened {new Date(selected.createdAt).toLocaleString()}
                                    </small>
                                </p>

                                <div style={{ maxHeight: 360, overflowY: "auto" }} className="mb-3">
                                    {(selected.messages || []).map((m, i) => (
                                        <div
                                            key={i}
                                            className={`mb-2 p-3 rounded ${m.sender === "SUPPORT" ? "bg-primary bg-opacity-10 ms-4" : "bg-light me-4"}`}
                                        >
                                            <div className="d-flex justify-content-between mb-1">
                                                <small className="fw-semibold">{m.sender === "SUPPORT" ? (m.agentName || "Support") : selected.name}</small>
                                                <small className="text-muted">{new Date(m.at).toLocaleString()}</small>
                                            </div>
                                            <div style={{ whiteSpace: "pre-wrap" }}>{m.body}</div>
                                        </div>
                                    ))}
                                </div>

                                <Input
                                    type="textarea"
                                    rows={3}
                                    placeholder="Write a reply — it will be emailed to the customer…"
                                    value={reply}
                                    onChange={(e) => setReply(e.target.value)}
                                />
                            </ModalBody>
                            <ModalFooter className="justify-content-between">
                                <div className="d-flex gap-2">
                                    {selected.status !== "RESOLVED" && (
                                        <Button color="success" size="sm" onClick={() => handleStatus("RESOLVED")}>
                                            <i className="mdi mdi-check me-1" />Resolve
                                        </Button>
                                    )}
                                    {selected.status !== "CLOSED" && (
                                        <Button color="secondary" size="sm" onClick={() => handleStatus("CLOSED")}>Close</Button>
                                    )}
                                    {(selected.status === "RESOLVED" || selected.status === "CLOSED") && (
                                        <Button color="warning" size="sm" onClick={() => handleStatus("OPEN")}>Reopen</Button>
                                    )}
                                </div>
                                <Button color="primary" disabled={replying || !reply.trim()} onClick={handleReply}>
                                    {replying ? <Spinner size="sm" /> : <><i className="mdi mdi-send me-1" />Send Reply</>}
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </Modal>
            </Container>
        </div>
    );
};

export default SupportTickets;

/**
 * TylCash Management — admin view over the loyalty wallet.
 *  - Program analytics (earned / redeemed / expired totals)
 *  - Config editor: enable, earning rule, redemption limits, expiry policy
 *  - Customer lookup by email: balance, full transaction history,
 *    manual adjust (+/-) with reason (audit-logged server-side)
 */

import React, { useEffect, useState } from "react";
import {
    Container, Row, Col, Card, CardBody, CardTitle, Button, Input, Label,
    Table, Badge, Spinner, Alert, Form, FormGroup,
} from "reactstrap";
import Breadcrumbs from "components/Common/Breadcrumb";
import { showToastSuccess, showToastError } from "helpers/toastBuilder";
import {
    getTylCashConfig, updateTylCashConfig, getTylCashAnalytics,
    getCustomerTylCash, adjustCustomerTylCash, recalculateCustomerTylCash,
    getCustomer360,
} from "helpers/admin_ops_helper";

const TX_COLORS = { EARNED: "success", REDEEMED: "primary", EXPIRED: "danger", BONUS: "info", REFUNDED: "success" };

const TylCashManagement = () => {
    document.title = "TylCash Management | TickYourList Dashboard";

    const [analytics, setAnalytics] = useState(null);
    const [config, setConfig] = useState(null);
    const [configDraft, setConfigDraft] = useState(null);
    const [savingConfig, setSavingConfig] = useState(false);

    // Customer lookup
    const [email, setEmail] = useState("");
    const [searching, setSearching] = useState(false);
    const [customer, setCustomer] = useState(null);
    const [customerTx, setCustomerTx] = useState([]);
    const [txPage, setTxPage] = useState(1);
    const [txTotalPages, setTxTotalPages] = useState(1);

    // Adjustment
    const [adjAmount, setAdjAmount] = useState("");
    const [adjReason, setAdjReason] = useState("");
    const [adjusting, setAdjusting] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const [a, c] = await Promise.all([getTylCashAnalytics(), getTylCashConfig()]);
                setAnalytics(a?.data?.analytics || a?.data || null);
                const cfg = c?.data?.config || null;
                setConfig(cfg);
                setConfigDraft(cfg ? JSON.parse(JSON.stringify(cfg)) : null);
            } catch (e) {
                showToastError(e?.response?.data?.message || "Failed to load TylCash data");
            }
        })();
    }, []);

    const setDraft = (path, value) => {
        setConfigDraft((prev) => {
            const next = JSON.parse(JSON.stringify(prev || {}));
            const keys = path.split(".");
            let obj = next;
            for (let i = 0; i < keys.length - 1; i++) {
                obj[keys[i]] = obj[keys[i]] || {};
                obj = obj[keys[i]];
            }
            obj[keys[keys.length - 1]] = value;
            return next;
        });
    };

    const saveConfig = async () => {
        setSavingConfig(true);
        try {
            // Only send the sections this page edits — the PUT merges by section.
            const payload = {
                isEnabled: configDraft.isEnabled,
                earningRule: configDraft.earningRule,
                redemptionRule: configDraft.redemptionRule,
                expiryPolicy: configDraft.expiryPolicy,
            };
            const res = await updateTylCashConfig(payload);
            const cfg = res?.data?.config || configDraft;
            setConfig(cfg);
            setConfigDraft(JSON.parse(JSON.stringify(cfg)));
            showToastSuccess("TylCash configuration saved");
        } catch (e) {
            showToastError(e?.response?.data?.message || "Failed to save configuration");
        } finally {
            setSavingConfig(false);
        }
    };

    const loadCustomerTx = async (customerId, page = 1) => {
        const res = await getCustomerTylCash(customerId, page);
        const d = res?.data || {};
        setCustomer((prev) => ({ ...(prev || {}), ...(d.customer || {}), summary: d.summary }));
        setCustomerTx(d.transactions?.data || []);
        setTxPage(d.transactions?.pagination?.page || 1);
        setTxTotalPages(d.transactions?.pagination?.totalPages || 1);
    };

    const handleSearch = async () => {
        if (!email.trim()) return;
        setSearching(true);
        setCustomer(null);
        setCustomerTx([]);
        try {
            const res = await getCustomer360(email.trim());
            const acct = res?.data?.customer || res?.data?.account || res?.data;
            const id = acct?._id || acct?.id;
            if (!id) throw new Error("Customer not found");
            await loadCustomerTx(id, 1);
            setCustomer((prev) => ({ ...(prev || {}), id }));
        } catch (e) {
            showToastError(e?.response?.data?.message || e.message || "Customer not found");
        } finally {
            setSearching(false);
        }
    };

    const handleAdjust = async (sign) => {
        const amt = Math.abs(Number(adjAmount));
        if (!amt || !adjReason.trim()) {
            showToastError("Amount and reason are required");
            return;
        }
        if (!window.confirm(`${sign > 0 ? "Add" : "Deduct"} ${amt} TYL ${sign > 0 ? "to" : "from"} ${customer?.email || "this customer"}?\n\nReason: ${adjReason}`)) return;
        setAdjusting(true);
        try {
            await adjustCustomerTylCash(customer.id, sign * amt, adjReason.trim());
            showToastSuccess(`${sign > 0 ? "Added" : "Deducted"} ${amt} TYL`);
            setAdjAmount("");
            setAdjReason("");
            await loadCustomerTx(customer.id, 1);
        } catch (e) {
            showToastError(e?.response?.data?.message || "Adjustment failed");
        } finally {
            setAdjusting(false);
        }
    };

    const handleRecalculate = async () => {
        try {
            await recalculateCustomerTylCash(customer.id);
            showToastSuccess("Balance recalculated from transaction history");
            await loadCustomerTx(customer.id, txPage);
        } catch (e) {
            showToastError(e?.response?.data?.message || "Recalculation failed");
        }
    };

    const stat = (label, value, color = "primary") => (
        <Col md={3} sm={6} key={label}>
            <Card className="mini-stats-wid">
                <CardBody>
                    <p className="text-muted fw-medium mb-1">{label}</p>
                    <h4 className={`mb-0 text-${color}`}>{value}</h4>
                </CardBody>
            </Card>
        </Col>
    );

    return (
        <div className="page-content">
            <Container fluid>
                <Breadcrumbs title="Business Ops" breadcrumbItem="TylCash Management" />

                {/* Analytics */}
                <Row>
                    {stat("Total Earned", `${Number(analytics?.totalEarned || 0).toLocaleString()} TYL`, "success")}
                    {stat("Total Redeemed", `${Number(analytics?.totalRedeemed || 0).toLocaleString()} TYL`, "primary")}
                    {stat("Total Expired", `${Number(analytics?.totalExpired || 0).toLocaleString()} TYL`, "danger")}
                    {stat("Transactions", Number(analytics?.totalTransactions || 0).toLocaleString(), "info")}
                </Row>

                <Row>
                    {/* Config editor */}
                    <Col lg={5}>
                        <Card>
                            <CardBody>
                                <CardTitle className="mb-3">Program Configuration</CardTitle>
                                {!configDraft ? (
                                    <Spinner size="sm" />
                                ) : (
                                    <Form onSubmit={(e) => { e.preventDefault(); saveConfig(); }}>
                                        <div className="form-check form-switch mb-3">
                                            <Input
                                                type="switch"
                                                className="form-check-input"
                                                id="tyl-enabled"
                                                checked={!!configDraft.isEnabled}
                                                onChange={(e) => setDraft("isEnabled", e.target.checked)}
                                            />
                                            <Label className="form-check-label" for="tyl-enabled">
                                                TylCash enabled {configDraft.isEnabled ? <Badge color="success">Live</Badge> : <Badge color="secondary">Off</Badge>}
                                            </Label>
                                        </div>

                                        <h6 className="text-muted">Earning</h6>
                                        <Row>
                                            <Col sm={6}>
                                                <FormGroup>
                                                    <Label>Rule type</Label>
                                                    <Input
                                                        type="select"
                                                        value={configDraft.earningRule?.type || "PERCENTAGE"}
                                                        onChange={(e) => setDraft("earningRule.type", e.target.value)}
                                                    >
                                                        <option value="PERCENTAGE">Percentage of booking</option>
                                                        <option value="FIXED_AMOUNT">Fixed amount</option>
                                                        <option value="SPEND_TO_EARN">Spend-to-earn (Klook style)</option>
                                                        <option value="TIERED">Tiered</option>
                                                    </Input>
                                                </FormGroup>
                                            </Col>
                                            <Col sm={6}>
                                                <FormGroup>
                                                    <Label>Value {configDraft.earningRule?.type === "PERCENTAGE" ? "(%)" : ""}</Label>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        value={configDraft.earningRule?.value ?? ""}
                                                        onChange={(e) => setDraft("earningRule.value", Number(e.target.value))}
                                                    />
                                                </FormGroup>
                                            </Col>
                                        </Row>

                                        <h6 className="text-muted">Redemption</h6>
                                        <Row>
                                            <Col sm={6}>
                                                <FormGroup>
                                                    <Label>Minimum TYL to redeem</Label>
                                                    <Input
                                                        type="number"
                                                        value={configDraft.redemptionRule?.minRedemptionAmount ?? ""}
                                                        onChange={(e) => setDraft("redemptionRule.minRedemptionAmount", Number(e.target.value))}
                                                    />
                                                </FormGroup>
                                            </Col>
                                            <Col sm={6}>
                                                <FormGroup>
                                                    <Label>Max % of booking</Label>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        max="100"
                                                        value={configDraft.redemptionRule?.maxRedemptionPercentage ?? ""}
                                                        onChange={(e) => setDraft("redemptionRule.maxRedemptionPercentage", Number(e.target.value))}
                                                    />
                                                </FormGroup>
                                            </Col>
                                        </Row>

                                        <h6 className="text-muted">Expiry</h6>
                                        <Row>
                                            <Col sm={4}>
                                                <div className="form-check form-switch mt-4">
                                                    <Input
                                                        type="switch"
                                                        className="form-check-input"
                                                        id="tyl-expiry"
                                                        checked={!!configDraft.expiryPolicy?.enableExpiry}
                                                        onChange={(e) => setDraft("expiryPolicy.enableExpiry", e.target.checked)}
                                                    />
                                                    <Label className="form-check-label" for="tyl-expiry">Expiry on</Label>
                                                </div>
                                            </Col>
                                            <Col sm={4}>
                                                <FormGroup>
                                                    <Label>Expiry days</Label>
                                                    <Input
                                                        type="number"
                                                        value={configDraft.expiryPolicy?.defaultExpiryDays ?? ""}
                                                        onChange={(e) => setDraft("expiryPolicy.defaultExpiryDays", Number(e.target.value))}
                                                    />
                                                </FormGroup>
                                            </Col>
                                            <Col sm={4}>
                                                <FormGroup>
                                                    <Label>Warn before (days)</Label>
                                                    <Input
                                                        type="number"
                                                        value={configDraft.expiryPolicy?.expiryWarningDays ?? ""}
                                                        onChange={(e) => setDraft("expiryPolicy.expiryWarningDays", Number(e.target.value))}
                                                    />
                                                </FormGroup>
                                            </Col>
                                        </Row>

                                        <Button color="primary" type="submit" disabled={savingConfig}>
                                            {savingConfig ? <><Spinner size="sm" className="me-1" />Saving…</> : "Save Configuration"}
                                        </Button>
                                    </Form>
                                )}
                            </CardBody>
                        </Card>
                    </Col>

                    {/* Customer lookup */}
                    <Col lg={7}>
                        <Card>
                            <CardBody>
                                <CardTitle className="mb-3">Customer Wallet Lookup</CardTitle>
                                <div className="d-flex gap-2 mb-3" style={{ maxWidth: 480 }}>
                                    <Input
                                        placeholder="customer@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                    />
                                    <Button color="primary" onClick={handleSearch} disabled={searching}>
                                        {searching ? <Spinner size="sm" /> : "Search"}
                                    </Button>
                                </div>

                                {customer && (
                                    <>
                                        <Row className="mb-3">
                                            <Col sm={4}>
                                                <p className="text-muted mb-0">{customer.name || customer.email}</p>
                                                <h4 className="text-success mb-0">{Number(customer.tylcashBalance || 0).toLocaleString()} TYL</h4>
                                                <small className="text-muted">current balance</small>
                                            </Col>
                                            <Col sm={4}>
                                                <p className="mb-0"><small className="text-muted">Earned:</small> {Number(customer.totalTylcashEarned || 0).toLocaleString()}</p>
                                                <p className="mb-0"><small className="text-muted">Redeemed:</small> {Number(customer.totalTylcashRedeemed || 0).toLocaleString()}</p>
                                            </Col>
                                            <Col sm={4} className="text-sm-end">
                                                <Button size="sm" color="light" onClick={handleRecalculate} title="Rebuild balance from transaction history">
                                                    <i className="mdi mdi-refresh me-1" />Recalculate
                                                </Button>
                                            </Col>
                                        </Row>

                                        {/* Manual adjustment */}
                                        <div className="border rounded p-3 mb-3 bg-light">
                                            <h6 className="mb-2">Manual adjustment</h6>
                                            <Row className="g-2">
                                                <Col sm={3}>
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        placeholder="Amount"
                                                        value={adjAmount}
                                                        onChange={(e) => setAdjAmount(e.target.value)}
                                                    />
                                                </Col>
                                                <Col sm={5}>
                                                    <Input
                                                        placeholder="Reason (required, audit-logged)"
                                                        value={adjReason}
                                                        onChange={(e) => setAdjReason(e.target.value)}
                                                    />
                                                </Col>
                                                <Col sm={4} className="d-flex gap-2">
                                                    <Button color="success" size="sm" disabled={adjusting} onClick={() => handleAdjust(1)}>
                                                        <i className="mdi mdi-plus" /> Add
                                                    </Button>
                                                    <Button color="danger" size="sm" disabled={adjusting} onClick={() => handleAdjust(-1)}>
                                                        <i className="mdi mdi-minus" /> Deduct
                                                    </Button>
                                                </Col>
                                            </Row>
                                        </div>

                                        {/* Transactions */}
                                        {customerTx.length === 0 ? (
                                            <Alert color="info" className="py-2">No transactions yet.</Alert>
                                        ) : (
                                            <div style={{ maxHeight: 420, overflowY: "auto" }}>
                                                <Table size="sm" striped responsive>
                                                    <thead>
                                                        <tr>
                                                            <th>Date</th>
                                                            <th>Type</th>
                                                            <th>Description</th>
                                                            <th className="text-end">Amount</th>
                                                            <th className="text-end">Balance after</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {customerTx.map((tx) => (
                                                            <tr key={tx._id}>
                                                                <td style={{ whiteSpace: "nowrap" }}>{new Date(tx.createdAt).toLocaleDateString()}</td>
                                                                <td><Badge color={TX_COLORS[tx.transactionType] || "secondary"}>{tx.transactionType}</Badge></td>
                                                                <td className="text-truncate" style={{ maxWidth: 280 }} title={tx.description}>{tx.description}</td>
                                                                <td className={`text-end fw-semibold ${tx.amount >= 0 ? "text-success" : "text-danger"}`}>
                                                                    {tx.amount >= 0 ? "+" : ""}{tx.amount}
                                                                </td>
                                                                <td className="text-end">{tx.balanceAfter}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </Table>
                                            </div>
                                        )}
                                        {txTotalPages > 1 && (
                                            <div className="d-flex justify-content-center align-items-center gap-2 mt-2">
                                                <Button size="sm" color="light" disabled={txPage <= 1} onClick={() => loadCustomerTx(customer.id, txPage - 1)}>Prev</Button>
                                                <span className="text-muted small">{txPage} / {txTotalPages}</span>
                                                <Button size="sm" color="light" disabled={txPage >= txTotalPages} onClick={() => loadCustomerTx(customer.id, txPage + 1)}>Next</Button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default TylCashManagement;

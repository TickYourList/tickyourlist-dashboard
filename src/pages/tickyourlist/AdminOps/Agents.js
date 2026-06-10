import React, { useState, useEffect, useCallback } from "react";
import {
  Card, CardBody, Container, Table, Spinner, Button, Input, Label, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter, FormGroup,
} from "reactstrap";
import { getAgents, grantAgentByEmail, revokeAgent } from "helpers/admin_ops_helper";
import { showToastSuccess, showToastError } from "helpers/toastBuilder";

/**
 * B2B/affiliate agents: customer accounts that earn a commission % (paid into
 * their TylCash wallet) on every confirmed booking instead of normal cashback.
 */
const Agents = () => {
  document.title = "Agents | TickYourList";
  const [loading, setLoading] = useState(false);
  const [agents, setAgents] = useState([]);

  // Grant modal
  const [grantOpen, setGrantOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [pct, setPct] = useState("10");
  const [granting, setGranting] = useState(false);

  // Revoke confirm
  const [revokeTarget, setRevokeTarget] = useState(null);
  const [revoking, setRevoking] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAgents();
      setAgents(res?.data?.agents || []);
    } catch (e) {
      showToastError(e?.response?.data?.message || "Failed to load agents");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const grant = async () => {
    const pctNum = Number(pct);
    if (!email.includes("@") || !(pctNum > 0 && pctNum <= 50)) {
      showToastError("A customer email and a commission between 1 and 50% are required");
      return;
    }
    setGranting(true);
    try {
      const res = await grantAgentByEmail({ email: email.trim(), commissionPct: pctNum });
      showToastSuccess(`${res?.data?.email} is now an agent at ${pctNum}%`, "Agent granted");
      setGrantOpen(false);
      setEmail("");
      await load();
    } catch (e) {
      showToastError(e?.response?.data?.message || "Could not grant agent access");
    } finally {
      setGranting(false);
    }
  };

  const revoke = async () => {
    setRevoking(true);
    try {
      await revokeAgent(revokeTarget._id);
      showToastSuccess(`${revokeTarget.email} is no longer an agent`, "Agent revoked");
      setRevokeTarget(null);
      await load();
    } catch (e) {
      showToastError(e?.response?.data?.message || "Could not revoke agent access");
    } finally {
      setRevoking(false);
    }
  };

  return (
    <div className="page-content">
      <Container fluid>
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h4 className="mb-0">B2B / Affiliate Agents</h4>
          <Button color="primary" onClick={() => setGrantOpen(true)}>+ Grant agent access</Button>
        </div>

        <Card>
          <CardBody>
            <p className="text-muted small mb-3">
              Agents book through the normal site while logged in. Their commission is credited to
              their TylCash wallet automatically when each booking confirms — the wallet doubles as
              their commission ledger, redeemable against future bookings.
            </p>
            {loading ? (
              <div className="text-center py-5"><Spinner /></div>
            ) : (
              <Table responsive hover className="align-middle">
                <thead>
                  <tr>
                    <th>Agent</th>
                    <th>Email</th>
                    <th className="text-end">Commission</th>
                    <th className="text-end">Wallet (TYL)</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {agents.map((a) => (
                    <tr key={a._id}>
                      <td>{[a.firstName, a.lastName].filter(Boolean).join(" ") || "—"}</td>
                      <td>{a.email}</td>
                      <td className="text-end"><Badge color="success" pill>{a.agentCommissionPct || 0}%</Badge></td>
                      <td className="text-end">{Number(a.tylcashBalance || 0).toLocaleString()}</td>
                      <td className="text-end">
                        <Button size="sm" color="outline-danger" onClick={() => setRevokeTarget(a)}>Revoke</Button>
                      </td>
                    </tr>
                  ))}
                  {agents.length === 0 && (
                    <tr><td colSpan={5} className="text-center text-muted py-4">No agents yet — grant the first one above.</td></tr>
                  )}
                </tbody>
              </Table>
            )}
          </CardBody>
        </Card>

        <Modal isOpen={grantOpen} toggle={() => !granting && setGrantOpen(false)}>
          <ModalHeader toggle={() => setGrantOpen(false)}>Grant agent access</ModalHeader>
          <ModalBody>
            <FormGroup>
              <Label>Customer email</Label>
              <Input type="email" placeholder="agent@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              <div className="form-text">Must already have a customer account on the site.</div>
            </FormGroup>
            <FormGroup>
              <Label>Commission %</Label>
              <Input type="number" min={1} max={50} value={pct} onChange={(e) => setPct(e.target.value)} />
              <div className="form-text">Share of each confirmed booking credited to their TylCash wallet.</div>
            </FormGroup>
          </ModalBody>
          <ModalFooter>
            <Button color="light" onClick={() => setGrantOpen(false)} disabled={granting}>Cancel</Button>
            <Button color="primary" onClick={grant} disabled={granting}>
              {granting ? <Spinner size="sm" /> : "Grant access"}
            </Button>
          </ModalFooter>
        </Modal>

        <Modal isOpen={!!revokeTarget} toggle={() => !revoking && setRevokeTarget(null)}>
          <ModalHeader toggle={() => setRevokeTarget(null)}>Revoke agent access</ModalHeader>
          <ModalBody>
            Remove agent status from <strong>{revokeTarget?.email}</strong>? Their TylCash balance is
            kept; they simply stop earning commission on future bookings.
          </ModalBody>
          <ModalFooter>
            <Button color="light" onClick={() => setRevokeTarget(null)} disabled={revoking}>Cancel</Button>
            <Button color="danger" onClick={revoke} disabled={revoking}>
              {revoking ? <Spinner size="sm" /> : "Revoke"}
            </Button>
          </ModalFooter>
        </Modal>
      </Container>
    </div>
  );
};

export default Agents;

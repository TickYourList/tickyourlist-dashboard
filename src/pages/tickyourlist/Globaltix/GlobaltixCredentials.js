import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Container, Row, Col, Card, CardBody, CardHeader,
  Button, Badge, Spinner, Alert,
} from "reactstrap";
import {
  fetchGlobtixTokenRequest,
  authenticateGlobtixRequest,
} from "store/tickyourlist/globaltix/action";
import { showToastSuccess, showToastError } from "helpers/toastBuilder";

const GlobtixCredentialsPage = () => {
  const dispatch = useDispatch();
  const { tokenInfo, tokenLoading, authLoading, authError } = useSelector((state) => state.globaltix || {});
  const [environment, setEnvironment] = useState("staging");

  useEffect(() => {
    dispatch(fetchGlobtixTokenRequest(environment));
  }, [dispatch, environment]);

  const handleReAuthenticate = () => {
    dispatch(authenticateGlobtixRequest(environment));
    setTimeout(() => dispatch(fetchGlobtixTokenRequest(environment)), 2000);
  };

  const tokenExpiresSoon = tokenInfo?.expiresAt &&
    new Date(tokenInfo.expiresAt) - new Date() < 2 * 60 * 60 * 1000;

  return (
    <div className="page-content">
      <Container fluid>
        <Row>
          <Col xl={6}>
            <h4 className="mb-4">Globaltix Credentials</h4>

            <div className="d-flex gap-2 mb-4">
              {["staging", "production"].map((env) => (
                <Button
                  key={env}
                  color={environment === env ? "primary" : "outline-secondary"}
                  size="sm"
                  onClick={() => setEnvironment(env)}
                >
                  {env.charAt(0).toUpperCase() + env.slice(1)}
                </Button>
              ))}
            </div>

            {authError && <Alert color="danger">{authError}</Alert>}

            <Card>
              <CardHeader className="bg-transparent">
                <div className="d-flex justify-content-between align-items-center">
                  <h6 className="mb-0">
                    <i className="bx bx-key me-2"></i>
                    Active Token — {environment}
                  </h6>
                  <Button
                    color="primary"
                    size="sm"
                    onClick={handleReAuthenticate}
                    disabled={authLoading}
                  >
                    {authLoading ? <Spinner size="sm" /> : <><i className="bx bx-refresh me-1"></i>Re-authenticate</>}
                  </Button>
                </div>
              </CardHeader>
              <CardBody>
                {tokenLoading ? (
                  <div className="text-center py-3"><Spinner /></div>
                ) : tokenInfo?.hasActiveToken ? (
                  <div>
                    {tokenExpiresSoon && (
                      <Alert color="warning" className="mb-3 py-2">
                        Token expires soon. Consider re-authenticating.
                      </Alert>
                    )}
                    <table className="table table-sm table-borderless mb-0">
                      <tbody>
                        <tr>
                          <td className="text-muted" style={{ width: 140 }}>Status</td>
                          <td><Badge color="success">Active</Badge></td>
                        </tr>
                        <tr>
                          <td className="text-muted">Username</td>
                          <td><code>{tokenInfo.username}</code></td>
                        </tr>
                        <tr>
                          <td className="text-muted">Reseller</td>
                          <td>{tokenInfo.resellerName} (ID: {tokenInfo.resellerId})</td>
                        </tr>
                        <tr>
                          <td className="text-muted">Currency</td>
                          <td>{tokenInfo.currency}</td>
                        </tr>
                        <tr>
                          <td className="text-muted">Issued At</td>
                          <td>{tokenInfo.issuedAt ? new Date(tokenInfo.issuedAt).toLocaleString() : "—"}</td>
                        </tr>
                        <tr>
                          <td className="text-muted">Expires At</td>
                          <td className={tokenExpiresSoon ? "text-warning fw-semibold" : ""}>
                            {tokenInfo.expiresAt ? new Date(tokenInfo.expiresAt).toLocaleString() : "—"}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <i className="bx bx-error-circle text-warning" style={{ fontSize: 40 }}></i>
                    <p className="mt-2 text-muted">No active token found for {environment}.</p>
                    <Button color="primary" onClick={handleReAuthenticate} disabled={authLoading}>
                      {authLoading ? <Spinner size="sm" /> : "Authenticate Now"}
                    </Button>
                  </div>
                )}
              </CardBody>
            </Card>

            <Card className="mt-3">
              <CardHeader className="bg-transparent">
                <h6 className="mb-0"><i className="bx bx-info-circle me-2"></i>API Configuration</h6>
              </CardHeader>
              <CardBody>
                <table className="table table-sm table-borderless mb-0">
                  <tbody>
                    <tr>
                      <td className="text-muted" style={{ width: 140 }}>Environment</td>
                      <td><Badge color={environment === "production" ? "success" : "secondary"}>{environment}</Badge></td>
                    </tr>
                    <tr>
                      <td className="text-muted">Endpoint</td>
                      <td>
                        <code style={{ fontSize: 12 }}>
                          {environment === "production"
                            ? "https://sg-api.globaltix.com"
                            : "https://stg-api.globaltix.com"}
                        </code>
                      </td>
                    </tr>
                    <tr>
                      <td className="text-muted">Auth Header</td>
                      <td><code style={{ fontSize: 12 }}>x-api-key: {"{agentId}/{apiKey}"}</code></td>
                    </tr>
                    <tr>
                      <td className="text-muted">Token TTL</td>
                      <td>24 hours (auto-refreshed on use)</td>
                    </tr>
                    <tr>
                      <td className="text-muted">Rate Limit</td>
                      <td>27,000 req / 5 min (non-transactional)</td>
                    </tr>
                    <tr>
                      <td className="text-muted">Hold Window</td>
                      <td>15 minutes (reserve → confirm)</td>
                    </tr>
                  </tbody>
                </table>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default GlobtixCredentialsPage;

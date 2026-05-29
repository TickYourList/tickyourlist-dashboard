import React, { useState, useEffect } from "react";

const SESSION_KEY = "tyl_gtx_auth";

const VALID_DOMAIN_ID = process.env.REACT_APP_GLOBALTIX_DOMAIN_ID || "";
const VALID_PASSWORD = process.env.REACT_APP_GLOBALTIX_PASSWORD || "";

export function isGlobtixUnlocked() {
  return sessionStorage.getItem(SESSION_KEY) === "1";
}

export function lockGlobtix() {
  sessionStorage.removeItem(SESSION_KEY);
}

export default function GlobaltixAuthGuard({ children }) {
  const [unlocked, setUnlocked] = useState(() => isGlobtixUnlocked());
  const [domainId, setDomainId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setUnlocked(isGlobtixUnlocked());
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    setTimeout(() => {
      if (
        domainId.trim() === VALID_DOMAIN_ID &&
        password === VALID_PASSWORD
      ) {
        sessionStorage.setItem(SESSION_KEY, "1");
        setUnlocked(true);
      } else {
        setError("Invalid Domain ID or password. Please try again.");
      }
      setLoading(false);
    }, 400);
  };

  if (unlocked) return children;

  return (
    <div
      style={{
        minHeight: "80vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f8f8fb",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
          padding: "40px 36px",
          width: "100%",
          maxWidth: 420,
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "#fff3f8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              border: "2px solid #ff007e22",
            }}
          >
            <i className="bx bx-lock-alt" style={{ fontSize: 28, color: "#ff007e" }} />
          </div>
          <h5 style={{ fontWeight: 700, marginBottom: 6, color: "#1a1a2e" }}>
            Restricted Access
          </h5>
          <p style={{ color: "#6c757d", fontSize: 14, margin: 0 }}>
            Enter your Globaltix credentials to continue.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label" style={{ fontWeight: 600, fontSize: 13 }}>
              Domain ID
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter domain ID"
              value={domainId}
              onChange={(e) => setDomainId(e.target.value)}
              autoComplete="off"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label" style={{ fontWeight: 600, fontSize: 13 }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPwd ? "text" : "password"}
                className="form-control"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                style={{ paddingRight: 40 }}
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                style={{
                  position: "absolute",
                  right: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#6c757d",
                  padding: 0,
                }}
              >
                <i className={`bx ${showPwd ? "bx-hide" : "bx-show"}`} />
              </button>
            </div>
          </div>

          {error && (
            <div
              className="alert alert-danger py-2 px-3"
              style={{ fontSize: 13, borderRadius: 8 }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn w-100 mt-2"
            disabled={loading}
            style={{
              background: "#ff007e",
              color: "#fff",
              fontWeight: 600,
              borderRadius: 8,
              border: "none",
            }}
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm me-2" />
            ) : (
              <i className="bx bx-log-in me-2" />
            )}
            Unlock Globaltix
          </button>
        </form>
      </div>
    </div>
  );
}

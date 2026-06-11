import React, { useState, useEffect, useCallback } from "react";
import {
  Card, CardBody, Container, Spinner, Button, Badge,
} from "reactstrap";
import { getModerationReviews, moderateReview } from "helpers/admin_ops_helper";
import { showToastSuccess, showToastError } from "helpers/toastBuilder";

const Stars = ({ n }) => (
  <span className="text-warning">{"★".repeat(Math.round(n || 0))}<span className="text-muted">{"★".repeat(Math.max(0, 5 - Math.round(n || 0)))}</span></span>
);

/**
 * Review moderation: hidden reviews wait here for approval; live ones can be
 * pulled down. Approved = visible on the product page and counted in ratings.
 */
const ReviewsModeration = () => {
  document.title = "Reviews | TickYourList";
  const [show, setShow] = useState("hidden");
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [actingId, setActingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getModerationReviews(show);
      setItems(res?.data?.items || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [show]);

  useEffect(() => { load(); }, [load]);

  const act = async (review, active) => {
    setActingId(review._id);
    try {
      await moderateReview(review._id, active);
      showToastSuccess(active ? "Review approved — now live" : "Review hidden from the site");
      setItems((prev) => prev.filter((r) => r._id !== review._id));
    } catch (e) {
      showToastError(e?.response?.data?.message || "Action failed");
    } finally {
      setActingId(null);
    }
  };

  return (
    <div className="page-content">
      <Container fluid>
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h4 className="mb-0">Reviews moderation</h4>
          <div className="d-flex gap-1">
            {[["hidden", "Awaiting / hidden"], ["live", "Live"], ["all", "All"]].map(([k, label]) => (
              <Button key={k} size="sm" color={show === k ? "primary" : "light"} onClick={() => setShow(k)}>
                {label}
              </Button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5"><Spinner /></div>
        ) : items.length === 0 ? (
          <Card><CardBody className="text-center text-muted py-5">
            {show === "hidden" ? "No reviews waiting for moderation 🎉" : "Nothing here."}
          </CardBody></Card>
        ) : (
          items.map((r) => (
            <Card key={r._id} className="mb-2">
              <CardBody className="py-3">
                <div className="d-flex flex-wrap justify-content-between align-items-start gap-2">
                  <div className="min-w-0">
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      <Stars n={r.rating} />
                      <strong>{r.nonCustomerName || "Anonymous"}</strong>
                      <span className="text-muted small">on {r.tourId?.name || "unknown product"}</span>
                      <span className="text-muted small">· {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ""}</span>
                      {r.active ? <Badge color="success">LIVE</Badge> : <Badge color="secondary">HIDDEN</Badge>}
                    </div>
                    <div className="mt-1 small" style={{ maxWidth: 760 }}>
                      {r.content || r.translatedContent || <span className="text-muted">No written content (rating only)</span>}
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    {!r.active && (
                      <Button size="sm" color="success" disabled={actingId === r._id} onClick={() => act(r, true)}>
                        {actingId === r._id ? <Spinner size="sm" /> : "Approve"}
                      </Button>
                    )}
                    {r.active && (
                      <Button size="sm" color="outline-danger" disabled={actingId === r._id} onClick={() => act(r, false)}>
                        {actingId === r._id ? <Spinner size="sm" /> : "Hide"}
                      </Button>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          ))
        )}
      </Container>
    </div>
  );
};

export default ReviewsModeration;

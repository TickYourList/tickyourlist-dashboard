import React, { useState, useEffect } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Input, Label } from "reactstrap";

/**
 * Reusable confirmation modal — a safer replacement for window.confirm().
 *
 * Controlled by a single `config` object (pass null to close):
 *   {
 *     title, message,
 *     confirmLabel = "Confirm",
 *     confirmColor = "danger",
 *     confirmWord,        // when set, user must type this exact word to enable confirm
 *     onConfirm,          // sync or async; modal closes after it resolves
 *   }
 *
 * Usage:
 *   const [confirm, setConfirm] = useState(null);
 *   ...
 *   setConfirm({ title:"Delete", message:"…", confirmWord:"DELETE", onConfirm: async () => {…} });
 *   <ConfirmModal config={confirm} onClose={() => setConfirm(null)} />
 */
const ConfirmModal = ({ config, onClose }) => {
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);

  // Reset the typed word / busy state whenever a new confirmation is requested.
  useEffect(() => {
    setTyped("");
    setBusy(false);
  }, [config]);

  const open = !!config;
  if (!open) return null;

  const {
    title = "Please confirm",
    message,
    confirmLabel = "Confirm",
    confirmColor = "danger",
    confirmWord,
    onConfirm,
  } = config;

  const ready = !confirmWord || typed.trim().toUpperCase() === String(confirmWord).toUpperCase();

  const handleConfirm = async () => {
    if (!ready || busy) return;
    setBusy(true);
    try {
      await onConfirm?.();
      onClose();
    } catch (e) {
      // Leave the modal open so the caller's toast surfaces the error.
      setBusy(false);
    }
  };

  return (
    <Modal isOpen={open} toggle={busy ? undefined : onClose} centered>
      <ModalHeader toggle={busy ? undefined : onClose}>{title}</ModalHeader>
      <ModalBody>
        {typeof message === "string" ? <p className="mb-2">{message}</p> : message}
        {confirmWord && (
          <div className="mt-3">
            <Label className="text-muted small mb-1">
              Type <strong>{confirmWord}</strong> to confirm
            </Label>
            <Input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder={confirmWord}
              autoFocus
              onKeyDown={(e) => { if (e.key === "Enter" && ready) handleConfirm(); }}
            />
          </div>
        )}
      </ModalBody>
      <ModalFooter>
        <Button color="light" type="button" onClick={onClose} disabled={busy}>
          Cancel
        </Button>
        <Button color={confirmColor} type="button" onClick={handleConfirm} disabled={!ready || busy}>
          {busy ? "Working…" : confirmLabel}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ConfirmModal;

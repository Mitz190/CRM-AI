import Modal from './Modal';
import Button from './Button';
import Alert from './Alert';

export default function ConfirmModal({ open, title, message, confirmLabel = 'Confirm', loading, error, onConfirm, onClose }) {
  return (
    <Modal open={open} title={title} onClose={onClose}>
      <div className="space-y-4">
        <Alert type="error">{error}</Alert>
        <p className="text-sm text-slate-600">{message}</p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="danger" loading={loading} onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </Modal>
  );
}
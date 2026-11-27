import { useState } from 'react';
import { Download } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';
import Alert from './Alert';
import { customerApi } from '../services/customerService';
import { downloadBlob } from '../utils/download';

const TEMPLATE =
  'name,email,phone,company,jobTitle,category,status,website,city,country,notes\n' +
  'Jane Doe,jane@example.com,+1 555 0100,Example Inc,Buyer,smb,active,https://example.com,Austin,USA,Met at conference\n';

export default function ImportCsvModal({ open, onClose, onImported }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const close = () => { setFile(null); setResult(null); setError(''); onClose(); };

  const submit = async (e) => {
    e.preventDefault();
    if (!file) return setError('Choose a CSV file first.');
    setError('');
    setResult(null);
    setUploading(true);
    try {
      setResult(await customerApi.importCsv(file));
      setFile(null);
      onImported(); // refresh the list behind the modal
    } catch (err) {
      setError(err.userMessage);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal open={open} size="lg" title="Import customers from CSV" onClose={close}>
      <form onSubmit={submit} className="space-y-4">
        <p className="text-sm text-slate-500">
          Required column: <b>name</b>. Optional: email, phone, company, jobTitle, category, status, website, city, country, notes.
          Up to 500 rows and 1 MB. Imported customers are assigned to you.
        </p>
        <button type="button" onClick={() => downloadBlob(new Blob([TEMPLATE], { type: 'text/csv' }), 'customer-import-template.csv')}
          className="inline-flex items-center gap-1.5 text-sm text-violet-600 hover:underline">
          <Download size={15} /> Download template
        </button>

        <Alert type="error">{error}</Alert>
        <input type="file" accept=".csv,text/csv" onChange={(e) => setFile(e.target.files[0] || null)}
          className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-xl file:border-0 file:bg-violet-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-violet-700 hover:file:bg-violet-100" />

        {result && (
          <div className="space-y-2">
            <Alert type={result.created ? 'success' : 'info'}>
              {result.created} imported · {result.skipped} skipped
            </Alert>
            {result.errors.length > 0 && (
              <ul className="max-h-40 overflow-y-auto rounded-xl bg-canvas p-3 text-xs text-slate-600 space-y-1">
                {result.errors.map((er, i) => <li key={i}>Row {er.row}: {er.message}</li>)}
                {result.skipped > result.errors.length && <li>…and {result.skipped - result.errors.length} more.</li>}
              </ul>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={close}>{result ? 'Done' : 'Cancel'}</Button>
          <Button type="submit" loading={uploading} disabled={!file}>Import</Button>
        </div>
      </form>
    </Modal>
  );
}
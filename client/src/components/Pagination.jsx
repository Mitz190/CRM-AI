import Button from './Button';

export default function Pagination({ page, pages, total, onChange }) {
  return (
    <div className="flex items-center justify-between text-sm text-slate-500">
      <span>{total} result{total === 1 ? '' : 's'} · Page {page} of {pages}</span>
      <div className="flex gap-2">
        <Button variant="secondary" disabled={page <= 1} onClick={() => onChange(page - 1)}>Previous</Button>
        <Button variant="secondary" disabled={page >= pages} onClick={() => onChange(page + 1)}>Next</Button>
      </div>
    </div>
  );
}
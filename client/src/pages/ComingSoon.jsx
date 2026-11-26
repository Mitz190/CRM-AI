import PageHeader from '../components/PageHeader';

export default function ComingSoon({ title, module }) {
  return (
    <>
      <PageHeader title={title} />
      <div className="bg-white rounded-xl2 shadow-card p-8 max-w-xl text-center">
        <span className="inline-block text-xs font-semibold bg-lavender text-violet-700 px-3 py-1 rounded-full">Future feature</span>
        <p className="text-slate-500 mt-4">This section is planned for {module}.</p>
      </div>
    </>
  );
}
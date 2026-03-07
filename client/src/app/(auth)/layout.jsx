export default function AuthLayout({ children }) {
	return (
		<div className='min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center p-4'>
			{children}
		</div>
	);
}

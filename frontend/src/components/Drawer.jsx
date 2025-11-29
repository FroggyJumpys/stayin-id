export default function Drawer({ children, title, lists }) {
    return (
        <>
            <div className="drawer lg:drawer-open">
                <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
                <div className="drawer-content">
                    {/* Navbar */}
                    <nav className="navbar w-full bg-base-100">
                    <label htmlFor="my-drawer-4" aria-label="open sidebar" className="btn btn-square btn-ghost hover:bg-gray-400">
                        {/* Sidebar toggle icon */}
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor" className="my-1.5 inline-block size-4"><path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z"></path><path d="M9 4v16"></path><path d="M14 10l2 2l-2 2"></path></svg>
                    </label>
                    <div className="px-4">{title}</div>
                    </nav>
                    {/* Page content here */}
                    {children}
                </div>

                <div className="drawer-side is-drawer-close:overflow-visible">
                    <label htmlFor="my-drawer-4" aria-label="close sidebar" className="drawer-overlay"></label>
                    <div className="flex min-h-full flex-col items-start bg-base-100 is-drawer-close:w-14 is-drawer-open:w-64">
                    {/* Sidebar content here */}
                    <ul className="menu w-full grow">
                        {lists && lists.map((item, index) => (
                            <li key={index}>
                                <button 
                                    className="is-drawer-close:tooltip is-drawer-close:tooltip-right" 
                                    data-tip={item.title}
                                    onClick={item.onClick}
                                >
                                    {item.icon ? (
                                        <img 
                                            src={item.icon} 
                                            alt={item.title}
                                            className="my-1.5 inline-block size-4 object-contain"
                                        />
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor" className="my-1.5 inline-block size-4">
                                            <circle cx="12" cy="12" r="10"></circle>
                                        </svg>
                                    )}
                                    <span className="is-drawer-close:hidden">{item.title}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                    </div>
                </div>
            </div>
        </>
    )
}
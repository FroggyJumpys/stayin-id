export default function Stat({ stats = [] }) {
    return (
        <>
            <div className="stats shadow flex gap-10">
                {stats.map((item, idx) => (
                    <div key={idx} className="stat bg-base-100 ">
                        {item.figure && (
                            <div className={`stat-figure ${item.figureTint || ''}`}>
                                {typeof item.figure === 'string' ? (
                                    // image/icon url
                                    <img src={item.figure} alt={item.title || 'stat'} className="inline-block h-8 w-8 object-contain" />
                                ) : (
                                    // custom React node
                                    item.figure
                                )}
                            </div>
                        )}

                        {item.title && (
                            <div className="stat-title">{item.title}</div>
                        )}
                        {item.value && (
                            <div className={`stat-value ${item.valueTint || ''}`}>{item.value}</div>
                        )}
                        {item.desc && (
                            <div className={`stat-desc ${item.descTint || ''}`}>{item.desc}</div>
                        )}
                    </div>
                ))}
            </div>
        </>
    )
}
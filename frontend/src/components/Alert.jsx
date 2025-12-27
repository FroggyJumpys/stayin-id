export default function Alert(message, status) {
    if (!message && status === 0) {
        return null
    };

    if (status >= 200 && status < 300) {
        return (
            <div className="toast">
                <div className="alert alert-success">
                    <span>{message}</span>
                </div>
            </div>
    );
    } else if (status >= 300 && status < 400) {
        return (
            <div className="toast">
                <div className="alert alert-info">
                    <span>{message}</span>
                </div>
            </div>
        );
    } else if (status >= 400 && status < 500) {
        return (
            <div className="toast">
                <div className="alert alert-error">
                    <span>{message}</span>
                </div>
            </div>
        );
    } else {
        return (
                <div className="toast">
                    <div className="alert alert-warning">
                        <span>{message}</span>
                    </div>
                </div>
            );
    };
};
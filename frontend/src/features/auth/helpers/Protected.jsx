import { Navigate } from 'react-router-dom';
import { Auth } from './Auth';

/**
 * Protected
 * Melindungi route:
 * - Tunggu user selesai di-load
 * - Jika tidak ada user -> redirect ke /login
 * - Jika role tidak sesuai -> redirect ke /
 * - Jika lolos semua -> render children
 *
 * requiredRole bisa string atau array of string.
 * Contoh:
 *   <Protected requiredRole="admin">...</Protected>
 *   <Protected requiredRole={['admin','staff']}>...</Protected>
 */
export function Protected({ children, requiredRole = 'guest' }) {
    const { user, isLoading, isError } = Auth();

    // Loading state: jangan render konten sebelum selesai.
    if (isLoading) {
        return (
        <div className="w-full min-h-screen flex items-center justify-center">
            <span className="loading loading-spinner loading-lg" />
        </div>
        );
    }

    // Error atau tidak ada user -> paksa login
    if (isError || !user) {
        return <Navigate to="/login" replace />;
    }

    // Cek role (support array)
    const hasRole = Array.isArray(requiredRole)
        ? requiredRole.includes(user.role)
        : user.role === requiredRole;

    if (!hasRole) {
        return <Navigate to="/" replace />;
    }

    // Authorized
    return children;
}
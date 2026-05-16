import {BrowserRouter, Route, Routes} from 'react-router-dom';
import Login from './Login';
import ProtectedRoute from './ProtectedRoute';
import {useAuth} from './useAuth';
import Dashboard from './Dashboard';
import ProtectedRoute from './ProtectedRoute';

export default function AppProtectedRoute(){
    const {user, loading, checkAuth} = useAuth();

    const logout = async() => {
        await fetch("http://localhost:30000/logout", {
            method: "POST",
            credentials: "include"
        });
        checkAuth();
    };

    return(
        <BrowserRouter>
            <Routes>
                {/** Publica */}
                <Route
                    path="/login"
                    element={<Login onLogin={checkAuth}/>}
                />
                {/** Protegidas */}
                <Protected Route path="/dashboard" element={<ProtectedRoute user={user} loading={loading}/>} />
                {/** Default */}
                <Route path="*" element={<Login onLogin={checkAuth}/>} />
            </Routes>
        </BrowserRouter>
    )
}
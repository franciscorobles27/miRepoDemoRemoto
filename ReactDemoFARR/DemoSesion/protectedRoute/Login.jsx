import {useState} from 'react';
import {useNavigate} from 'react-router-dom';

export default function Login({onLogin}){
    const [username, setUsername] = useState("admin");
    const [password, setPassword] = useState("1234");
    const navigate = useNavigate();

    const login = async() => {
        const res = await fetch("http://localhost:30000/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({username, password})
        });
        if(res.ok){
            await onLogin();
            navigate("/dashboard");
        }
    };

    return(
        <div>
            <h1>Login</h1>
            <input 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={login}>Iniciar Sesión</button>
        </div>
    );
}
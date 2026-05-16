import { useAuthCookie } from "./useAuthCookie";

export function AppCookie(){
    const {token, login, logout}=useAuthCookie();

    return(
        <div>
            <h3>Auth con Cookie</h3>
            {
                token ? (
                    <>
                        <p>Sesion Activa</p>
                        <button onClick={logout}>
                            Logout
                        </button>
                    </>
                ):(
                    <button onClick={login}>
                        Login
                    </button>
                )
            }
        </div>
    );
}
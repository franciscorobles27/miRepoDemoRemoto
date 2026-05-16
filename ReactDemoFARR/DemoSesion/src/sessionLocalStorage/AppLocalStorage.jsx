import useAuthLocalStorage from './useAuthLocalStorage';

export default function AppLocalStorage(){
    const {token,login,logout} = useAuthLocalStorage();

    return(
        <div>
            <h3>Auth con localStorage</h3>
            {
                token ? (
                    <>
                        <p>Sesion Activa</p>
                        <button onClick={logout}>
                            Logout
                        </button>
                    </>
                ):(
                    <>
                        <button onClick={login}>
                            Login
                        </button>
                    </>
                )
            }
        </div>
    );
};
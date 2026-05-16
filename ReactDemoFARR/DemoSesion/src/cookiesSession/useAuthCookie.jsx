import { useState, useEffect } from "react";
import { setCookie, getCookie, deleteCookie} from "./cookies";

export function useAuthCookie(){
    const [token, setToken]=useState(null);

    useEffect(()=>{
        const saved=getCookie("token");
        if(saved) setToken(saved);
    },[]);

    const login=()=>{
        const fakeToken="123abc";
        setCookie("token",fakeToken,1);
        setToken(fakeToken);
    }

    const logout=()=>{
        deleteCookie("token");
        setToken(null);
    }

    return {token, login, logout};
}
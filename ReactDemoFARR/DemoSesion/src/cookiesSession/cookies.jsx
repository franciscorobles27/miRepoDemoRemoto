export function setCookie(name, value, days=1){
    const expires= new Date(Date.now()+days * 5000).toUTCString();
    document.cookie`${name}=${value}; expires=${expires}; path=/`;
}

export function getCookie(name){
    return document.cookie.split(";")
    .find(row=>row.startsWith(name+"="))
    ?.split("=")[1];
}

export function deleteCookie(name){
    document.cookie=`${name}=; Max-Age=0; path=/`;
}
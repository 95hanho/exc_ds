export const cookies = {
    set(name, value, seconds) {
        const date = new Date();
        date.setTime(date.getTime() + seconds * 1000);
        const expires = "expires=" + date.toUTCString();
        const secureFlag = location.protocol === "https:" ? "; Secure" : "";
        document.cookie =
            name + "=" + value + ";" + expires + ";path=/" + secureFlag;
    },
    get(name) {
        const decodedCookie = decodeURIComponent(document.cookie);
        const cookies = decodedCookie.split(";");
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.startsWith(name + "=")) {
                return cookie.substring(name.length + 1, cookie.length);
            }
        }
        return null;
    },
    remove(name) {
        document.cookie =
            name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    },
};

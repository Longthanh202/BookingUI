export const decodeJWT = (token: string) => {
    try {
        return JSON.parse(atob(token.split(".")[1]));
    } catch {
        return null;
    }
};

export const getUser = () => {
    if (typeof window === "undefined") return null;

    const token = localStorage.getItem("accessToken");

    if (!token) return null;

    const payload = decodeJWT(token);

    if (!payload) return null;

    const now = Date.now() / 1000;

    if (payload.exp && payload.exp < now) {
        localStorage.removeItem("accessToken");
        return null;
    }

    return payload;
};
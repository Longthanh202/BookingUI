export const decodeJWT = (token: string) => {
    try {
        if (!token) return null;

        // 1. Tách phần payload (phần thứ 2 của JWT)
        const parts = token.split(".");
        if (parts.length < 2) return null;

        let base64Url = parts[1];

        // 2. Chuyển đổi từ Base64Url sang Base64 chuẩn
        let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");

        // 3. Bổ sung padding '=' nếu thiếu
        const pad = base64.length % 4;
        if (pad) {
            if (pad === 1) return null; // Chuỗi không hợp lệ
            base64 += "=".repeat(4 - pad);
        }

        // 4. Giải mã Base64 an toàn với Unicode / tiếng Việt
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split("")
                .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join("")
        );

        const payload = JSON.parse(jsonPayload);

        // 5. Chuẩn hóa Role
        const rawRole =
            payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
            payload.Role ||
            payload.role ||
            (Array.isArray(payload.roles) ? payload.roles[0] : undefined) ||
            "";

        const roleStr = String(rawRole || "").toLowerCase();
        let normalized = "";

        if (roleStr.includes("admin")) normalized = "ADMIN";
        else if (roleStr.includes("owner") || roleStr.includes("hotel")) normalized = "OWNER";
        else if (roleStr.includes("customer") || roleStr.includes("user")) normalized = "CUSTOMER";
        else if (roleStr) normalized = roleStr.toUpperCase();

        // 6. Trả về payload mới kèm field Role đã chuẩn hóa
        return {
            ...payload,
            Role: normalized
        };
    } catch (error) {
        console.error("Lỗi decode JWT:", error); // Bật log để debug nếu vẫn gặp lỗi
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

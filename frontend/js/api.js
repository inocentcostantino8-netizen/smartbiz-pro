// =========================================================================
// SMARTBIZ SYSTEM - CENTRAL DATA SYNCHRONIZATION CONNECTOR (API UTILITIES)
// =========================================================================
// Badilisha kutoka localhost kwenda hapa:
const API_BASE_URL = "https://onrender.com";

const API = {
    // 1. STANDARD GET METHOD (KUVUTA DATA)
    async get(endpoint) {
        const token = localStorage.getItem("smartbiz_token") || sessionStorage.getItem("smartbiz_token");
        const headers = { "Accept": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, { method: "GET", headers: headers });
            const result = await response.json();
            if (!response.ok) throw new Error(result.detail || "Imeshindikana kuvuta data kutoka database.");
            return result;
        } catch (error) {
            console.error(`GET Failure [${endpoint}]:`, error);
            throw error;
        }
    },

    // 2. STANDARD POST METHOD (KUHIFADHI DATA NA KULOGIN)
    async post(endpoint, data, isOAuthForm = false) {
        const token = localStorage.getItem("smartbiz_token") || sessionStorage.getItem("smartbiz_token");
        const headers = {};
        if (!isOAuthForm) headers["Content-Type"] = "application/json";
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const options = {
            method: "POST",
            headers: headers,
            body: isOAuthForm ? data : JSON.stringify(data)
        };

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
            const result = await response.json();
            if (!response.ok) throw new Error(result.detail || "Imeshindikana kuhifadhi data.");
            return result;
        } catch (error) {
            console.error(`POST Failure [${endpoint}]:`, error);
            throw error;
        }
    },

    // 3. STANDARD PATCH METHOD (KUSASISHA DATA VIPANDE VIPANDE)
    async patch(endpoint, data) {
        const token = localStorage.getItem("smartbiz_token") || sessionStorage.getItem("smartbiz_token");
        const headers = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const options = {
            method: "PATCH",
            headers: headers,
            body: JSON.stringify(data)
        };

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
            const result = await response.json();
            if (!response.ok) throw new Error(result.detail || "Imeshindikana kusasisha data.");
            return result;
        } catch (error) {
            console.error(`PATCH Failure [${endpoint}]:`, error);
            throw error;
        }
    },

    // 4. STANDARD PUT METHOD (KUHARIRI NA KUBADILISHA TAARIFA ZOTE - REKEBISHO)
    async put(endpoint, data) {
        const token = localStorage.getItem("smartbiz_token") || sessionStorage.getItem("smartbiz_token");
        const headers = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const options = {
            method: 'PUT',
            headers: headers,
            body: JSON.stringify(data)
        };

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
            const result = await response.json();
            if (!response.ok) throw new Error(result.detail || "Imeshindikana kuhariri taarifa hizi.");
            return result;
        } catch (error) {
            console.error(`PUT Failure [${endpoint}]:`, error);
            throw error;
        }
    },

    // 5. STANDARD DELETE METHOD (KUFUTA MIAMALA NA AKAUNTI)
    async delete(endpoint) {
        const token = localStorage.getItem("smartbiz_token") || sessionStorage.getItem("smartbiz_token");
        const headers = { "Accept": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, { method: 'DELETE', headers: headers });
            const result = await response.json();
            if (!response.ok) throw new Error(result.detail || "Imeshindikana kufuta muamala huu.");
            return result;
        } catch (error) {
            console.error(`DELETE Failure [${endpoint}]:`, error);
            throw error;
        }
    }
}; // <-- Mabano haya yanatakiwa kufunga kitu kizima cha API hapa mwishoni!

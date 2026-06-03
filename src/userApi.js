const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default async function api(endpoint, method = 'GET', body = null) {
    try {
        const options = {
            method: method,
            credentials: 'include', 
            headers: {}
        };

        if (body) {
            if (body instanceof FormData) {
                options.body = body;
            } else {
                options.headers['Content-Type'] = 'application/json';
                options.body = JSON.stringify(body);
            }
        }

        let response = await fetch(`${BASE_URL}/${endpoint}`, options);

        if (response.status === 401) {
            try {
                
                const refreshResponse = await fetch(`${BASE_URL}/refresh`, {
                    method: 'POST',
                    credentials: 'include'
                });

                if (refreshResponse.ok) {
                    
                    response = await fetch(`${BASE_URL}/${endpoint}`, options);
                } else {
                    return false;
                }
            } catch (refreshError) {
                console.error("Refresh token error:", refreshError);
                return false;
            }
        }

        if (!response.ok) {
            return false;
        }

        return await response.json();

    } catch (error) {
        console.error("Global API error:", error);
        return false;
    }
}
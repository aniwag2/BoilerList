export const getTest = async () => {
    try {
        const res = await fetch("10.0.0.144:8089/api/test", {
            method: "GET",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
        });

        return await res.json();
    } catch (err) {}
};
//defines login function, makes a post request to this endpoint sending 
//username,password in JSON format 
export const login = async (user) => {
	try {
		const res = await fetch("http://localhost:8080/api/auth/login", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
			body: JSON.stringify(user), 
		});
		return await res.json();
	} catch (err) {
		return { error: "Login failed" };
	}
};

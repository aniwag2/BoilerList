import { createContext, useState } from "react";

export const UserContext = createContext(null);

//stores and shares logged-in user across pages 
export const UserProvider = ({ children }) => {
	const [user, setUser] = useState(null); // null until someone logs in

	return (
		<UserContext.Provider value={{ user, setUser }}>
			{children}
		</UserContext.Provider>
	);
};

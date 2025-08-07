import { createContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ value, children }) => (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
);

export default AuthContext;
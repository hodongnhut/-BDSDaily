import { createContext } from 'react';

const TownhouseContext = createContext(null);

export const TownhouseProvider = ({ value, children }) => (
    <TownhouseContext.Provider value={value}>{children}</TownhouseContext.Provider>
);

export default TownhouseContext;
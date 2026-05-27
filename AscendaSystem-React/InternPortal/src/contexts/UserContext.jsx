import React from 'react';

export const UserContext = React.createContext(undefined);

export function useUser() {
  const context = React.useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserContext provider');
  }
  return context;
}


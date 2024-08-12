"use client"

import React, { createContext, useState } from "react";

export const UserStateContext = createContext<{
  userData: any;
  setUserData: React.Dispatch<React.SetStateAction<any>>;
}>({
  userData: null,
  setUserData: () => { },
});

export default function UserStateProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userData, setUserData] = useState<User | null>({});
  return (
    <UserStateContext.Provider value={{ userData, setUserData }}>
      {children}
    </UserStateContext.Provider>
  );
}
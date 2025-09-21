import React, { createContext, useContext, useEffect, useState } from 'react';

const DataContext = createContext();

const DATA_KEY = 'app:data';

export const DataProvider = ({ children }) => {
  const [data, setData] = useState(null);
  const [currentScreen, setCurrentScreenState] = useState(null);

  const getFromLocalStorage = (key) => {
    return new Promise((resolve) => {
      const item = localStorage.getItem(key);
      resolve(item ? JSON.parse(item) : null);
    });
  };

  const setToLocalStorage = (key, value) => {
    return new Promise((resolve) => {
      localStorage.setItem(key, JSON.stringify(value));
      resolve();
    });
  };

  useEffect(() => {
    (async () => {
      const storedData = await getFromLocalStorage(DATA_KEY);
      if (storedData) setData(storedData);
    })();
  }, []);

  useEffect(() => {
    if (data !== null) {
      setToLocalStorage(DATA_KEY, data);
    }
  }, [data]);

  const value = {
    data,
    setData,
    currentScreen,
    setCurrentScreenState,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

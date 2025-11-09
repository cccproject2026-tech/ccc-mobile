import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

const DataContext = createContext();

const DATA_KEY = 'app:data';

export const DataProvider = ({ children }) => {
  const [data, setData] = useState(null);
  const [currentScreen, setCurrentScreenState] = useState(null);

  const getFromStorage = async (key) => {
    try {
      const item = await AsyncStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from storage:', error);
      return null;
    }
  };

  const setToStorage = async (key, value) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error writing to storage:', error);
    }
  };

  useEffect(() => {
    (async () => {
      const storedData = await getFromStorage(DATA_KEY);
      if (storedData) setData(storedData);
    })();
  }, []);

  useEffect(() => {
    if (data !== null) {
      setToStorage(DATA_KEY, data);
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

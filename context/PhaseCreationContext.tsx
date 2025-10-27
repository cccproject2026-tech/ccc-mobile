import React, { createContext, ReactNode, useContext, useState } from 'react';

export interface PhaseRoadmap {
  id: string;
  name: string;
  subheading: string;
  completionTime: string;
  selectedDivision: string;
  bannerImage: string | null;
  fields?: any[]; // Fields configuration from create-roadmap.tsx
}

interface PhaseDetails {
  phaseName: string;
  phaseSubheading: string;
  phaseCompletionTime: string;
  phaseDivisions: string[];
  phaseBannerImage: string;
}

interface PhaseCreationState {
  phaseDetails: PhaseDetails | null;
  roadmaps: PhaseRoadmap[];
  currentRoadmap: PhaseRoadmap | null;
}

interface PhaseCreationContextType {
  state: PhaseCreationState;
  setPhaseDetails: (details: PhaseDetails) => void;
  addRoadmap: (roadmap: Omit<PhaseRoadmap, 'id'>) => PhaseRoadmap;
  updateRoadmap: (id: string, updates: Partial<PhaseRoadmap>) => void;
  setCurrentRoadmap: (roadmap: PhaseRoadmap | null) => void;
  getRoadmaps: () => PhaseRoadmap[];
  clearPhaseData: () => void;
}

const PhaseCreationContext = createContext<PhaseCreationContextType | undefined>(undefined);

export const PhaseCreationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<PhaseCreationState>({
    phaseDetails: null,
    roadmaps: [],
    currentRoadmap: null,
  });

  const setPhaseDetails = (details: PhaseDetails) => {
    setState((prev) => ({
      ...prev,
      phaseDetails: details,
      roadmaps: [],
      currentRoadmap: null,
    }));
  };

  const addRoadmap = (roadmap: Omit<PhaseRoadmap, 'id'>): PhaseRoadmap => {
    const newRoadmap: PhaseRoadmap = {
      ...roadmap,
      id: `roadmap-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    setState((prev) => ({
      ...prev,
      roadmaps: [...prev.roadmaps, newRoadmap],
      currentRoadmap: newRoadmap,
    }));

    return newRoadmap;
  };

  const updateRoadmap = (id: string, updates: Partial<PhaseRoadmap>) => {
    setState((prev) => ({
      ...prev,
      roadmaps: prev.roadmaps.map((roadmap) =>
        roadmap.id === id ? { ...roadmap, ...updates } : roadmap
      ),
      currentRoadmap:
        prev.currentRoadmap?.id === id
          ? { ...prev.currentRoadmap, ...updates }
          : prev.currentRoadmap,
    }));
  };

  const setCurrentRoadmap = (roadmap: PhaseRoadmap | null) => {
    setState((prev) => ({
      ...prev,
      currentRoadmap: roadmap,
    }));
  };

  const getRoadmaps = (): PhaseRoadmap[] => {
    return state.roadmaps;
  };

  const clearPhaseData = () => {
    setState({
      phaseDetails: null,
      roadmaps: [],
      currentRoadmap: null,
    });
  };

  return (
    <PhaseCreationContext.Provider
      value={{
        state,
        setPhaseDetails,
        addRoadmap,
        updateRoadmap,
        setCurrentRoadmap,
        getRoadmaps,
        clearPhaseData,
      }}
    >
      {children}
    </PhaseCreationContext.Provider>
  );
};

export const usePhaseCreation = () => {
  const context = useContext(PhaseCreationContext);
  if (!context) {
    throw new Error('usePhaseCreation must be used within PhaseCreationProvider');
  }
  return context;
};

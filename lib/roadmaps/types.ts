// Roadmap API Types

export interface RoadmapExtra {
  type: 'TEXT_AREA' | 'TEXT_DISPLAY' | 'CHECKBOX' | 'DATE_PICKER' | 'TEXT_FIELD' | 'SECTION';
  name: string;
  placeHolder?: string;
  date?: string;
  haveButton?: boolean;
  buttonName?: string;
  checkboxes?: RoadmapExtra[];
  sections?: RoadmapExtra[];
}

export interface RoadmapItem {
  name: string;
  roadMapDetails?: string;
  description?: string;
  duration: string;
  imageUrl?: string;
  phase?: string;
  totalSteps?: number;
  extras?: RoadmapExtra[];
}

export interface CreateRoadmapRequest {
  type: 'phase';
  name: string;
  roadMapDetails?: string;
  description?: string;
  duration: string;
  imageUrl?: string;
  divisions: string[];
  phase?: string;
  totalSteps?: number;
  roadmaps?: RoadmapItem[];
}

export interface RoadmapResponse {
  _id: string;
  type: string;
  name: string;
  roadMapDetails?: string;
  description?: string;
  status: string;
  duration: string;
  startDate: string;
  endDate: string;
  completedOn: string;
  imageUrl?: string;
  meetings: any[];
  divisions: string[];
  haveNextedRoadMaps: boolean;
  phase?: string;
  totalSteps?: number;
  extras: RoadmapExtra[];
  roadmaps?: RoadmapItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoadmapResponse {
  success: boolean;
  message: string;
  data: RoadmapResponse;
}


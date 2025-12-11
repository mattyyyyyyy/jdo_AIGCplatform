import { CSSProperties } from 'react';

export interface ColorBendsProps {
  colors?: string[];
  rotation?: number;
  speed?: number;
  scale?: number;
  frequency?: number;
  warpStrength?: number;
  mouseInfluence?: number;
  parallax?: number;
  noise?: number;
  autoRotate?: number;
  transparent?: boolean;
  className?: string;
  style?: CSSProperties;
}

export type AppModule = '2d-audio' | '2d-chat' | '3d-avatar' | '2d-avatar';

export interface Asset {
  id: string;
  name: string;
  type: 'base' | 'accessory' | 'template' | 'upload' | 'snapshot';
  category?: 'male' | 'female' | 'pet';
  subCategory?: 'top' | 'bottom' | 'shoes' | 'decoration'; // New field for detailed categorization
  previewColor?: string;
  previewImage?: string;
  src?: string; // For uploaded images/videos
  mediaType?: 'image' | 'video'; // New field to distinguish media type
  compatibleWith?: string[]; // IDs of base models this accessory works with
  state?: { // For saved 3D snapshots
    baseModel: string;
    accessory: string | null;
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: number;
}
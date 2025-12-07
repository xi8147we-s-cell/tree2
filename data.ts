import { Memory, HoldData } from './types';

// PHYSICAL FILE LOCATION: 'public/mem/'
// PATH FORMAT: 'mem/filename.jpg' (No leading slash, no ./, no http)
// These paths are resolved in MemoryModal using robust import.meta.url logic

export const memories: Memory[] = [
  {
    id: 1,
    title: "First Send",
    date: "2025-04-02",
    caption: "Trying hard on the volume!",
    imgUrl: "https://cdn.jsdelivr.net/gh/xi8147we-s-cell/climber@main/bigvolumemoment.jpg",
    position: [1.2, -1.5, 1.2],
  },
  {
    id: 2,
    title: "Outdoor Trip",
    date: "2025-07-19",
    caption: "The skin was gone but the stoke was high.",
    imgUrl: "https://cdn.jsdelivr.net/gh/xi8147we-s-cell/climber@main/outdoorday.jpg",
    position: [-1.3, -0.5, 0.8],
  },
  {
    id: 3,
    title: "Gym Rat Life",
    date: "2025-05-05",
    caption: "Rest days are the best days.",
    imgUrl: "https://cdn.jsdelivr.net/gh/xi8147we-s-cell/climber@main/restlife.jpg",
    position: [0.5, 0.5, -1.2],
  },
  {
    id: 4,
    title: "Cake in gym",
    date: "2025-07-30",
    caption: "Brought a hold cake to the wall? Of course we did.",
    imgUrl: "https://cdn.jsdelivr.net/gh/xi8147we-s-cell/climber@main/cakeingym.jpg",
    position: [-0.8, 1.5, -0.8],
  },
  {
    id: 5,
    title: "In the Reflection",
    date: "2025-05-14",
    caption: "A mirror check!",
    imgUrl: "https://cdn.jsdelivr.net/gh/xi8147we-s-cell/climber@main/mirrormemory.jpg",
    position: [0.9, 2.2, 0.5],
  },
  {
    id: 6,
    title: "Lead",
    date: "2025-08-09",
    caption: "From knot to confidence.",
    imgUrl: "https://cdn.jsdelivr.net/gh/xi8147we-s-cell/climber@main/firstlead.jpg",
    position: [-0.4, -2.0, -1.5],
  },
];


// 10 Holds spiraling up the tree
// Simple Geometric Shapes: box, sphere, dodecahedron
export const holds: HoldData[] = [
  { id: 0, position: [1.3, -2.5, 0], color: '#ef4444', shape: 'box', rotation: [0, 0, 0.2] },
  { id: 1, position: [0.9, -2.0, 1.1], color: '#3b82f6', shape: 'dodecahedron', rotation: [0.2, 0, 0.2] },
  { id: 2, position: [-0.6, -1.5, 1.3], color: '#eab308', shape: 'sphere', rotation: [0, 0, -0.1] },
  { id: 3, position: [-1.3, -1.0, 0.3], color: '#a855f7', shape: 'box', rotation: [0, 1.5, 0] },
  { id: 4, position: [-0.9, -0.5, -0.9], color: '#ec4899', shape: 'dodecahedron', rotation: [-0.2, 0, 0] },
  { id: 5, position: [0.3, 0.0, -1.1], color: '#14b8a6', shape: 'sphere', rotation: [0, 0, 0.1] },
  { id: 6, position: [1.0, 0.6, -0.5], color: '#f97316', shape: 'box', rotation: [0, 0, -0.2] },
  { id: 7, position: [0.7, 1.2, 0.6], color: '#84cc16', shape: 'dodecahedron', rotation: [0.3, 0, 0] },
  { id: 8, position: [-0.3, 1.8, 0.7], color: '#06b6d4', shape: 'sphere', rotation: [0, 0, -0.2] },
  { id: 9, position: [0, 2.4, 0], color: '#f43f5e', shape: 'box', rotation: [0, 0, 0] },
];
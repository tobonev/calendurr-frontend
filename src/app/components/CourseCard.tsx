'use client';

import React from 'react';

interface CourseCardProps {
  id: string;
  name: string;
  code: string;
  credits: number;
  types?: string[];
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDoubleClick?: () => void;
}

const typeColorMap: Record<string, string> = {
  core: 'bg-blue-100 text-blue-800',
  elective: 'bg-green-100 text-green-800',
  critical_tracking: 'bg-yellow-100 text-yellow-800',
};

const CourseCard: React.FC<CourseCardProps> = ({
  id,
  name,
  code,
  credits,
  types = [],
  draggable = true,
  onDragStart,
  onDoubleClick,
}) => {
  return (
    <div
      className="bg-white shadow-sm border border-gray-200 rounded px-3 py-2 mb-2 cursor-pointer hover:bg-gray-50"
      draggable={draggable}
      onDragStart={onDragStart}
      onDoubleClick={onDoubleClick}
    >
      <p className="text-base font-semibold text-gray-800">{name}</p>
      <p className="text-xs text-gray-500">{code} • {credits} credits</p>

      {types.length > 0 && (
        <div className="mt-1 flex gap-1 flex-wrap">
          {types.map((type) => (
            <span
              key={type}
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${typeColorMap[type] || 'bg-gray-200 text-gray-700'}`}
            >
              {type.replace('_', ' ')}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseCard;

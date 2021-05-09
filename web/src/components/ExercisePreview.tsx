import React from "react";

interface ExercisePreviewProps {
  exerciseId: number;
}

export const ExercisePreview: React.FC<ExercisePreviewProps> = ({exerciseId}) => (<>{exerciseId}</>);

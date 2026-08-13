import cicd from './cicd-course.json';
import { levels } from './level-loader';

export type Course = {
  id: string;
  name: string;
  description: string;
  price: { inr: number; usd: number };
  freeLevelIds: string[];
};

export const courses: Course[] = [cicd];
export const getCourseLevels = (courseId: string) => levels.filter((level) => level.courseId === courseId).sort((a, b) => a.index - b.index);

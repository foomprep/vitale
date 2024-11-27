import { Exercise, ExerciseEntry } from "./types";

const VITALE_BOX_URL = "https://directto.link";

export async function postExercise(exercise: Exercise): Promise<ExerciseEntry> {
  const response = await fetch(`${VITALE_BOX_URL}/exercise`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(exercise),
  });
  return response.json();
}

export async function getExerciseNames(): Promise<string[]> {
  const response = await fetch(`${VITALE_BOX_URL}/exercise/names`, {
    method: 'GET',
  });
  return response.json();
}

export async function getExerciseDataByName(name: string): Promise<ExerciseEntry[]> {
  const response = await fetch(`${VITALE_BOX_URL}/exercise/${name}`, {
    method: 'GET',
  });
  return response.json();
}

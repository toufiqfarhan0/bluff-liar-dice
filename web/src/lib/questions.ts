/**
 * The Herd questions & fast-pick options.
 */

export const QUESTIONS = [
  "Name a fruit.",
  "An excuse for being late.",
  "Something you'd never eat cold.",
  "A reason to leave a party early.",
  "Name a colour.",
  "Something in every kitchen.",
  "A thing people lie about.",
  "Name an animal.",
  "Somewhere you'd never swim.",
  "A word you can't spell.",
  "Something you own too many of.",
  "A terrible name for a dog.",
];

export function questionFor(round: number): string {
  return QUESTIONS[(round - 1) % QUESTIONS.length];
}

export const OPTIONS: Record<string, string[]> = {
  "Name a fruit.": ["banana", "apple", "mango", "orange", "grape", "peach"],
  "An excuse for being late.": ["train", "traffic", "alarm", "overslept", "weather", "parking"],
  "Something you'd never eat cold.": ["soup", "rice", "pizza", "eggs", "curry", "toast"],
  "A reason to leave a party early.": ["work", "tired", "headache", "boring", "babysitter", "early"],
  "Name a colour.": ["red", "blue", "green", "yellow", "black", "purple"],
  "Something in every kitchen.": ["kettle", "fridge", "sink", "oven", "spoon", "kitchen"],
  "A thing people lie about.": ["age", "weight", "money", "work", "height", "sleep"],
  "Name an animal.": ["cat", "dog", "lion", "horse", "elephant", "bear"],
  "Somewhere you'd never swim.": ["river", "pond", "sea", "lake", "canal", "pool"],
  "A word you can't spell.": ["rhythm", "necessary", "definitely", "queue", "bureaucracy", "weird"],
  "Something you own too many of.": ["cables", "socks", "mugs", "books", "bags", "pens"],
  "A terrible name for a dog.": ["kevin", "steve", "brian", "cat", "dave", "gary"],
};

export function optionsFor(round: number): string[] {
  return OPTIONS[questionFor(round)] ?? [];
}

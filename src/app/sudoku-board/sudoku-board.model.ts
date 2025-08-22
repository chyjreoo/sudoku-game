import { Difficulty } from 'sudoku-gen/dist/types/difficulty.type';

export interface CellData {
    id: number
    row: number
    col: number
    value: string
    isGiven: boolean
    isUserFilled: boolean
    isError: boolean
    isHighlighted?: boolean
}

export interface UpdateData {
    value?: string
    isUserFilled?: boolean
    isError?: boolean
    isHighlighted?: boolean
}

export const DIFFICULTY_LEVELS = {
    easy: 'easy' as Difficulty,
    medium: 'medium' as Difficulty,
    hard: 'hard' as Difficulty,
    expert: 'expert' as Difficulty,
} as const

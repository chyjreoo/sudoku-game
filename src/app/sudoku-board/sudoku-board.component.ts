import { Component, computed, OnInit, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { SudokuCellComponent } from './sudoku-cell/sudoku-cell.component';
import { CellData, DIFFICULTY_LEVELS, UpdateData } from './sudoku-board.model';
import { getSudoku } from 'sudoku-gen';
import { Difficulty } from 'sudoku-gen/dist/types/difficulty.type';

@Component({
    selector: 'app-sudoku-board',
    imports: [
        NgClass,
        SudokuCellComponent,
    ],
    templateUrl: './sudoku-board.component.html',
    styleUrl: './sudoku-board.component.scss',
})
export class SudokuBoardComponent implements OnInit {

    numberButtons = Array.from({length: 9}, (_, i) => (i + 1).toString())
    difficultyButtons = Object.values(DIFFICULTY_LEVELS)

    private puzzleGrid = signal<string[][] | undefined>(undefined)

    private solutionGrid = signal<string[][] | undefined>(undefined)

    difficulty = signal<Difficulty>('easy')

    gridData = signal<CellData[][] | undefined>(undefined)

    selectedCellId = signal<number | undefined>(undefined)

    selectedCell = computed(() => {
        const id = this.selectedCellId()
        if (!id) return undefined

        const data = this.gridData()
        return data?.flat().find(cell => cell.id === id)
    })

    selectedNum = signal<string | undefined>(undefined)

    isGameComplete = computed(() => {
        const flatGrid = this.gridData()?.flat()
        if (!flatGrid) return false

        return flatGrid?.every(col => !col.isError && col.value !== '')
    })

    isButtonDisabled = computed(() => {
        return (!this.isGameComplete() && !this.selectedCellId()) || this.selectedCell()?.isGiven
    })

    ngOnInit() {
        this.getSodoku()
    }

    private getSodoku() {
        this.resetState()

        const sudoku = getSudoku(this.difficulty())
        this.puzzleGrid.set(this.convertToGrid(sudoku.puzzle))
        this.solutionGrid.set(this.convertToGrid(sudoku.solution))

        this.transGridToCellData()
    }

    private convertToGrid(data: string) {
        const arr = data.split('').map(el => el === '-' ? '' : el)

        let result = []
        for (let i = 0; i < arr.length; i += 9) {
            result.push(arr.slice(i, i + 9))
        }

        return result
    }

    private transGridToCellData() {
        const grid = this.puzzleGrid()
        const data = grid?.map((row, rowIndex) => {
            const num = row.length * rowIndex

            return row.map((cellVal, colIndex) => {
                const id = (colIndex + num) + 1

                return {
                    id: id,
                    row: rowIndex,
                    col: colIndex,
                    value: cellVal,
                    isGiven: !!cellVal,
                    isUserFilled: false,
                    isError: false,
                    isSelected: false,
                }
            })
        })

        this.gridData.set(data)
    }

    getBoardCellNgClass(rowIndex: number, lastRow: boolean, colIndex: number, lastCell: boolean): Record<string, boolean> {
        return {
            'w-10 h-10 flex items-center justify-center text-lg font-semibold': true,
            'border-r border-r-slate-300': (colIndex + 1) % 3 !== 0,
            'border-b border-b-slate-300': (rowIndex + 1) % 3 !== 0,
            'border-r-2 border-r-slate-300': (colIndex + 1) % 3 === 0 && !lastCell,
            'border-b-2 border-b-slate-300': (rowIndex + 1) % 3 === 0 && !lastRow,
            'border-l-0': colIndex === 0,
            'border-t-0': rowIndex === 0,
            'border-r-0': lastCell,
            'border-b-0': lastRow,
        }
    }

    handleCellClick(id: number): void {
        this.selectedCellId.set(id)
        const selectedCell = this.selectedCell()

        const flatData = this.gridData()?.flat()
        const highlightIds = flatData?.filter(el => el.row === selectedCell?.row || el.col === selectedCell?.col).map(cell => cell.id)

        this.resetHighlightStatus()
        this.updateGridMultipleCellsData(highlightIds ?? [], {isHighlighted: true})
    }

    onNumberButtonClick(fillNum?: string) {
        this.selectedNum.set(fillNum)

        const selectedCellId = this.selectedCellId()
        if (!selectedCellId) return

        const data: UpdateData = {
            isUserFilled: true,
            isError: fillNum ? this.checkCellAnswerError(fillNum) : false,
            value: fillNum ?? '',
        }

        this.updateGridCellData(selectedCellId, data)
    }

    private updateGridCellData(cellId: number, newData: UpdateData) {
        const updatedData = this.gridData()?.map(row => {
            return row.map(col => {
                if (col.id === cellId) {
                    return {
                        ...col,
                        ...newData,
                    }
                }
                return col
            })
        })

        this.gridData.set(updatedData)
    }

    private updateGridMultipleCellsData(ids: number[], newData: UpdateData) {
        const targetIds = new Set<number>(ids)

        this.gridData.update(grid => {
            return grid?.map(row => {
                return row.map(cell => targetIds.has(cell.id) ? {...cell, ...newData} : cell)
            })
        })
    }

    private resetHighlightStatus() {
        this.gridData.update(grid =>
            grid?.map(row =>
                row.map(cell => ({ ...cell, isHighlighted: false }))
            )
        )
    }

    private checkCellAnswerError(value: string): boolean {
        const selectedCell = this.selectedCell()
        if (!selectedCell || selectedCell.isGiven) return false

        const correctValue = this.solutionGrid()?.[selectedCell.row][selectedCell.col]

        return value !== correctValue
    }

    onDifficultyButtonClick(level: Difficulty) {
        this.difficulty.set(level)
        this.getSodoku()
    }

    private resetState() {
        this.selectedCellId.set(undefined)
    }
}

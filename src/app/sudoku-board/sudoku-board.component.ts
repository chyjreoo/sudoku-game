import { Component, computed, OnInit, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { SudokuCellComponent } from './sudoku-cell/sudoku-cell.component';
import { CellData, UpdateData } from './sudoku-board.model';
import { getSudoku } from 'sudoku-gen';

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

    sudokuGrid = signal<string[][] | undefined>(undefined)

    private solutionGrid = signal<string[][] | undefined>(undefined)

    gridData = signal<CellData[][] | undefined>(undefined)

    selectedCellId = signal<number | undefined>(undefined)

    selectedCell = computed(() => {
        const id = this.selectedCellId()
        if (!id) return undefined

        const data = this.gridData()
        return data?.flat().find(cell => cell.id === id)
    })

    selectedNum = signal<string | undefined>(undefined)

    ngOnInit() {
        this.getSodoku()
        this.transGridToCellData()
    }

    getSodoku() {
        const sudoku = getSudoku('easy')
        this.sudokuGrid.set(this.convertToGrid(sudoku.puzzle))
        this.solutionGrid.set(this.convertToGrid(sudoku.solution))
        console.log(sudoku)
    }

    convertToGrid(data: string) {
        const arr = data.split('').map(el => el === '-' ? '' : el)

        let result = []
        for (let i = 0; i < arr.length; i += 9) {
            result.push(arr.slice(i, i + 9))
        }

        return result
    }

    transGridToCellData() {
        const grid = this.sudokuGrid()
        const data = grid?.map((row, rowIndex) => {
            const num = row.length * rowIndex

            return row.map((cellVal, colIndex) => {
                const id = colIndex + num

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
        console.log(this.gridData())
    }

    getBoardCellNgClass(rowIndex: number, lastRow: boolean, colIndex: number, lastCell: boolean): Record<string, boolean> {
        return {
            'w-10 h-10 flex items-center justify-center text-lg font-semibold': true,
            'border-r border-r-blue-900/10': (colIndex + 1) % 3 !== 0,
            'border-b border-b-blue-900/10': (rowIndex + 1) % 3 !== 0,
            'border-r-2 border-r-blue-900/30': (colIndex + 1) % 3 === 0 && !lastCell,
            'border-b-2 border-b-blue-900/30': (rowIndex + 1) % 3 === 0 && !lastRow,
            'border-l-0': colIndex === 0,
            'border-t-0': rowIndex === 0,
            'border-r-0': lastCell,
            'border-b-0': lastRow,
        }
    }

    handleCellClick(id: number): void {
        this.selectedCellId.set(id)
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

        this.updateGridData(selectedCellId, data)
    }

    updateGridData(cellId: number, newData: UpdateData) {
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

    checkCellAnswerError(value: string): boolean {
        const selectedCell = this.selectedCell()
        if (!selectedCell || selectedCell.isGiven) return false

        const correctValue = this.solutionGrid()?.[selectedCell.row][selectedCell.col]

        return value !== correctValue
    }
}

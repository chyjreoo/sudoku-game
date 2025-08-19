import { Component, computed, OnInit, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { SudokuCellComponent } from './sudoku-cell/sudoku-cell.component';
import { CellData, UpdateData } from './sudoku-board.model';

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

    numberButtons = Array.from({length: 10}, (_, i) => i)

    sudokuGrid = signal<number[][]>([
        [5, 3, 0, 0, 7, 0, 0, 0, 0],
        [6, 0, 0, 1, 9, 5, 0, 0, 0],
        [0, 9, 8, 0, 0, 0, 0, 6, 0],
        [8, 0, 0, 0, 6, 0, 0, 0, 3],
        [4, 0, 0, 8, 0, 3, 0, 0, 1],
        [7, 0, 0, 0, 2, 0, 0, 0, 6],
        [0, 6, 0, 0, 0, 0, 2, 8, 0],
        [0, 0, 0, 4, 1, 9, 0, 0, 5],
        [0, 0, 0, 0, 8, 0, 0, 7, 9],
    ])

    private solutionGrid = signal<number[][]>([
        [5, 3, 4, 6, 7, 8, 9, 1, 2],
        [6, 7, 2, 1, 9, 5, 3, 4, 8],
        [1, 9, 8, 2, 3, 4, 5, 6, 6],
        [8, 3, 3, 3, 6, 3, 3, 3, 3],
        [4, 6, 5, 8, 3, 3, 2, 1, 1],
        [7, 6, 3, 4, 2, 9, 8, 5, 6],
        [1, 6, 2, 3, 4, 5, 2, 8, 7],
        [1, 2, 3, 4, 1, 9, 4, 3, 5],
        [1, 2, 3, 4, 8, 5, 6, 7, 9],
    ])

    gridData = signal<CellData[][] | undefined>(undefined)

    selectedCellId = signal<number | undefined>(undefined)

    selectedCell = computed(() => {
        const id = this.selectedCellId()
        if (!id) return undefined

        const data = this.gridData()
        return data?.flat().find(cell => cell.id === id)
    })

    selectedNum = signal<number | undefined>(undefined)

    ngOnInit() {
        this.transGridToCellData()
    }

    transGridToCellData() {
        const grid = this.sudokuGrid()
        const data = grid.map((row, rowIndex) => {
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

    onNumberButtonClick(fillNum: number) {
        this.selectedNum.set(fillNum)

        const selectedCellId = this.selectedCellId()
        if (!selectedCellId) return

        const data: UpdateData = {
            isUserFilled: true,
            isError: this.checkCellAnswerError(fillNum),
            value: fillNum,
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

    checkCellAnswerError(value: number): boolean {
        const selectedCell = this.selectedCell()
        if (!selectedCell || selectedCell.isGiven) return false

        const correctValue = this.solutionGrid()[selectedCell.row][selectedCell.col]

        return value !== correctValue
    }
}

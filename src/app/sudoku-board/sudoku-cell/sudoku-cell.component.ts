import { Component, computed, input, output } from '@angular/core';
import { CellData } from '../sudoku-board.model';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-sudoku-cell',
    imports: [
        NgClass,
    ],
    templateUrl: './sudoku-cell.component.html',
    styleUrl: './sudoku-cell.component.scss',
})
export class SudokuCellComponent {

    cellData = input<CellData>()
    isSelected = input<boolean>()
    cellClick = output<number>()

    id = computed(() => this.cellData()?.id ?? -1)

    value = computed(() => this.cellData()?.value)

    isCellBlank = computed(() => this.value() === '' || this.value() === null || this.value() === undefined)

    isHighlighted = computed(() => this.cellData()?.isHighlighted ?? false)

    getCellNgClass() {
        const data = this.cellData()
        return {
            'text-red-500': data?.isError,
            'text-blue-500': data?.isUserFilled && !data?.isError,
            'bg-slate-50': this.isHighlighted() && !this.isSelected(),
            'bg-slate-200/70': this.isHighlighted() && this.isSelected(),
        }
    }

    onCellClick(id: number) {
        this.cellClick.emit(id)
    }
}

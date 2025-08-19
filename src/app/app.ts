import { Component } from '@angular/core';
import { SudokuBoardComponent } from './sudoku-board/sudoku-board.component';

@Component({
    selector: 'app-root',
    imports: [SudokuBoardComponent],
    templateUrl: './app.html',
    styleUrl: './app.scss',
})
export class App {
    protected title = 'sudoku-game'
}

export interface CellData {
    id: number
    row: number
    col: number
    value: string
    isGiven: boolean
    isUserFilled: boolean
    isError: boolean
}

export interface UpdateData extends Pick<CellData, 'isUserFilled' | 'isError' | 'value'> {}

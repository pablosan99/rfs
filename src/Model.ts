
export type Occupancy = {
  frequency: number,
  value: number,
  next?: Occupancy
}

export type RawValue = {
  frequency: number,
  rms: number,
  peak: number
}

export type Data = {
  occupancy: Occupancy[],
  result: RawValue[]
}

export const emptyData: Data = {
  occupancy: [],
  result: []
}
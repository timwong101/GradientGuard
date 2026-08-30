export interface ColorStop {
  id: string
  color: string
  position: number
}

export type TextAlign = 'left' | 'center' | 'right'
export type PreviewSize = 'desktop' | 'mobile' | 'square'

export interface EditorState {
  stops: ColorStop[]
  selectedStopId: string
  angle: number
  text: string
  fontSize: number
  fontWeight: number
  textColor: string
  textAlign: TextAlign
  textX: number
  textY: number
  previewSize: PreviewSize
  scrimColor: string | null
  scrimOpacity: number
  heatmap: boolean
}

export interface SamplePoint {
  x: number
  y: number
  color: string
  ratio: number
  passes: boolean
}

export interface ContrastResult {
  ratio: number
  threshold: number
  passPercentage: number
  passes: boolean
  worst: SamplePoint
  samples: SamplePoint[]
}

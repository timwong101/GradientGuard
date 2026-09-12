import type { ColorStop } from './types'

export const presets: Array<{ name: string; stops: ColorStop[]; angle: number }> = [
  { name: 'Ember', angle: 118, stops: [
    { id: 'ember-1', color: '#A34D43', position: 0 },
    { id: 'ember-2', color: '#793C56', position: 48 },
    { id: 'ember-3', color: '#392E50', position: 100 },
  ] },
  { name: 'Tide', angle: 115, stops: [
    { id: 'tide-1', color: '#A9E0D0', position: 0 },
    { id: 'tide-2', color: '#3C939B', position: 52 },
    { id: 'tide-3', color: '#224C70', position: 100 },
  ] },
  { name: 'Moss', angle: 105, stops: [
    { id: 'moss-1', color: '#E0E3AF', position: 0 },
    { id: 'moss-2', color: '#8FA77C', position: 45 },
    { id: 'moss-3', color: '#304F43', position: 100 },
  ] },
  { name: 'Iris', angle: 125, stops: [
    { id: 'iris-1', color: '#E7D9EF', position: 0 },
    { id: 'iris-2', color: '#B3A2D0', position: 50 },
    { id: 'iris-3', color: '#6B679D', position: 100 },
  ] },
  { name: 'Dune', angle: 100, stops: [
    { id: 'dune-1', color: '#FAF0D9', position: 0 },
    { id: 'dune-2', color: '#E5CEAC', position: 50 },
    { id: 'dune-3', color: '#C1A38B', position: 100 },
  ] },
  { name: 'Clay', angle: 120, stops: [
    { id: 'clay-1', color: '#F0C3A3', position: 0 },
    { id: 'clay-2', color: '#D58C70', position: 48 },
    { id: 'clay-3', color: '#A6574F', position: 100 },
  ] },
  { name: 'Dusk', angle: 118, stops: [
    { id: 'dusk-1', color: '#F2A87B', position: 0 },
    { id: 'dusk-2', color: '#C85B72', position: 46 },
    { id: 'dusk-3', color: '#613659', position: 100 },
  ] },
  { name: 'Glow', angle: 90, stops: [
    { id: 'glow-1', color: '#3E4666', position: 0 },
    { id: 'glow-2', color: '#EEDBB7', position: 50 },
    { id: 'glow-3', color: '#68485C', position: 100 },
  ] },
]

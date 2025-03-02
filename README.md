# Map Search Algo

A graph search visualizer inspired by this [YouTube video](https://youtu.be/CgW0HPHqFE8?si=u6QbVQzU3J92_lPh). 

## Milestones:
* Clean up map and map-gl to be in the pages directory.
* Move graph to a different folder. Maybe types?
* All map buttons to have <Kbd>. Maybe also put rendered components in useMemo.
* Improve search by using Maps and Sets.
* Replace css class 'leaflet-control'
* Use a reducer for complex state management here with context
* Combine useAStart and useBFS to allow for switching between the two.
* Allow user to change color of specific lines.
* Allow user to change map layout behind.

## Stretch Goals:
* Allow filtering of highway tags in query.
    * Allow filtering of highway tags in drawer.
* Choose between different algos
* Add glow to visualizer
    * Try to render wireframe to see geometry first
* Pass a time variable to shader for glow fade
* Look for additional performance gains on React's side
    * Maps and Sets
*
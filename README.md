# mapped

This project is the implementation of the following technical specification.

## Technical Specification

Implement a light version of Mapcreator tool (https://online.mapcreator.io/): a Vue.js application that allows users to create, edit, and download a map.
The app should contain a map, a UI to make edits to the map, and an ability to save a PNG image of the result.

The following features should be implemented:
- Adding icons to the map
- Adding texts to the map
- Deleting manually placed elements on the map
- Hiding and showing map layers
- Adjusting the map height/width in a given unit

Minimal tech stack:
- Vue.js
- TypeScript (recommended)
- Mapbox GL JS library: https://docs.mapbox.com/mapbox-gl-js/api/

## Implementation details

An attempt was made to style the implementation to match the current application. Therefore, the interface should be familiar to users of the original application.

What was done:
- Interactive toolbar, with a minimum set of map states.
- Menu layout as in the original application, with a stub component in unimplemented parts of the application.
- Completely replicated tab with icon addition.
- Partially replicated tab with text addition.
- Geo-search is not implemented, which is why all parts of the original application that use geo-search are not implemented too.
- Editing of icons and text is implemented in a minimal form (label deletion and text edit only). But the application is designed in such a way as to support all the necessary functionality (editing styles, size, rotation, etc.).
- Hiding and displaying map layers is implemented but without grouping objects between layers and within them.
- Picture export is fully implemented.
- No additional libraries were used (only Vue.js and Mapbox GL JS).
- Visual styles are tested only in Chrome.


## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

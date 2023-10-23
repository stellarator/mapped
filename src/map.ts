import type {
  Map as _Map,
  LngLat,
  LngLatLike,
  SymbolLayout,
  GeoJSONSource,
  MapMouseEvent,
  MapTouchEvent,
  MapboxGeoJSONFeature,
} from 'mapbox-gl';
import type { Feature, FeatureCollection, Point } from 'geojson';

import { ref, onMounted, onUnmounted, shallowRef, watch, type Ref } from 'vue';
import { getEditFrame, getIconImage, getIconMeta, getImageId, type Icon } from './utils.js';
import mapboxgl from 'mapbox-gl';

export type MapItem = Feature<Point>;
export type MapItems = MapItem[];

export interface Dimensions {
  scale: Ref<number>;
  canvasWidth: Ref<number>;
  canvasHeight: Ref<number>;
}
export interface Actions {
  addIcon: (icon: Icon) => Promise<string>;
  getIcon: (id: string) => Icon;
  createItem: (item: MapItem) => void;
  updateItem: (item: MapItem) => void;
  deleteItem: (item: MapItem) => void;
  toggleLayer: (id?: string) => void;
}
export interface Modes {
  dragMode: Ref<boolean>;
  editMode: Ref<boolean>;
}
export interface Map {
  map: _Map | null;
  lng: number;
  lat: number;
  zoom: number;
  pitch: number;
  bearing: number;
}

const EDIT_FRAME_ID = 'edit-frame';

const MAIN_LAYER_ID = 'main-layer';
const DRAG_LAYER_ID = 'drag-layer';

const MAIN_SOURCE_ID = 'mainSource';
const DRAG_SOURCE_ID = 'dragSource';

const queryLayers = { layers: [MAIN_LAYER_ID] };

const defaultLayout: SymbolLayout = {
  'icon-image': ['get', 'icon'],
  'text-field': ['get', 'text'],
  'icon-size': 1 / getScale(),
  'text-size': ['get', 'textSize'],
  'icon-allow-overlap': true,
  'text-allow-overlap': true,
  'icon-ignore-placement': true,
  'text-ignore-placement': true,
};

export function useMap(container: string) {
  const map = shallowRef<_Map | null>(null);

  const lng = ref(5.48);
  const lat = ref(51.44);
  const zoom = ref(12);
  const pitch = ref(0);
  const bearing = ref(0);

  const scale = ref(getScale());
  const canvasWidth = ref(0);
  const canvasHeight = ref(0);

  const dragMode = ref(false);
  const editMode = ref(false);

  const selected = shallowRef<MapItem | undefined>();
  let dragged: MapboxGeoJSONFeature | undefined;

  const mainItems: MapItems = [];
  const dragItems: MapItems = [];

  const mainGeoJSON = { type: 'FeatureCollection', features: mainItems } as FeatureCollection<Point>;
  const dragGeoJSON = { type: 'FeatureCollection', features: dragItems } as FeatureCollection<Point>;

  const iconCache = new Map<string, Icon>([[EDIT_FRAME_ID, { id: EDIT_FRAME_ID, svg: '', name: '', lcName: '' }]]);
  const imageCache = new Set<string>();
  const sourceCache = new Map<MapItems, { id: string; data: FeatureCollection<Point> }>([
    [mainItems, { id: MAIN_SOURCE_ID, data: mainGeoJSON }],
    [dragItems, { id: DRAG_SOURCE_ID, data: dragGeoJSON }],
  ]);

  const propagateItems = (items: MapItems = mainItems) => {
    const { id, data } = sourceCache.get(items)!;
    (map.value?.getSource(id) as GeoJSONSource | null)?.setData(data);
  }

  const createItem = (item: MapItem, items = mainItems) => {
    items.unshift(item);
    propagateItems(items);
  };

  let rafTimeout = 0;
  const rafHandler = () => {
    updateSelection();
    if (rafTimeout) requestAnimationFrame(rafHandler);
  };

  const updateItem = (item: MapItem, items = mainItems) => {
    propagateItems(items);

    if (selected.value?.id === item.id) {
      if (rafTimeout) {
        clearTimeout(rafTimeout);
      } else {
        requestAnimationFrame(rafHandler);
      }
      rafTimeout = setTimeout(() => rafTimeout = 0, 1000) as unknown as number;
    }
  };

  const deleteItem = (item: MapItem, items = mainItems) => {
    const idx = items.findIndex(({ id }) => id === item.id);
    if (~idx) {
      items.splice(idx, 1);
      propagateItems(items);
      if (selected.value?.id === item.id) {
        clearSelection();
      }
    }
  };

  const addIcon = async (icon: Icon): Promise<string> => {
    if (!iconCache.has(icon.id)) {
      iconCache.set(icon.id, icon);
    }

    let { scale: _scale, width, height, id } = getIconMeta(icon, getScale());

    while (!imageCache.has(id)) {
      const image = await getIconImage(icon, width, height, _scale);

      if (_scale === getScale()) {
        map.value?.addImage(id, image);
        imageCache.add(id);
      } else {
        ({ scale: _scale, width, height, id } = getIconMeta(icon, getScale()));
      }
    }

    return id;
  };

  const getIcon = (id: string) => iconCache.get(id);

  const updateIcons = (newScale: number) => {
    let cancelled = false; const cancel = () => cancelled = true;

    (async () => {
      const images = Array.from(imageCache);

      for (const imageId of images) {
        const icon = iconCache.get(imageId.split('#')[0]) as Icon;
        const { id, width, height } = getIconMeta(icon, newScale);

        if (!imageCache.has(id)) {
          const image = await getIconImage(icon, width, height, newScale);
          if (cancelled || newScale !== getScale()) return;
          map.value?.addImage(id, image);
          imageCache.add(id);
        }
      }

      const updateIconId = ({ properties }: Feature<Point>) => {
        if (properties?.icon) {
          const icon = iconCache.get(properties?.icon.split('#')[0]) as Icon;
          const { id } = getIconMeta(icon, newScale);
          properties.icon = id;
        }
      };

      mainItems.forEach(updateIconId);
      propagateItems(mainItems);
      map.value?.setLayoutProperty(MAIN_LAYER_ID, 'icon-size', 1 / newScale);

      dragItems.forEach(updateIconId);
      propagateItems(dragItems);
      map.value?.setLayoutProperty(DRAG_LAYER_ID, 'icon-size', 1 / newScale);
    })();

    return cancel;
  };

  watch(scale, (newScale, _, onCleanup) => onCleanup(updateIcons(newScale)));

  const clearSelection = () => {
    if (dragItems.length) {
      dragItems.shift();
      propagateItems(dragItems);
    }

    selected.value = undefined;
    editMode.value = false;
  }

  const updateSelection = (item?: MapItem) => {
    item ??= mainItems.find(({ id }) => id === selected.value?.id);
    const [width, height] = getLabelDimensions(map.value, item);

    if (item && width > 0 && height > 0) {
      const _scale = getScale();
      const imageId = getImageId({ id: EDIT_FRAME_ID } as Icon, width, height, _scale);
      if (!imageCache.has(imageId)) {
        const image = getEditFrame(width, height, _scale);
        if (image) {
          map.value?.addImage(imageId, image);
          imageCache.add(imageId);
        }
      }
      if (!dragItems.length || dragItems[0].properties?.icon !== imageId) {
        dragItems[0] = {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: item.geometry.coordinates,
          },
          properties: {
            icon: imageId,
            text: '',
          },
          id: item.id
        };

        propagateItems(dragItems);
        selected.value = item;
        editMode.value = true;

        if (rafTimeout) {
          clearTimeout(rafTimeout);
          rafTimeout = 0;
        }
      }
    }
  }

  const removeFromDragLayer = () => {
    if (dragItems.length) {
      propagateItems(mainItems);
      map.value?.setFilter(MAIN_LAYER_ID);

      dragItems.shift();

      requestAnimationFrame(() => {
        propagateItems(dragItems);
      });

      dragMode.value = false;
    }
  };

  const moveToDragLayer = (item?: MapboxGeoJSONFeature) => {
    if (item) {
      const mainItem = mainItems.find(({ id }) => id === item.id);

      if (mainItem) {
        createItem(mainItem, dragItems);
        requestAnimationFrame(() => {
          map.value?.setFilter(MAIN_LAYER_ID, ['!=', ['id'], item.id]);
        })
        dragMode.value = true;
      }
    }
  };

  const toggleLayer = (id?: string) => {
    if (id) {
      const visible = map.value?.getLayoutProperty(id, 'visibility') !== 'none';
      map.value?.setLayoutProperty(id, 'visibility', visible ? 'none' : 'visible');
      if (id === MAIN_LAYER_ID) clearSelection();
    }
  }

  onMounted(() => {
    mapboxgl.accessToken =
      'pk.eyJ1Ijoic3RlbGxhcmF0b3IiLCJhIjoiY2pzdTI5Mmd5MG50cDN6cGd1azJkYTVtbyJ9.Izm5TcPFiAv7rOAfLA3Jag';

    const _map: _Map = new mapboxgl.Map({
      container,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [5.48, 51.44],
      zoom: 12,

      preserveDrawingBuffer: true,

      // fadeDuration: 0,
      // antialias: true,
      // useWebGL2: true,
    });

    const canvasContainer = _map.getCanvasContainer();

    const canvas = _map.getCanvas();
    canvasWidth.value = canvas.width;
    canvasHeight.value = canvas.height;

    function onMove(event: MapMouseEvent | MapTouchEvent) {
      if (dragged) {
        moveToDragLayer(dragged);
        dragged = undefined;
      }

      if (dragMode.value) {
        canvasContainer.style.cursor = 'grabbing';

        const newCoords = event.lngLat;
        const oldCoords = dragItems[0].geometry.coordinates;

        oldCoords[0] = newCoords.lng;
        oldCoords[1] = newCoords.lat;
        propagateItems(dragItems);

        event.preventDefault();
      }
    }

    function onUp(event: MapMouseEvent | MapTouchEvent) {
      if (dragMode.value) {
        canvasContainer.style.cursor = 'move';

        const newCoords = event.lngLat;
        const oldCoords = dragItems[0].geometry.coordinates;

        oldCoords[0] = newCoords.lng;
        oldCoords[1] = newCoords.lat;

        removeFromDragLayer();

        event.preventDefault();
      }
    }

    function onClick(event: MapMouseEvent) {
      if (dragged) {
        if (!dragItems.length || dragItems[0].id !== dragged.id) {
          updateSelection(mainItems.find(({ id }) => id === dragged!.id));
        }
        dragged = undefined;
      } else {
        clearSelection();
      }
    }

    _map
    .on('load', () => { map.value = _map
        .addSource(MAIN_SOURCE_ID, {
          type: 'geojson',
          data: mainGeoJSON,
        })
        .addSource(DRAG_SOURCE_ID, {
          type: 'geojson',
          data: dragGeoJSON,
        })
        .addLayer( {
          id: MAIN_LAYER_ID,
          type: 'symbol',
          source: MAIN_SOURCE_ID,
          layout: {
            ...defaultLayout,
          },
          paint: {
            // 'text-color': ['get', 'textColor'],
            'text-halo-color': 'rgba(192, 192, 192, 0.5)',
            'text-halo-width': 1
          },
        })
        .addLayer( {
          id: DRAG_LAYER_ID,
          type: 'symbol',
          source: DRAG_SOURCE_ID,
          layout: {
            ...defaultLayout,
          },
          paint: {
            'icon-opacity': 0.75,
            'text-opacity': 0.75,
            // 'text-color': ['get', 'textColor'],
            'text-halo-color': 'rgba(192, 192, 192, 0.5)',
            'text-halo-width': 1
          },
        });
    })
    .on('resize', () => {
      scale.value = getScale();
      const canvas = _map.getCanvas();
      canvasWidth.value = canvas.width;
      canvasHeight.value = canvas.height;
    })
    .on('move', () => { ({ lng: lng.value, lat: lat.value } = toPrecision(_map.getCenter())) })
    .on('zoom', () => { zoom.value = toPrecision(_map.getZoom()) })
    .on('pitch', () => { pitch.value = toPrecision(_map.getPitch()) })
    .on('rotate', () => { bearing.value = toPrecision(_map.getBearing()) })
    .on('mouseenter', MAIN_LAYER_ID, () => {
      canvasContainer.style.cursor = 'move';
    })
    .on('mouseleave', MAIN_LAYER_ID, () => {
      canvasContainer.style.cursor = '';
    })
    .on('mousedown', (event) => {
      dragged = _map.queryRenderedFeatures(event.point, queryLayers)?.[0];
      if (dragged) event.preventDefault();
    })
    .on('touchstart', (event) => {
      if (event.points.length !== 1) return;
      dragged = _map.queryRenderedFeatures(event.point, queryLayers)?.[0];
      if (dragged) event.preventDefault();
    })
    .on('mousemove', onMove)
    .on('touchmove', onMove)
    .on('mouseup', onUp)
    .on('touchend', onUp)
    .on('click', onClick);
  });

  onUnmounted(() => {
    map.value?.remove();
    map.value = null;
  });

  return {
    map, lng, lat, zoom, pitch, bearing, selected,
    modes: { dragMode, editMode },
    actions: { addIcon, getIcon, createItem, updateItem, deleteItem, toggleLayer },
    dimensions: { scale, canvasWidth, canvasHeight },
  };
}

// We do not show values with more than 2 decimal places
// So, let's help the framework and not update props for every sneeze
function toPrecision<T extends (number | LngLat)>(num: T, p = 1): T {
  return typeof num === 'number'
    ? parseFloat(num.toFixed(p)) as T
    : { lng: toPrecision(num.lng, 2), lat: toPrecision(num.lat, 2) } as T;
}

function getLabelDimensions(map: _Map | null, item?: MapItem) {
  if (!map || !item) return [0, 0];

  if (item.properties?.icon) {
    const size = item.properties.icon.split('#')[1].split('@')[0].split('/').map(Number);

    size[0] += 4;
    size[1] += 4;

    return size;

  }

  const size = [0, 0];
  let step = 20;
  let dir = 0;

  const point = map.project(item.geometry.coordinates as LngLatLike);
  const id = item.id;

  const canvas = map.getCanvas();

  if (point.x > canvas.clientWidth / 2) dir = 1;
  if (point.y > canvas.clientHeight / 2) dir |= 2;

  while (step > 0) {
    let repeatX = true;
    let repeatY = true;

    do {
      if (repeatX) {
        repeatX = false;
        const features = map.queryRenderedFeatures(
          [ point.x + (size[0] + step) * (dir & 1 ? -1 : 1), point.y],
          queryLayers,
        );
        if (features.length && ~features.findIndex(feature => feature.id === id)) {
          size[0] += step;
          repeatX = true;
        }
      }
      if (repeatY) {
        repeatY = false;
        const features = map.queryRenderedFeatures(
          [ point.x, point.y + (size[1] + step) * (dir & 2 ? -1 : 1)],
          queryLayers,
        );
        if (features.length && ~features.findIndex(feature => feature.id === id)) {
          size[1] += step;
          repeatY = true;
        }
      }
    } while (repeatX || repeatY);

    step = Math.floor(step / 2);
  }

  size[0] *= 2;
  size[1] *= 2;

  return size;
}

function getScale() { return window?.devicePixelRatio || 1 }

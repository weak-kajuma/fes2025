"use client"

import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

interface AreaProps {
  onAreaClick: (properties: any) => void
  geojsonUrls: string[]
  onPolygonsUpdate?: (names: string[]) => void
}

const Map = forwardRef<any, AreaProps>(({ onAreaClick, geojsonUrls, onPolygonsUpdate }, ref) => {
  const [polygonFeatures, setPolygonFeatures] = useState<any[]>([])
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)

  // fitPolygonByName: 指定nameのポリゴンにfitBounds（全レイヤーから検索）
  useImperativeHandle(ref, () => ({
    fitPolygonByName: (name: string) => {
      if (!mapRef.current) return
      const feature = polygonFeatures.find(f => f.properties?.name === name)
      if (feature && feature.geometry?.coordinates) {
        const coords = feature.geometry.coordinates[0]
        let minLon = coords[0][0], minLat = coords[0][1], maxLon = coords[0][0], maxLat = coords[0][1]
        coords.forEach((c: number[]) => {
          if (c[0] < minLon) minLon = c[0]
          if (c[0] > maxLon) maxLon = c[0]
          if (c[1] < minLat) minLat = c[1]
          if (c[1] > maxLat) maxLat = c[1]
        })
        const bounds: [[number, number], [number, number]] = [[minLon, minLat], [maxLon, maxLat]]
        mapRef.current.fitBounds(bounds, { padding: 40, duration: 800 })
      }
    }
  }), [polygonFeatures])

  useEffect(() => {
    if (!mapContainerRef.current) return

    // Mapbox アクセストークンの確認
    const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
    if (!accessToken) {
      console.error('Mapbox access token is not set. Please add NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN to your .env.local file')
      return
    }

    // Mapbox アクセストークンを設定
    mapboxgl.accessToken = accessToken

    // 画面幅でズームレベルを決定
    let zoom = 18.9
    let minZoom = 19
    let maxZoom = 20
    let bearing = 0
    if (typeof window !== 'undefined') {
      const width = window.innerWidth
      if (width < 600) {
        // スマホ
        zoom = 17.1
        minZoom = 10.2
        maxZoom = 19.2
        bearing = 0
      } else if (width < 1024) {
        // タブレット
        zoom = 18.7
        minZoom = 18.5
        maxZoom = 19.5
        bearing = 0
      } else {
        // PC
        zoom = 18.9
        minZoom = 19
        maxZoom = 20
        bearing = 0
      }
    }

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [135.6279744, 34.84795],
      zoom,
      minZoom,
      maxZoom,
      bounds: [
        [135.62619067552447, 34.847069126545776],
        [135.62994407787954, 34.848561498532504],
      ],
      dragRotate: false,
      pitchWithRotate: false,
      bearing,
      pitch: 0,
    })

    mapRef.current = map

    // スマホ時は初期化後にもズームレベルを強制再設定
    if (typeof window !== 'undefined' && window.innerWidth < 600) {
      map.once('load', () => {
        map.setZoom(zoom)
        map.setMinZoom(minZoom)
        map.setMaxZoom(maxZoom)
      })
    }

    map.on('load', async () => {
      let allFeatures: any[] = []
      let allNames: string[] = []

      for (const url of geojsonUrls) {
        const fileName = url.split('/').pop()?.replace('.geojson', '') || Math.random().toString()
        const sourceId = `src_${fileName}`
        const layerId = `layer_${fileName}`

        // fetch geojson
        const res = await fetch(url)
        const geojson = await res.json()

        map.addSource(sourceId, {
          type: 'geojson',
          data: geojson,
        })

        map.addLayer({
          id: layerId,
          type: 'fill',
          source: sourceId,
          paint: {
            'fill-color': ['get', 'fill'],
            'fill-opacity': ['get', 'fill-opacity'],
          },
          filter: ['all', ['==', '$type', 'Polygon']],
        })

        // アウトライン用のlineレイヤーも追加
        map.addLayer({
          id: layerId + '_line',
          type: 'line',
          source: sourceId,
          paint: {
            'line-color': ['get', 'stroke'],
            'line-width': ['get', 'stroke-width'],
            'line-opacity': ['get', 'stroke-opacity'],
          },
          filter: ['all', ['==', '$type', 'Polygon']],
        })

        // contentポリゴン名を収集
        const features = (geojson.features || []).filter((f: any) => f.geometry?.type === 'Polygon' && f.properties?.style === 'content')
        allFeatures = allFeatures.concat(features)
        allNames = allNames.concat(features.map((f: any) => f.properties.name).filter(Boolean))

        // クリックイベント
        map.on('click', layerId, e => {
          const feature = e.features?.[0]
          if (feature && feature.properties?.style === 'content') {
            onAreaClick(feature.properties)
          }
        })

        // ポインタ変更
        map.on('mouseenter', layerId, e => {
          const feature = e.features?.[0]
          if (feature && feature.properties?.style === 'content') {
            map.getCanvas().style.cursor = 'pointer'
          } else {
            map.getCanvas().style.cursor = ''
          }
        })

        map.on('mouseleave', layerId, () => {
          map.getCanvas().style.cursor = ''
        })
      }

      setPolygonFeatures(allFeatures)
      if (onPolygonsUpdate) onPolygonsUpdate(allNames)
    })

    return () => {
      map.remove()
    }
  }, [geojsonUrls])

  return <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
})

Map.displayName = 'Map'

export default Map
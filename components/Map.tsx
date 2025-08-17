"use client"

import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

interface AreaProps {
  onAreaClick: (properties: any) => void
  geojsonUrls: string[]
  onPolygonsUpdate?: (names: string[]) => void
  onMapInteraction?: () => void // 追加
}

const Map = forwardRef<any, AreaProps>(({ onAreaClick, geojsonUrls, onPolygonsUpdate, onMapInteraction }, ref) => {
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

    // 固定値でシンプル化
    const zoom = 18.9
    const minZoom = 18
    const maxZoom = 20
    const bearing = 0

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [135.628067, 34.848015], // boundsの中心点
      zoom,
      minZoom,
      maxZoom,
      dragRotate: false,
      pitchWithRotate: false,
      bearing,
      pitch: 0,
    })
    mapRef.current = map

    // 安定したサイズ反映のためのリサイズ処理
    const handleResize = () => {
      if (mapRef.current) {
        mapRef.current.resize()
      }
    }
    // 初期レイアウト確定後に一度リサイズ
    requestAnimationFrame(handleResize)
    setTimeout(handleResize, 0)
    setTimeout(handleResize, 300)
    window.addEventListener('resize', handleResize)

    // コンテナの ResizeObserver で高さが 0→有効 になったときに追従
    let ro: ResizeObserver | null = null
    const Rz = (window as any).ResizeObserver
    if (typeof Rz === 'function') {
      ro = new Rz(() => handleResize())
    }
    if (ro && mapContainerRef.current) {
      ro.observe(mapContainerRef.current)
    }

    // マップ操作時にポップアップ消す通知
    if (onMapInteraction) {
      ['move', 'zoom', 'pitch', 'rotate'].forEach(ev => {
        map.on(ev, () => {
          onMapInteraction()
        })
      })
    }

    map.on('load', async () => {
      handleResize()
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
            // ポリゴン中心座標（地理座標）を計算
            let center = { x: 0, y: 0 }
            if (feature.geometry?.type === 'Polygon') {
              const coords = feature.geometry.coordinates[0]
              let sumLon = 0, sumLat = 0
              coords.forEach((c: number[]) => {
                sumLon += c[0]
                sumLat += c[1]
              })
              const len = coords.length
              const lon = sumLon / len
              const lat = sumLat / len
              // 地理座標→画面座標
              if (mapRef.current) {
                const point = mapRef.current.project([lon, lat])
                center = { x: point.x, y: point.y }
              }
            }
            onAreaClick({ ...feature.properties, center })
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
      if (ro && mapContainerRef.current) ro.unobserve(mapContainerRef.current)
      window.removeEventListener('resize', handleResize)
      map.remove()
    }
  }, [geojsonUrls, onMapInteraction])

  return <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
})

Map.displayName = 'Map'

export default Map
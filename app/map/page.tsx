"use client"

import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import styles from './page.module.css';

export default function MapPage() {

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [zoom, setZoom] = useState(17);
  const [center, setCenter] = useState<[number, number]>([135.6280, 34.8480]);
  const [floor, setFloor] = useState<'1F' | '2F' | '3F' | '4F'>('1F');

  useEffect(() => {
    if (!mapContainerRef.current) return;
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN!;
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {},
        layers: [
          {
            id: 'background',
            type: 'background',
            paint: { 'background-color': '#fff' }
          }
        ] // 背景を白に設定
      },
      center: center,
      zoom: zoom,
      minZoom: 14, // さらに縮小可能に
      maxZoom: 20,
      maxBounds: [
        [135.6230, 34.8440], // 南西（左下）
        [135.6330, 34.8520]  // 北東（右上）
      ], // 画面内に一部でもあればOKな広めの移動制限
      interactive: true,
      attributionControl: false,
      logoPosition: 'bottom-right',
      preserveDrawingBuffer: true,
    });
    mapRef.current = map;

    const handleMove = () => {
      if (!mapRef.current) return;
      setZoom(mapRef.current.getZoom());
      const c = mapRef.current.getCenter();
      setCenter([c.lng, c.lat]);
    };

    // map.on('load', () => {
    //   map.addSource('floor-image', {
    //     type: 'image',
    //     url: '/data/map/1F.png',
    //     coordinates: [
    //       [135.6265, 34.8470], // 左下
    //       [135.6295, 34.8470], // 右下
    //       [135.6295, 34.8490], // 右上
    //       [135.6265, 34.8490], // 左上
    //     ],
    //   });
    //   map.addLayer({
    //     id: 'floor-image-layer',
    //     type: 'raster',
    //     source: 'floor-image',
    //     paint: { 'raster-opacity': 1 },
    //   });
    // });

    map.on('move', handleMove);
    map.on('zoom', handleMove);
    // 初期値反映
    handleMove();

    // リサイズ対応
    const handleResize = () => {
      if (!mapRef.current) return;
      if ((mapRef.current as any)._removed) return;
      mapRef.current.resize();
    };
    window.addEventListener('resize', handleResize);
    requestAnimationFrame(handleResize);
    setTimeout(handleResize, 0);
    setTimeout(handleResize, 300);

    return () => {
      window.removeEventListener('resize', handleResize);
      map.off('move', handleMove);
      map.off('zoom', handleMove);
      map.remove();
    };
  }, []);

  // ...existing code...

  // SVGの地理座標範囲（画像の四隅）
  const svgBounds = {
    left: 135.6265,
    right: 135.6295,
    top: 34.8490,
    bottom: 34.8470,
    width: 800,
    height: 600,
  };

  // mapboxのズーム・中心座標からSVGのtransformを計算
  // 1ズーム=1倍、中心座標がSVG中央ならtranslate=0
  // 緯度経度→SVG座標系への変換
  const lngPerPx = (svgBounds.right - svgBounds.left) / svgBounds.width;
  const latPerPx = (svgBounds.top - svgBounds.bottom) / svgBounds.height;
  const svgCenter = [svgBounds.left + (svgBounds.right - svgBounds.left) / 2, svgBounds.bottom + (svgBounds.top - svgBounds.bottom) / 2];
  const offsetX = (center[0] - svgCenter[0]) / lngPerPx;
  const offsetY = (center[1] - svgCenter[1]) / latPerPx;
  return (
    <div className={styles.mapContainer}>
      {/* フロア選択ボタン 左上配置 */}
      <div style={{ position: 'fixed', top: 16, left: 16, zIndex: 10, display: 'flex', gap: '0.5rem' }}>
        {['1F', '2F', '3F', '4F'].map(f => (
          <button
            key={f}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '1rem',
              border: floor === f ? '2px solid #007aff' : '1px solid #ccc',
              background: floor === f ? '#e6f0ff' : '#fff',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              color: 'black'
            }}
            onClick={() => setFloor(f as '1F' | '2F' | '3F' | '4F')}
          >
            {f}
          </button>
        ))}
      </div>
      <div ref={mapContainerRef} style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 1 }} />
      <svg
        width={svgBounds.width}
        height={svgBounds.height}
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: `translate(-50%, -50%) scale(${Math.pow(2, zoom - 17)}) translate(${-offsetX}px, ${offsetY}px)`,
          pointerEvents: 'none',
          zIndex: 2,
        }}
      >
        <image href={`/data/map/${floor}.svg`} x="0" y="0" width={svgBounds.width} height={svgBounds.height} />
      </svg>
    </div>
  );
}
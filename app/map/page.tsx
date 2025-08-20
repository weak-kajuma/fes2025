"use client"

import React, { useState, useRef, useEffect, useCallback } from 'react'
import styles from './page.module.css'
import LiquidGlass from '@/components/LiquidGlass/LiquidGlass'
import Map from '@/components/Map'
import { gsap } from 'gsap'

export default function MapPage() {
  // 初期ローディング制御
  const [isReady, setIsReady] = useState(false);
  const [selectedFloor, setSelectedFloor] = useState<number>(1)
  const [selectedArea, setSelectedArea] = useState<any>(null)
  const [polygonNames, setPolygonNames] = useState<string[]>([])
  const [geojsonUrls, setGeojsonUrls] = useState<string[]>([])
  const [isPolygonMenuOpen, setIsPolygonMenuOpen] = useState(false)

  // setSelectedArea を useCallback でメモ化
  const handleAreaClick = useCallback((properties: any) => {
    setSelectedArea(properties)
  }, [])
  const mapRef = useRef<any>(null)
  const polygonMenuRef = useRef<HTMLDivElement>(null)
  const polygonContentRef = useRef<HTMLDivElement>(null)
  const popupRef = useRef<HTMLDivElement>(null)
  const popupInfoRef = useRef<HTMLDivElement>(null)

  // ポップアップ位置
  const [popupPosition, setPopupPosition] = useState<{ x: number, y: number }>({ x: 0, y: 0 })

  useEffect(() => {
    if (selectedArea && popupRef.current && popupInfoRef.current) {
      // ポリゴンの中心座標を計算してセット
      if (selectedArea.center) {
        setPopupPosition({
          x: selectedArea.center.x,
          y: selectedArea.center.y,
        });
      }

      const tl = gsap.timeline();

      tl.fromTo(
        popupRef.current,
        { width: 0, height: 0, opacity: 0 },
        { width: '10rem', height: '10rem', opacity: 1, duration: 0.5, ease: 'power2.out' }
      )
      .fromTo(
        popupInfoRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: 'power2.out' },
      );
    }
  }, [selectedArea]);

  // 階層変更時にもポップアップを消す
  useEffect(() => {
    setSelectedArea(null)
  }, [selectedFloor])

  // フロアごとのディレクトリ
  const dir = selectedFloor === 1 ? '/data/map/1F/' : selectedFloor === 2 ? '/data/map/2F/' : selectedFloor === 3 ? '/data/map/3F/' : '/data/map/4F/'

  // ディレクトリ内の.geojsonファイルを昇順で取得
  useEffect(() => {
    // requestIdleCallbackで遅延実行
    const fetchFiles = async () => {
      window.requestIdleCallback(() => {
        let files: string[] = []
        if (selectedFloor === 1) {
          files = [
            '1_background_1F.geojson',
            '2_entrance_1F.geojson',
            '3_rooms_1F.geojson',
            '4_wc_1F.geojson',
            '5_room_1F.geojson',
            '6_stairs_1F.geojson',
            '7_points_1F.geojson',
          ]
        } else if (selectedFloor === 2) {
          files = [
            '1_background_2F.geojson',
            '2_entrance_2F.geojson',
            '3_rooms_2F.geojson',
            '4_wc_2F.geojson',
            '5_room_2F.geojson',
            '6_stairs_2F.geojson',
            '7_points_2F.geojson',
          ]
        } else if (selectedFloor === 3) {
          files = [
            '1_background_3F.geojson',
            '3_rooms_3F.geojson',
            '4_wc_3F.geojson',
            '5_room_3F.geojson',
            '6_stairs_3F.geojson',
            '7_points_3F.geojson',
          ]
        } else if (selectedFloor === 4) {
          files = [
            '1_background_4F.geojson',
            '3_rooms_4F.geojson',
            '4_wc_4F.geojson',
            '5_room_4F.geojson',
            '6_stairs_4F.geojson',
            '7_points_4F.geojson',
          ]
        }
        // 先頭数字で昇順ソート
        files.sort((a, b) => parseInt(a.match(/^\d+/)?.[0] ?? '0', 10) - parseInt(b.match(/^\d+/)?.[0] ?? '0', 10))
        setGeojsonUrls(files.map(f => dir + f))
        setIsReady(true)
      })
    }
    fetchFiles()
  }, [selectedFloor])

  // ポリゴン名リストをMapから受け取るコールバック
  const handlePolygonsUpdate = useCallback((names: string[]) => {
    setPolygonNames(names)
  }, [])

  // ポリゴン名ボタンのクリックでfitPolygonByNameを呼ぶ
  const handlePolygonButtonClick = useCallback((name: string) => {
    if (mapRef.current && mapRef.current.fitPolygonByName) {
      mapRef.current.fitPolygonByName(name)
    }
  }, [])

  // ポリゴンメニューの開閉
  const handlePolygonMenuClick = () => {
    setIsPolygonMenuOpen(!isPolygonMenuOpen);
    if (polygonMenuRef.current && polygonContentRef.current) {
      if (!isPolygonMenuOpen) {
        // 開くアニメーション（レスポンシブ対応）
        const isMobile = window.innerWidth < 768;
        const targetWidth = isMobile ? "80vw" : "30vw";
        const targetHeight = isMobile ? "70dvh" : "50dvh";

        gsap.to(polygonMenuRef.current, {
          borderRadius: "30px",
          width: targetWidth,
          height: targetHeight,
          duration: 0.5,
          ease: "power2.out"
        });

        // コンテンツを表示
        gsap.to(polygonContentRef.current, {
          opacity: 1,
          pointerEvents: "auto",
          duration: 0.5,
          ease: "power2.out",
          delay: 0.2
        });
      } else {
        // 閉じるアニメーション
        gsap.to(polygonMenuRef.current, {
          borderRadius: "50px",
          width: "60px",
          height: "60px",
          duration: 0.5,
          ease: "power2.out"
        });

        // コンテンツを非表示
        gsap.to(polygonContentRef.current, {
          opacity: 0,
          pointerEvents: "none",
          duration: 0.3,
          ease: "power2.out"
        });
      }
    }
  };

  // マップ操作時にポップアップを消す
  const handleMapInteraction = useCallback(() => {
    setSelectedArea(null)
  }, [])

  return (
    <div className={styles.container}>
      {/* 初期ローディングを遅延表示 */}
      {!isReady && <div className={styles.loading}>Loading...</div>}

      <div className={styles.floorButtons}>
        <LiquidGlass>
          <div className={styles.floorButtonsContent}>
            {[1, 2, 3, 4].map(floor => (
              <div className={styles.floorButtonContainer} key={floor}>
                <LiquidGlass>
                  <button
                    onClick={() => setSelectedFloor(floor)}
                    className={`${styles.floorButton} ${selectedFloor === floor ? styles.active : ''}`}
                  >
                    {floor}
                  </button>
                </LiquidGlass>
              </div>
            ))}
          </div>
        </LiquidGlass>
      </div>

      {/* ポリゴンメニュー */}
      <div className={styles.polygonMenuWrapper}>
        <div ref={polygonMenuRef} className={styles.polygonMenuIcon}>
          <LiquidGlass>
            <svg
              className={`${styles.ham} ${styles.hamRotate} ${styles.ham1} ${isPolygonMenuOpen ? styles.active : ''}`}
              viewBox="0 0 100 100"
              width="50"
              onClick={handlePolygonMenuClick}
            >
              <path
                className={`${styles.line} ${styles.top}`}
                d="m 30,33 h 40 c 0,0 9.044436,-0.654587 9.044436,-8.508902 0,-7.854315 -8.024349,-11.958003 -14.89975,-10.85914 -6.875401,1.098863 -13.637059,4.171617 -13.637059,16.368042 v 40"
              />
              <path
                className={`${styles.line} ${styles.middle}`}
                d="m 30,50 h 40"
              />
              <path
                className={`${styles.line} ${styles.bottom}`}
                d="m 30,67 h 40 c 12.796276,0 15.357889,-11.717785 15.357889,-26.851538 0,-15.133752 -4.786586,-27.274118 -16.667516,-27.274118 -11.88093,0 -18.499247,6.994427 -18.435284,17.125656 l 0.252538,40"
              />
            </svg>

            <div
              ref={polygonContentRef}
              className={styles.polygonMenuContent}
            >
              {polygonNames.map(name => (
                <div
                  key={name}
                  className={styles.polygonMenuItem}
                  onClick={() => handlePolygonButtonClick(name)}
                >
                  <LiquidGlass>
                    <button className={styles.polygonMenuButton}>
                      {name}
                    </button>
                  </LiquidGlass>
                </div>
              ))}
            </div>
          </LiquidGlass>
        </div>
      </div>

      <div className={styles.mapContainer}>
        <Map
          ref={mapRef}
          onAreaClick={handleAreaClick}
          geojsonUrls={geojsonUrls}
          onPolygonsUpdate={handlePolygonsUpdate}
          onMapInteraction={handleMapInteraction}
        />
      </div>
      {selectedArea && (
        <div
          className={styles.selectedAreaInfo}
          ref={popupRef}
          style={{
            position: 'absolute',
            top: popupPosition.y, // ポリゴン中心座標に合わせて計算
            left: popupPosition.x,
            transform: 'translate(-50%, -100%)',
            zIndex: 1000,
            pointerEvents: 'auto',
          }}
        >
          <div className={styles.info} ref={popupInfoRef}>
            {/* ポリゴン情報を表示 */}
            <h3>{selectedArea.name}</h3>
            <p>{selectedArea.description}</p>
            {/* 他の情報も必要に応じて */}
          </div>
        </div>
      )}
    </div>
  )
}
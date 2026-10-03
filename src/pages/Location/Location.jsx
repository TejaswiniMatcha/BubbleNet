import { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Copy, Battery, Zap, Eye, EyeOff, Navigation2 } from 'lucide-react';
import clsx from 'clsx';
import styles from './Location.module.css';
import Switch from '../../components/Switch/Switch.jsx';
import Chip from '../../components/Chip/Chip.jsx';
import Avatar from '../../components/Avatar/Avatar.jsx';
import { useBubble, useSosState } from '../../store/bubbleStore.js';
import { useUiActions } from '../../store/uiStore.js';
import { getDistance, getBearing } from '../../utils/haversine.js';

// Base coordinates (e.g. Festival center)
const BASE_LAT = 40.7128;
const BASE_LON = -74.0060;

// Generates coordinates given distance (m) and bearing (deg) from base
function generateCoords(distance, bearing) {
  const R = 6371e3;
  const d = distance / R;
  const b = bearing * Math.PI / 180;
  const lat1 = BASE_LAT * Math.PI / 180;
  const lon1 = BASE_LON * Math.PI / 180;

  const lat2 = Math.asin(Math.sin(lat1) * Math.cos(d) + Math.cos(lat1) * Math.sin(d) * Math.cos(b));
  const lon2 = lon1 + Math.atan2(Math.sin(b) * Math.sin(d) * Math.cos(lat1), Math.cos(d) - Math.sin(lat1) * Math.sin(lat2));

  return { lat: lat2 * 180 / Math.PI, lon: lon2 * 180 / Math.PI };
}

const INITIAL_MEMBERS = [
  { id: 'Aarav', lat: 0, lon: 0, battery: 45, hops: 1, lastUpdate: Date.now() },
  { id: 'Meera', lat: 0, lon: 0, battery: 85, hops: 2, lastUpdate: Date.now() },
  { id: 'Rohan', lat: 0, lon: 0, battery: 12, hops: 3, lastUpdate: Date.now() - 150000 }, // Stale
  { id: 'Sana', lat: 0, lon: 0, battery: 92, hops: 1, lastUpdate: Date.now() },
];

// Initialize with some offsets
INITIAL_MEMBERS.forEach((m, i) => {
  const dist = 30 + i * 40; // 30m, 70m, 110m, 150m
  const bear = i * 90 + 45;
  const coords = generateCoords(dist, bear);
  m.lat = coords.lat;
  m.lon = coords.lon;
});

const ZOOM_LEVELS = [
  { label: '50m', value: 50 },
  { label: '200m', value: 200 },
  { label: '1km', value: 1000 },
  { label: '5km', value: 5000 },
];

export default function Location() {
  const bubble = useBubble();
  const { addToast } = useUiActions();
  
  const [sharing, setSharing] = useState(true);
  const [showCoords, setShowCoords] = useState(false);
  const [zoom, setZoom] = useState(200); // map radius in meters
  const [rotation, setRotation] = useState(0);
  const [navTarget, setNavTarget] = useState(null);
  const [members, setMembers] = useState(INITIAL_MEMBERS);
  const [now, setNow] = useState(() => Date.now());
  const { alerts } = useSosState();
  
  const radarRef = useRef(null);

  // Simulate gentle walking
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
      setMembers(prev => prev.map(m => {
        // Rohan is stale, doesn't move
        if (m.id === 'Rohan') return m;
        // Random walk
        const walkDist = Math.random() * 2; // up to 2m
        const walkBear = Math.random() * 360;
        const newCoords = generateCoords(walkDist, walkBear);
        // Add delta to base
        return {
          ...m,
          lat: m.lat + (newCoords.lat - BASE_LAT),
          lon: m.lon + (newCoords.lon - BASE_LON),
          lastUpdate: Date.now()
        };
      }));
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const copyCoords = (lat, lon) => {
    navigator.clipboard.writeText(`${lat.toFixed(6)}, ${lon.toFixed(6)}`);
    addToast({ message: 'Coordinates copied to clipboard', type: 'info' });
  };

  const startDrag = (e) => {
    if (navTarget) return; // disable rotation when navigating
    e.preventDefault();
    const svg = radarRef.current;
    if (!svg) return;
    
    const rect = svg.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    const getAngle = (clientX, clientY) => {
      return Math.atan2(clientY - cy, clientX - cx) * 180 / Math.PI;
    };

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const startAngle = getAngle(clientX, clientY) - rotation;

    const onMove = (moveEvent) => {
      const mx = moveEvent.touches ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const my = moveEvent.touches ? moveEvent.touches[0].clientY : moveEvent.clientY;
      setRotation(getAngle(mx, my) - startAngle);
    };

    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onUp);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    document.addEventListener('touchmove', onMove);
    document.addEventListener('touchend', onUp);
  };

  if (!bubble) return null;

  // Radar drawing calculations
  const radarRadius = 300; // SVG internal radius
  const viewBox = `-300 -300 600 600`;

  const mapToXY = (lat, lon) => {
    const d = getDistance(BASE_LAT, BASE_LON, lat, lon);
    const b = getBearing(BASE_LAT, BASE_LON, lat, lon);
    // Scale distance to radarRadius based on zoom
    const r = (d / zoom) * radarRadius;
    // bearing 0 is North (up), so subtract 90 degrees for SVG math
    const rad = (b - 90) * Math.PI / 180;
    return { x: r * Math.cos(rad), y: r * Math.sin(rad) };
  };

  const ringDists = [0.25, 0.5, 0.75, 1].map(f => zoom * f);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Location Radar</h1>
          <div className={styles.sub}>Offline mesh positioning</div>
        </div>
        {sharing && <Chip variant="success" size="sm"><MapPin size={12}/> Sharing location</Chip>}
      </div>

      <div className={styles.content}>
        {/* Radar */}
        <div className={styles.radarWrap}>
          {navTarget ? (
            <div className={styles.navArrow} style={{ transform: `rotate(${getBearing(BASE_LAT, BASE_LON, navTarget.lat, navTarget.lon)}deg)` }}>
              <Navigation2 size={80} color="var(--mode-accent)" fill="var(--mode-accent)" strokeWidth={1} />
              <div style={{marginTop: 16, fontWeight: 800, fontSize: '1.5rem', color: 'var(--text-primary)', transform: `rotate(-${getBearing(BASE_LAT, BASE_LON, navTarget.lat, navTarget.lon)}deg)`}}>
                {Math.round(getDistance(BASE_LAT, BASE_LON, navTarget.lat, navTarget.lon))} m
              </div>
            </div>
          ) : (
            <svg 
              ref={radarRef}
              className={styles.radarSvg} 
              viewBox={viewBox} 
              onMouseDown={startDrag}
              onTouchStart={startDrag}
              style={{ cursor: 'grab' }}
            >
              <g transform={`rotate(${rotation})`}>
                {/* Rings */}
                {ringDists.map((d, i) => (
                  <g key={i}>
                    <circle cx={0} cy={0} r={(d/zoom)*radarRadius} fill="none" stroke="#CBD5E1" strokeWidth="1" strokeDasharray="4 4" />
                    {i === ringDists.length - 1 && (
                      <text x={0} y={-(d/zoom)*radarRadius + 14} textAnchor="middle" fill="#94A3B8" fontSize="12" fontWeight="600">{d >= 1000 ? d/1000+'km' : d+'m'}</text>
                    )}
                  </g>
                ))}
                
                {/* Crosshairs */}
                <line x1={-radarRadius} y1={0} x2={radarRadius} y2={0} stroke="#CBD5E1" strokeWidth="1" />
                <line x1={0} y1={-radarRadius} x2={0} y2={radarRadius} stroke="#CBD5E1" strokeWidth="1" />
                
                {/* North indicator */}
                <path d="M-8 -290 L8 -290 L0 -300 Z" fill="#EF4444" />

                {/* You */}
                {sharing && (
                  <circle cx={0} cy={0} r={6} fill="var(--mode-accent)" stroke="#FFF" strokeWidth="2" />
                )}

                {/* Members */}
                {members.map(m => {
                  const { x, y } = mapToXY(m.lat, m.lon);
                  const isStale = now - m.lastUpdate > 120000;
                  // Don't render if too far outside zoom
                  if (Math.sqrt(x*x + y*y) > radarRadius + 20) return null;
                  return (
                    <g key={m.id} transform={`translate(${x}, ${y})`} className={clsx(styles.marker, isStale && styles.stale)}>
                      <circle cx={0} cy={0} r={14} fill="#FFF" stroke="var(--mode-accent)" strokeWidth="2" />
                      <text x={0} y={4} textAnchor="middle" fill="var(--mode-accent)" fontSize="10" fontWeight="700" transform={`rotate(${-rotation})`}>{m.id.charAt(0)}</text>
                    </g>
                  );
                })}

                {/* SOS Alerts */}
                {alerts && alerts.map((a, i) => {
                  // Fake SOS coordinates
                  const fakeDist = 80 + i * 20;
                  const fakeBear = 45 + i * 90;
                  const c = generateCoords(fakeDist, fakeBear);
                  const { x, y } = mapToXY(c.lat, c.lon);
                  if (Math.sqrt(x*x + y*y) > radarRadius + 20) return null;
                  return (
                    <g key={a.id} transform={`translate(${x}, ${y})`} className={styles.marker}>
                      <circle cx={0} cy={0} r={18} fill="#E11D48" stroke="#FFF" strokeWidth="2" className="animate-pulse" />
                      <text x={0} y={4} textAnchor="middle" fill="#FFF" fontSize="12" fontWeight="700" transform={`rotate(${-rotation})`}>!</text>
                    </g>
                  );
                })}
              </g>
            </svg>
          )}

          {!navTarget && (
            <div className={styles.radarControls}>
              {ZOOM_LEVELS.map(z => (
                <button key={z.value} className={clsx(styles.zoomChip, zoom === z.value && styles.active)} onClick={() => setZoom(z.value)}>
                  {z.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className={styles.sidebar}>
          <div className={styles.selfCard}>
            <div className={styles.shareToggle}>
              <div className={styles.shareLabel}>
                <MapPin size={18} color="var(--mode-accent)" /> My Location
              </div>
              <Switch checked={sharing} onChange={setSharing} />
            </div>
            
            <div>
              <div style={{display:'flex', justifyContent:'space-between', marginBottom: 4}}>
                <span style={{fontSize:'0.75rem', fontWeight:600}}>Coordinates</span>
                <button onClick={() => setShowCoords(!showCoords)} style={{background:'none',border:'none',color:'var(--text-muted)',cursor:'pointer'}}>
                  {showCoords ? <EyeOff size={14}/> : <Eye size={14}/>}
                </button>
              </div>
              {showCoords && (
                <div className={styles.coords}>
                  {BASE_LAT.toFixed(6)}, {BASE_LON.toFixed(6)}
                  <button onClick={() => copyCoords(BASE_LAT, BASE_LON)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--text-secondary)'}}><Copy size={14}/></button>
                </div>
              )}
            </div>
          </div>

          <div className={styles.membersList}>
            <div style={{fontSize:'0.75rem', fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase'}}>Nearby Members ({members.length})</div>
            {members.map(m => {
              const dist = getDistance(BASE_LAT, BASE_LON, m.lat, m.lon);
              const bear = getBearing(BASE_LAT, BASE_LON, m.lat, m.lon);
              const isStale = now - m.lastUpdate > 120000;
              const isNav = navTarget?.id === m.id;

              return (
                <div key={m.id} className={styles.memberCard} style={{opacity: isStale ? 0.6 : 1}}>
                  <div className={styles.memberHeader}>
                    <div className={styles.memberInfo}>
                      <Avatar name={m.id} size="sm" showOnlineDot={!isStale} online={true} />
                      <div>
                        <div style={{fontWeight: 700, color:'var(--text-primary)', fontSize:'0.9375rem'}}>{m.id}</div>
                        <div style={{fontSize:'0.75rem', color:'var(--text-secondary)'}}>{isStale ? 'Last seen 2m ago' : 'Live'}</div>
                      </div>
                    </div>
                    <button className={clsx(styles.navBtn, isNav && styles.active)} onClick={() => setNavTarget(isNav ? null : m)}>
                      {isNav ? 'Stop' : 'Navigate'}
                    </button>
                  </div>
                  
                  <div className={styles.memberStats}>
                    <div className={styles.statItem}><Navigation size={12}/> {Math.round(dist)}m</div>
                    <div className={styles.statItem}><MapPin size={12}/> {Math.round(bear)}°</div>
                    <div className={styles.statItem}><Battery size={12}/> {m.battery}%</div>
                    <div className={styles.statItem}><Zap size={12}/> {m.hops} hop{m.hops!==1?'s':''}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

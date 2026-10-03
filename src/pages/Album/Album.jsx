import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Heart, Download, Upload, Image as ImageIcon, MapPin, Share2 } from 'lucide-react';
import clsx from 'clsx';
import styles from './Album.module.css';
import Button from '../../components/Button/Button.jsx';
import IconButton from '../../components/IconButton/IconButton.jsx';
import { useBubble } from '../../store/bubbleStore.js';
import { useUiActions } from '../../store/uiStore.js';

// SVG generators for 12 local samples
function generateSVG(seed) {
  const hues = [200, 340, 45, 120, 280, 20];
  const h = hues[seed % hues.length];
  const type = seed % 4; // 0:sunset, 1:hills, 2:campus, 3:crowd
  
  let content = '';
  if (type === 0) { // sunset
    content = `<rect width="100%" height="100%" fill="url(#grad${seed})"/><circle cx="50%" cy="60%" r="20%" fill="#FFD700" opacity="0.8"/><path d="M0 70 Q 200 60 400 80 L 400 200 L 0 200 Z" fill="#1e293b"/>`;
  } else if (type === 1) { // hills
    content = `<rect width="100%" height="100%" fill="url(#grad${seed})"/><path d="M-50 150 Q 100 50 250 150 T 550 150 L 550 300 L -50 300 Z" fill="#065f46" opacity="0.9"/><path d="M100 200 Q 250 100 400 200 T 700 200 L 700 300 L 100 300 Z" fill="#047857"/>`;
  } else if (type === 2) { // campus (buildings)
    content = `<rect width="100%" height="100%" fill="url(#grad${seed})"/><rect x="10%" y="40%" width="15%" height="60%" fill="#334155"/><rect x="30%" y="20%" width="20%" height="80%" fill="#475569"/><rect x="60%" y="50%" width="30%" height="50%" fill="#1e293b"/>`;
  } else { // crowd silhouettes
    content = `<rect width="100%" height="100%" fill="url(#grad${seed})"/><circle cx="20%" cy="80%" r="10%" fill="#0f172a"/><circle cx="40%" cy="75%" r="12%" fill="#1e293b"/><circle cx="60%" cy="85%" r="8%" fill="#0f172a"/><circle cx="80%" cy="70%" r="14%" fill="#1e293b"/>`;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300">
    <defs>
      <linearGradient id="grad${seed}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="hsl(${h}, 80%, 60%)" />
        <stop offset="100%" stop-color="hsl(${(h + 60) % 360}, 80%, 40%)" />
      </linearGradient>
    </defs>
    ${content}
  </svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

const INITIAL_SAMPLES = Array.from({ length: 12 }, (_, i) => ({
  id: `img-${i}`,
  url: generateSVG(i),
  sender: ['Aarav', 'Meera', 'Rohan', 'Sana'][i % 4],
  hopCount: (i % 3) + 1,
  likes: i % 5,
  likedByMe: false,
  uploaded: true,
}));

export default function Album() {
  const bubble = useBubble();
  const { addToast } = useUiActions();
  const [photos, setPhotos] = useState(INITIAL_SAMPLES);
  const [menuOpen, setMenuOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const [zoomed, setZoomed] = useState(false);
  const fileInputRef = useRef(null);
  const carouselRef = useRef(null);

  // Revoke object URLs on unmount
  useEffect(() => {
    return () => {
      photos.forEach(p => {
        if (p.url.startsWith('blob:')) URL.revokeObjectURL(p.url);
      });
    };
  }, [photos]);

  const handleKeyDown = (e) => {
    if (lightboxIndex === -1) return;
    if (e.key === 'Escape') setLightboxIndex(-1);
    if (e.key === 'ArrowLeft') navLightbox(-1);
    if (e.key === 'ArrowRight') navLightbox(1);
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const scrollCarousel = (dir) => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: dir * 300, behavior: 'smooth' });
    }
  };

  const navLightbox = (dir) => {
    setZoomed(false);
    let next = lightboxIndex + dir;
    if (next < 0) next = photos.length - 1;
    if (next >= photos.length) next = 0;
    setLightboxIndex(next);
  };

  const handleAddSample = () => {
    const seed = Math.floor(Math.random() * 100) + 20;
    simulateUpload(generateSVG(seed));
    setMenuOpen(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      addToast({ message: 'Only images are allowed.', type: 'danger' });
      return;
    }
    const url = URL.createObjectURL(file);
    simulateUpload(url);
    setMenuOpen(false);
    e.target.value = '';
  };

  const simulateUpload = (url) => {
    const newPhoto = {
      id: `img-up-${Date.now()}`,
      url,
      sender: 'You',
      hopCount: 0,
      likes: 0,
      likedByMe: false,
      uploaded: false, // will show progress
    };
    setPhotos(prev => [newPhoto, ...prev]);

    // Simulate upload progress
    setTimeout(() => {
      setPhotos(prev => prev.map(p => p.id === newPhoto.id ? { ...p, uploaded: true } : p));
      addToast({ message: 'Photo shared to bubble', type: 'success' });
    }, 1500);
  };

  const toggleLike = (id) => {
    setPhotos(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, likedByMe: !p.likedByMe, likes: p.likes + (p.likedByMe ? -1 : 1) };
      }
      return p;
    }));
  };

  const handleDownload = (photo) => {
    const a = document.createElement('a');
    a.href = photo.url;
    a.download = `bubble-photo-${photo.id}.jpg`;
    a.click();
    addToast({ message: 'Photo downloaded', type: 'info' });
  };

  if (!bubble) return null;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Shared Album</h1>
          <div style={{fontSize: '0.8125rem', color: 'var(--text-secondary)'}}>Photos from the mesh network</div>
        </div>
        <div className={styles.headerActions}>
          <Button onClick={() => setMenuOpen(!menuOpen)} icon={<Plus size={16}/>}>Add Photo</Button>
          <AnimatePresence>
            {menuOpen && (
              <motion.div initial={{opacity:0, y:-10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} className={styles.addMenu}>
                <button className={styles.addBtn} onClick={() => fileInputRef.current?.click()}><Upload size={16}/> Upload from device</button>
                <button className={styles.addBtn} onClick={handleAddSample}><ImageIcon size={16}/> Choose a sample</button>
              </motion.div>
            )}
          </AnimatePresence>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" style={{display: 'none'}} />
        </div>
      </div>

      {/* Carousel (first 5 images) */}
      {photos.length > 0 && (
        <div className={styles.carouselWrap}>
          <div className={styles.carouselArrow} style={{left: 16}} onClick={() => scrollCarousel(-1)}><ChevronLeft size={24}/></div>
          <div className={styles.carousel} ref={carouselRef}>
            {photos.slice(0, 5).map((p, idx) => (
              <div key={p.id} className={styles.carouselItem} onClick={() => setLightboxIndex(idx)}>
                <img src={p.url} alt="" className={styles.carouselImg} style={{ filter: p.uploaded ? 'none' : 'blur(4px)' }} />
                {!p.uploaded && (
                  <div className={styles.uploadOverlay}><div className={styles.spinner} /></div>
                )}
                <div className={styles.imgMeta}>
                  <div className={styles.metaText}>{p.sender}</div>
                  <div className={styles.metaText}><Heart size={12} fill={p.likedByMe?"#fff":"none"}/> {p.likes}</div>
                </div>
              </div>
            ))}
          </div>
          <div className={styles.carouselArrow} style={{right: 16}} onClick={() => scrollCarousel(1)}><ChevronRight size={24}/></div>
        </div>
      )}

      {/* Masonry Grid (all remaining images) */}
      <div className={styles.masonryWrap}>
        <div className={styles.masonry}>
          {photos.slice(5).map((p, idx) => (
            <div key={p.id} className={styles.masonryItem} onClick={() => setLightboxIndex(idx + 5)}>
              <img src={p.url} alt="" className={styles.masonryImg} style={{ filter: p.uploaded ? 'none' : 'blur(4px)' }} />
              {!p.uploaded && (
                <div className={styles.uploadOverlay}><div className={styles.spinner} /></div>
              )}
              <div className={styles.imgMeta}>
                <div className={styles.metaText}>{p.sender}</div>
                <div className={styles.metaText}><Heart size={12} fill={p.likedByMe?"#fff":"none"}/> {p.likes}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex >= 0 && (
          <motion.div className={styles.lightbox} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
            <div className={styles.lbHeader}>
              <div style={{display:'flex', alignItems:'center', gap: 12}}>
                <div style={{fontWeight: 700}}>{photos[lightboxIndex].sender}</div>
                {photos[lightboxIndex].hopCount > 0 && (
                  <div style={{fontSize: '0.75rem', background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: 12}}>
                    <Share2 size={10} style={{marginRight: 4}}/> {photos[lightboxIndex].hopCount} hops
                  </div>
                )}
              </div>
              <IconButton onClick={() => setLightboxIndex(-1)} aria-label="Close lightbox" style={{color: '#fff'}}><X size={20}/></IconButton>
            </div>
            
            <div className={styles.lbBody}>
              <div className={styles.lbImgWrap} onClick={() => setZoomed(!zoomed)}>
                <img 
                  src={photos[lightboxIndex].url} 
                  alt="Lightbox" 
                  className={clsx(styles.lbImg, zoomed ? styles.zoomed : styles.notZoomed)}
                />
              </div>
              <div className={styles.lbControls}>
                <button className={styles.lbArrow} onClick={(e) => { e.stopPropagation(); navLightbox(-1); }}><ChevronLeft size={32}/></button>
                <button className={styles.lbArrow} onClick={(e) => { e.stopPropagation(); navLightbox(1); }}><ChevronRight size={32}/></button>
              </div>
            </div>

            <div className={styles.lbFooter}>
              <button 
                className={clsx(styles.lbAction, photos[lightboxIndex].likedByMe && styles.liked)} 
                onClick={() => toggleLike(photos[lightboxIndex].id)}
              >
                <Heart size={20} fill={photos[lightboxIndex].likedByMe ? "#EF4444" : "none"} /> 
                {photos[lightboxIndex].likes} Likes
              </button>
              <button className={styles.lbAction} onClick={() => handleDownload(photos[lightboxIndex])}>
                <Download size={20} /> Download
              </button>
              <button className={styles.lbAction} onClick={() => setZoomed(!zoomed)}>
                {zoomed ? <ZoomOut size={20}/> : <ZoomIn size={20}/>} Zoom
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

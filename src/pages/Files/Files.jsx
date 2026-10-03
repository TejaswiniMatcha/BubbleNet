import { useState, useRef, useEffect } from 'react';
import { File as FileIcon, FileText, FileArchive, FileMusic, FileVideo, CheckCircle, Pause, Play, Download, Upload, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';
import styles from './Files.module.css';
import Button from '../../components/Button/Button.jsx';
import { useBubble } from '../../store/bubbleStore.js';
import { useUiActions } from '../../store/uiStore.js';

function getIcon(name) {
  const ext = name.split('.').pop().toLowerCase();
  if (['pdf', 'doc', 'docx', 'txt'].includes(ext)) return <FileText size={20} />;
  if (['zip', 'rar', 'tar', 'gz'].includes(ext)) return <FileArchive size={20} />;
  if (['mp3', 'wav', 'ogg'].includes(ext)) return <FileMusic size={20} />;
  if (['mp4', 'mkv', 'webm'].includes(ext)) return <FileVideo size={20} />;
  return <FileIcon size={20} />;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024, sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function sanitizeName(name) {
  return name.replace(/[^a-zA-Z0-9.\-_ ]/g, '').trim() || 'unnamed_file';
}

const INITIAL_FILES = [
  { id: 'f1', name: 'project_brief_v2.pdf', size: 2450000, sender: 'Meera', status: 'done', progress: 100, speed: '', hops: 2 },
  { id: 'f2', name: 'festival_map_highres.jpg', size: 4200000, sender: 'Rohan', status: 'done', progress: 100, speed: '', hops: 3 },
  { id: 'f3', name: 'ambient_mix.mp3', size: 14500000, sender: 'Aarav', status: 'active', progress: 45, speed: '2.1 MB/s via Wi-Fi Direct', hops: 1 },
];

export default function Files() {
  const bubble = useBubble();
  const { addToast } = useUiActions();
  const [files, setFiles] = useState(INITIAL_FILES);
  const fileInputRef = useRef(null);

  // Simulation loop for active downloads
  useEffect(() => {
    const timer = setInterval(() => {
      setFiles(prev => prev.map(f => {
        if (f.status === 'active') {
          const nextProg = f.progress + (Math.random() * 5 + 2);
          if (nextProg >= 100) return { ...f, progress: 100, status: 'done', speed: '' };
          return { ...f, progress: nextProg };
        }
        return f;
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      addToast({ message: 'File rejected. Maximum size is 25 MB.', type: 'danger' });
      return;
    }
    
    // Simulate a scenario where receiver is > 2 hops away for demo
    const simulatedHops = Math.floor(Math.random() * 3) + 1;
    if (file.size > 5 * 1024 * 1024 && simulatedHops > 2) {
      addToast({ message: 'Warning: File is over 5MB and network path is long. Transfer may be slow.', type: 'warning' });
    }

    const newFile = {
      id: `f-up-${Date.now()}`,
      name: sanitizeName(file.name),
      size: file.size,
      sender: 'You',
      status: 'active',
      progress: 0,
      speed: '1.2 MB/s via BLE/Wi-Fi',
      hops: simulatedHops,
      blob: file, // keep reference for download demo
    };

    setFiles(prev => [newFile, ...prev]);
    e.target.value = '';
  };

  const togglePause = (id) => {
    setFiles(prev => prev.map(f => {
      if (f.id === id) {
        if (f.status === 'active') return { ...f, status: 'paused', speed: 'Paused' };
        if (f.status === 'paused') return { ...f, status: 'active', speed: 'Resuming...' };
      }
      return f;
    }));
  };

  const handleDownload = (f) => {
    if (f.blob) {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(f.blob);
      a.download = f.name;
      a.click();
      URL.revokeObjectURL(a.href);
    } else {
      addToast({ message: 'Downloaded ' + f.name, type: 'success' });
    }
  };

  if (!bubble) return null;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Shared Files</h1>
          <div className={styles.sub}>Documents and media shared over the mesh</div>
        </div>
        <div>
          <Button onClick={() => fileInputRef.current?.click()} icon={<Upload size={16}/>}>Share File</Button>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{display: 'none'}} />
        </div>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>File</th>
              <th>Sender</th>
              <th>Transfer</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {files.map(f => (
              <tr key={f.id}>
                <td>
                  <div className={styles.fileInfo}>
                    <div className={styles.fileIcon}>{getIcon(f.name)}</div>
                    <div>
                      <div className={styles.fileName}>{f.name}</div>
                      <div className={styles.fileMeta}>{formatBytes(f.size)}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div style={{fontWeight: 600, color: 'var(--text-primary)'}}>{f.sender}</div>
                  <div className={styles.hopVis}>
                    {Array.from({length: Math.max(2, f.hops + 1)}).map((_, i) => (
                      <div key={i} className={clsx(styles.hopDot, i <= (f.progress/100) * f.hops && styles.active)} />
                    ))}
                    <span style={{fontSize: 10}}>{f.hops} hops</span>
                  </div>
                </td>
                <td>
                  {f.status !== 'done' ? (
                    <div className={styles.progressWrap}>
                      <div className={styles.progressBar}>
                        <div className={styles.progressFill} style={{width: `${f.progress}%`}} />
                      </div>
                      <div className={styles.progressSpeed}>{f.speed} • {Math.floor(f.progress)}%</div>
                    </div>
                  ) : (
                    <div style={{color: 'var(--text-muted)', fontSize: '0.8125rem'}}>Completed</div>
                  )}
                </td>
                <td>
                  {f.status === 'done' && <div className={clsx(styles.statusBadge, styles.done)}><CheckCircle size={12}/> Verified</div>}
                  {f.status === 'paused' && <div className={clsx(styles.statusBadge, styles.paused)}>Paused</div>}
                  {f.status === 'active' && <div className={clsx(styles.statusBadge, styles.active)}>Transferring</div>}
                </td>
                <td>
                  {f.status !== 'done' && (
                    <button className={styles.actionBtn} onClick={() => togglePause(f.id)}>
                      {f.status === 'paused' ? <Play size={18}/> : <Pause size={18}/>}
                    </button>
                  )}
                  {f.status === 'done' && (
                    <button className={styles.actionBtn} onClick={() => handleDownload(f)}>
                      <Download size={18} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

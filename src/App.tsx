import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchImages, getImageUrl, type ImageData } from './api';
import './App.css';

function App() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const observer = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null); 

  const loadImages = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetchImages(page);

      if (response.error) {
        setError(response.error);
        return;
      }

      const imageData = response.data || [];
      if (imageData.length === 0) {
        setHasMore(false);
      } else {
        setImages(prev => {
          // Create a Set of existing image IDs for efficient lookup
          const existingIds = new Set(prev.map(img => img.id));
          // Filter out any duplicate images
          const newImages = imageData.filter(img => !existingIds.has(img.id));
          // Combine previous and new images, then sort by ID to maintain consistent order
          const combinedImages = [...prev, ...newImages];
          return combinedImages.sort((a, b) => parseInt(a.id) - parseInt(b.id));
        });
        setError(null);
      }
    } catch (err) {
      setError('Failed to load images. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  const getContainerSize = (height:any, width:any) => {
    return {width: Math.round((width / height) * 250)}
  }

  const setLoaded = (imageIndex: number) => {
    setImages(prevState => {
      return prevState.map((prevImage, prevIndex) => {
        // let loaded = false
        // if(prevIndex === imageIndex){
        //   loaded = true
          // return {
          //   ...prevImage,
          //   loaded: true
          // }
        // }

      
        return {
          ...prevImage,
          loaded: !prevImage.loaded ? prevIndex === imageIndex : true
        }

      })
    })
  }

  useEffect(() => {
    loadImages();
  }, [loadImages]);

  useEffect(() => {
    if (loading) return;

    if (observer.current) observer.current.disconnect();

    const handleObserver = (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    };

    observer.current = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: '20px',
      threshold: 1.0
    });

    if (loadingRef.current) {
      observer.current.observe(loadingRef.current);
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [loading, hasMore]);

  return (
    <div className="app-container">
      {error && <div className="error-message">{error}</div>}

      <div className="image-gallery">
        {images.map((image, index) => (
          <div key={image.id} className="image-card" style={getContainerSize(image.height, image.width)}>
            <div className='image-container'>
              <img 
                src={getImageUrl(image.id, Math.round((image.width / image.height) * 250), 250)} 
                alt={`Photo by ${image.author}`}
                loading="lazy"
                onLoad={(e) => setLoaded(index)}
              />
              {!image.loaded && <span className="image-loading">loading...</span>}
              {/* {console.log(image.loaded)} */}
            </div>
            <div className="image-author">
              <span>{image.author}</span>
            </div>
          </div>
        ))}
      </div>

      <div ref={loadingRef}>
        {loading && <div className="loading">Loading images...</div>}
        {!loading && !hasMore && <div className="loading">No more images to load</div>}
      </div>
    </div>
  );
}

export default App;

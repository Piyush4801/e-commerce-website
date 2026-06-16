import React, { useState, useEffect } from 'react';
import axios from '../../services/api.js';
import { MapPin, Navigation, Compass, AlertCircle, RefreshCw } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const LocationSelector = ({ onLocationChange }) => {
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState('Bangalore, Karnataka');
  const [coords, setCoords] = useState({ lat: 12.9716, lng: 77.5946 });
  const [showMapModal, setShowMapModal] = useState(false);
  const [sellers, setSellers] = useState([]);
  const [selectedSeller, setSelectedSeller] = useState(null);
  
  const { addToast } = useToast();

  const detectLocation = () => {
    setLoading(true);
    if (!navigator.geolocation) {
      addToast('Geolocation is not supported by your browser', 'error');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ lat: latitude, lng: longitude });
        
        // Simulated reverse geocoding for hackathon fidelity
        const mockCities = [
          'Indiranagar, Bangalore, Karnataka',
          'Bandra West, Mumbai, Maharashtra',
          'Saket, New Delhi, Delhi',
          'Salt Lake, Kolkata, West Bengal',
          'Adyar, Chennai, Tamil Nadu'
        ];
        const randomCity = mockCities[Math.floor(Math.random() * mockCities.length)];
        setAddress(randomCity);
        
        try {
          await axios.post('/api/location/update', {
            lat: latitude,
            lng: longitude,
            address: randomCity
          });
          if (onLocationChange) onLocationChange(randomCity, { lat: latitude, lng: longitude });
        } catch (e) {
          console.error('Failed to sync location to backend:', e.message);
        }
        
        setLoading(false);
        addToast('Location updated automatically!', 'success');
      },
      (error) => {
        console.error(error);
        setLoading(false);
        addToast('Permission denied. Defaulting to Bangalore, Karnataka.', 'info');
      }
    );
  };

  useEffect(() => {
    // Initial fetch of sellers
    const fetchSellers = async () => {
      try {
        const res = await axios.get('/api/location/sellers');
        if (res.data.success) {
          setSellers(res.data.sellers || []);
          if (res.data.sellers.length > 0) {
            setSelectedSeller(res.data.sellers[0]);
          }
        }
      } catch (e) {
        console.error(e.message);
      }
    };
    fetchSellers();
  }, [coords]);

  const handleManualMapClick = async (latOffset, lngOffset, cityName) => {
    const newLat = coords.lat + latOffset;
    const newLng = coords.lng + lngOffset;
    setCoords({ lat: newLat, lng: newLng });
    setAddress(cityName);
    addToast(`Address changed to ${cityName}`, 'success');
    
    try {
      await axios.post('/api/location/update', { lat: newLat, lng: newLng, address: cityName });
      if (onLocationChange) onLocationChange(cityName, { lat: newLat, lng: newLng });
    } catch (e) {
      console.error(e.message);
    }
  };

  return (
    <div className="text-xs">
      <div className="flex items-center gap-2 bg-slate-100 dark:bg-darkBorder/40 p-2.5 rounded-xl border border-transparent dark:border-darkBorder/20">
        <MapPin size={14} className="text-emerald-500 animate-pulse" />
        <div className="flex-grow">
          <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Deliver to:</span>
          <span className="font-extrabold text-slate-700 dark:text-slate-200">{address}</span>
        </div>
        <div className="flex gap-1">
          <button 
            onClick={detectLocation}
            disabled={loading}
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-darkBorder/40 text-slate-500 hover:text-emerald-500 transition-colors"
            title="Auto-detect Location"
          >
            <Navigation size={12} className={loading ? 'animate-spin' : ''} />
          </button>
          <button 
            onClick={() => setShowMapModal(true)}
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-darkBorder/40 text-slate-500 hover:text-emerald-500 transition-colors font-bold uppercase text-[9px] tracking-wide"
          >
            Map
          </button>
        </div>
      </div>

      {/* Interactive Map Overlay Modal */}
      {showMapModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[250] flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-2xl rounded-3xl p-6 bg-white dark:bg-darkCard border border-slate-200/50 dark:border-darkBorder flex flex-col gap-5 glass shadow-2xl relative">
            <button
              onClick={() => setShowMapModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>

            <div>
              <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <Compass className="text-emerald-500 animate-spin-slow" size={18} />
                <span>Live Location Map & Seller Finder</span>
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Find nearby merchants, check ETA distance, and pin delivery locations.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
              {/* Mock Vector Map Canvas */}
              <div className="md:col-span-8 bg-slate-100 dark:bg-slate-950 rounded-2xl aspect-video border border-slate-200/60 dark:border-darkBorder relative overflow-hidden shadow-inner flex items-center justify-center">
                {/* SVG Mock Map Layout */}
                <svg className="absolute inset-0 w-full h-full opacity-35 dark:opacity-20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M 0 50 Q 150 120 300 50 T 600 50" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="5 5" />
                  <path d="M 50 0 Q 120 150 50 300 T 50 600" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="5 5" />
                  <circle cx="120" cy="180" r="40" fill="none" stroke="currentColor" strokeWidth="1" />
                  <circle cx="420" cy="90" r="60" fill="none" stroke="currentColor" strokeWidth="1" />
                </svg>

                {/* User Pin */}
                <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10 animate-bounce">
                  <div className="bg-red-500 text-white p-1 rounded-full shadow-lg border border-white">
                    <MapPin size={16} />
                  </div>
                  <span className="bg-slate-900/90 text-white font-bold text-[8px] px-1 rounded mt-1 shadow whitespace-nowrap">You</span>
                </div>

                {/* Seller Pins */}
                {sellers.map((seller, idx) => {
                  const offsets = [
                    { top: '25%', left: '30%' },
                    { top: '75%', left: '70%' },
                    { top: '35%', left: '80%' }
                  ];
                  const activePos = offsets[idx % offsets.length];

                  return (
                    <button
                      key={seller.id}
                      onClick={() => setSelectedSeller(seller)}
                      style={{ top: activePos.top, left: activePos.left }}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center hover:scale-115 transition-transform z-10 cursor-pointer ${
                        selectedSeller?.id === seller.id ? 'opacity-100' : 'opacity-60'
                      }`}
                    >
                      <div className="bg-emerald-500 text-white p-1 rounded-full shadow-md border border-white">
                        <MapPin size={12} />
                      </div>
                      <span className="bg-emerald-900/90 text-white text-[7px] font-bold px-1 rounded mt-0.5 whitespace-nowrap">
                        {seller.name.slice(0, 10)}...
                      </span>
                    </button>
                  );
                })}

                {/* Route simulator line path */}
                {selectedSeller && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-[120px] h-[2px] bg-emerald-500/80 border-t border-dashed border-emerald-400 rotate-[45deg] animate-pulse"></div>
                  </div>
                )}
                
                <span className="absolute bottom-2 left-2 text-[8px] bg-slate-900/85 text-white font-medium px-2 py-0.5 rounded shadow">
                  💡 Click pins to inspect merchant distance
                </span>
              </div>

              {/* Sidebar Info */}
              <div className="md:col-span-4 flex flex-col gap-4 text-xs">
                <div className="p-3.5 rounded-xl border border-slate-100 dark:border-darkBorder bg-slate-50 dark:bg-darkBorder/20 flex flex-col gap-2">
                  <span className="font-bold text-[10px] uppercase text-slate-400 tracking-wider">Selected Merchant</span>
                  {selectedSeller ? (
                    <div>
                      <strong className="block text-slate-800 dark:text-slate-100">{selectedSeller.name}</strong>
                      <div className="flex flex-col gap-1.5 mt-2 text-[10px] text-slate-500">
                        <span>📏 Distance: <strong className="text-slate-700 dark:text-slate-300">{selectedSeller.distance} km</strong></span>
                        <span>⏱️ Delivery ETA: <strong className="text-slate-700 dark:text-slate-300">{selectedSeller.eta} mins</strong></span>
                      </div>
                    </div>
                  ) : (
                    <span className="italic text-slate-400">No sellers detected.</span>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <span className="font-bold text-[10px] uppercase text-slate-400 tracking-wider">Quick Address Switch</span>
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
                    <button
                      onClick={() => handleManualMapClick(0.05, -0.04, 'Mumbai, Maharashtra')}
                      className="px-2.5 py-1.5 rounded bg-slate-100 dark:bg-darkBorder/40 hover:bg-emerald-500 hover:text-white transition-colors cursor-pointer text-center"
                    >
                      Mumbai
                    </button>
                    <button
                      onClick={() => handleManualMapClick(-0.03, 0.08, 'Delhi NCR, New Delhi')}
                      className="px-2.5 py-1.5 rounded bg-slate-100 dark:bg-darkBorder/40 hover:bg-emerald-500 hover:text-white transition-colors cursor-pointer text-center"
                    >
                      Delhi
                    </button>
                    <button
                      onClick={() => handleManualMapClick(0.0, 0.0, 'Bangalore, Karnataka')}
                      className="col-span-2 px-2.5 py-1.5 rounded bg-slate-100 dark:bg-darkBorder/40 hover:bg-emerald-500 hover:text-white transition-colors cursor-pointer text-center"
                    >
                      Bangalore HQ
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationSelector;

import React, { useState, useEffect } from 'react';
import MapView from './components/MapView';
import Filters from './components/Filters';
import RestroomDetails from './components/RestroomDetails';
import EmergencyButton from './components/EmergencyButton';
import AddRestroomModal from './components/AddRestroomModal';
import ReviewModal from './components/ReviewModal';
import ReportModal from './components/ReportModal';
import LoginPage from './components/LoginPage';
import UserTypeSelection, { UserType } from './components/UserTypeSelection';
import Logo from './components/Logo';
import PaymentModal from './components/PaymentModal';
import { searchRestroomsInArea } from './services/geminiService';
import { Restroom, FilterState } from './types';
import { Plus, Search, User, Loader2, Navigation, LogOut, MapPin, Zap, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [hasSelectedType, setHasSelectedType] = useState(false);
  const [restrooms, setRestrooms] = useState<Restroom[]>([]);
  const [filteredRestrooms, setFilteredRestrooms] = useState<Restroom[]>([]);
  const [selectedRestroom, setSelectedRestroom] = useState<Restroom | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [shouldCenter, setShouldCenter] = useState(false);
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    accessible: false,
    family: false,
    genderNeutral: false,
    free: false,
    publicOnly: false,
    type: ['public', 'commercial', 'paid']
  });

  useEffect(() => {
    if (isAuthenticated) {
      fetchRestrooms();
      getUserLocation();
      
      // Start watching position for real-time updates
      let watchId: number;
      if (navigator.geolocation) {
        watchId = navigator.geolocation.watchPosition(
          (position) => {
            setUserLocation([position.coords.latitude, position.coords.longitude]);
          },
          (error) => {
            console.error('Error watching location:', error);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      }
      return () => {
        if (watchId) navigator.geolocation.clearWatch(watchId);
      };
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (userLocation && !shouldCenter) {
      setShouldCenter(true);
    }
  }, [userLocation]);

  useEffect(() => {
    applyFilters();
  }, [restrooms, filters, userType]);

  const fetchRestrooms = async () => {
    try {
      const response = await fetch('/api/restrooms');
      const data = await response.json();
      setRestrooms(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching restrooms:', error);
      setLoading(false);
    }
  };

  const handleSearchArea = async () => {
    if (!userLocation) return;
    setIsSearching(true);
    try {
      const results = await searchRestroomsInArea(userLocation[0], userLocation[1]);
      
      // Add results to database
      for (const r of results) {
        await fetch('/api/restrooms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(r)
        });
      }
      
      await fetchRestrooms();
    } catch (error) {
      console.error('Error searching area:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const getUserLocation = (forceCenter = false) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLoc: [number, number] = [position.coords.latitude, position.coords.longitude];
          setUserLocation(newLoc);
          if (forceCenter) {
            setShouldCenter(true);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          if (!userLocation) {
            setUserLocation([55.7200, 12.4000]);
            setShouldCenter(true);
          }
          
          let errorMsg = "Could not get your location.";
          if (error.code === error.PERMISSION_DENIED) {
            errorMsg = "Please enable location permissions to find toilets near you.";
          }
          alert(errorMsg);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      if (!userLocation) {
        setUserLocation([55.7200, 12.4000]);
        setShouldCenter(true);
      }
      alert("Geolocation is not supported by your browser.");
    }
  };

  const applyFilters = () => {
    let filtered = restrooms.filter(r => {
      if (userType === 'infant' && r.has_baby_changing === 0) return false;
      if (filters.accessible && r.is_accessible === 0) return false;
      if (filters.family && r.has_baby_changing === 0) return false;
      if (filters.genderNeutral && r.is_gender_neutral === 0) return false;
      if (filters.free && r.is_free === 0) return false;
      if (filters.publicOnly && r.access_type !== 'open') return false;
      if (!filters.type.includes(r.type)) return false;
      return true;
    });

    if (userLocation) {
      filtered.sort((a, b) => {
        const distA = Math.sqrt(Math.pow(a.latitude - userLocation[0], 2) + Math.pow(a.longitude - userLocation[1], 2));
        const distB = Math.sqrt(Math.pow(b.latitude - userLocation[0], 2) + Math.pow(b.longitude - userLocation[1], 2));
        return distA - distB;
      });
    }

    setFilteredRestrooms(filtered);
  };

  const handleEmergency = async () => {
    if (emergencyMode) {
      setEmergencyMode(false);
      return;
    }

    setEmergencyMode(true);
    
    if (userLocation) {
      // Check if we have any restrooms nearby (within ~2km)
      const nearbyRestrooms = restrooms.filter(r => {
        const dist = Math.sqrt(Math.pow(r.latitude - userLocation[0], 2) + Math.pow(r.longitude - userLocation[1], 2));
        return dist < 0.02; // Roughly 2km
      });

      if (nearbyRestrooms.length === 0) {
        // Automatically search area if nothing nearby
        await handleSearchArea();
      }

      // Re-fetch or use updated list to find nearest
      const currentRestrooms = restrooms.length > 0 ? restrooms : [];
      if (currentRestrooms.length > 0) {
        const nearest = [...currentRestrooms].sort((a, b) => {
          const distA = Math.sqrt(Math.pow(a.latitude - userLocation[0], 2) + Math.pow(a.longitude - userLocation[1], 2));
          const distB = Math.sqrt(Math.pow(b.latitude - userLocation[0], 2) + Math.pow(b.longitude - userLocation[1], 2));
          return distA - distB;
        })[0];

        setTimeout(() => {
          setSelectedRestroom(nearest);
        }, 1000);
      }
    }
  };

  const handleAddRestroom = async (data: any) => {
    try {
      const response = await fetch('/api/restrooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (response.ok) {
        setIsAddModalOpen(false);
        fetchRestrooms();
      }
    } catch (error) {
      console.error('Error adding restroom:', error);
    }
  };

  const handleAddReview = async (data: any) => {
    if (!selectedRestroom) return;
    try {
      const response = await fetch(`/api/restrooms/${selectedRestroom.id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (response.ok) {
        setIsReviewModalOpen(false);
        fetchRestrooms();
      }
    } catch (error) {
      console.error('Error adding review:', error);
    }
  };

  const handleAddReport = async (data: any) => {
    if (!selectedRestroom) return;
    try {
      const response = await fetch(`/api/restrooms/${selectedRestroom.id}/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (response.ok) {
        setIsReportModalOpen(false);
        alert('Thank you for your report. Our scouts will investigate.');
      }
    } catch (error) {
      console.error('Error adding report:', error);
    }
  };

  const handleUserTypeSelect = (type: UserType) => {
    setUserType(type);
    setHasSelectedType(true);
    if (type === 'infant') {
      setFilters(prev => ({ ...prev, family: true }));
    }
  };

  const handleSignOut = () => {
    setIsAuthenticated(false);
    setHasSelectedType(false);
    setUserType(null);
    setShowUserMenu(false);
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={() => setIsAuthenticated(true)} />;
  }

  if (!hasSelectedType) {
    return <UserTypeSelection onSelect={handleUserTypeSelect} />;
  }

  return (
    <div className="relative w-full h-full bg-white overflow-hidden">
      <header className="absolute top-0 left-0 right-0 z-[1001] bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
        <div className="flex items-center gap-2 sm:gap-3">
          <Logo className="w-6 h-6 sm:w-8 h-8" />
          <div className="flex flex-col">
            <h1 className="text-lg sm:text-xl font-black text-gray-900 tracking-tighter leading-none">Toilet Finder</h1>
            <div className="flex items-center gap-1">
              <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-widest text-gray-400">Copenhagen</span>
              {isPremium && (
                <div className="flex items-center gap-0.5 bg-primary/10 px-1 rounded text-primary">
                  <Zap className="w-2 h-2 fill-primary" />
                  <span className="text-[7px] font-black uppercase tracking-widest">Premium</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3">
          {!isPremium && (
            <button 
              onClick={() => setIsPaymentModalOpen(true)}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-all group"
            >
              <Zap className="w-4 h-4 fill-primary group-hover:scale-110 transition-transform" />
              <span className="text-xs font-black uppercase tracking-widest">Go Premium</span>
            </button>
          )}
          <button 
            onClick={() => getUserLocation(true)}
            className="p-1.5 sm:p-2 bg-emerald-50 rounded-full hover:bg-emerald-100 transition-colors flex items-center gap-1 sm:gap-2 px-2 sm:px-3"
            title="Locate Me"
          >
            <Navigation className="w-4 h-4 sm:w-5 h-5 text-primary" />
            <span className="text-[10px] sm:text-xs font-bold text-primary hidden xs:inline">Locate Me</span>
          </button>
          <button 
            onClick={handleSearchArea}
            disabled={isSearching}
            className={`p-1.5 sm:p-2 rounded-full transition-all flex items-center gap-1 sm:gap-2 px-2 sm:px-3 ${
              isSearching 
                ? 'bg-primary/10 text-primary animate-pulse' 
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
            title="Search this area for real toilets"
          >
            {isSearching ? <Loader2 className="w-4 h-4 sm:w-5 h-5 animate-spin" /> : <Search className="w-4 h-4 sm:w-5 h-5" />}
            <span className="text-[10px] sm:text-xs font-bold hidden xs:inline">
              {isSearching ? 'Searching...' : 'Search Area'}
            </span>
          </button>
          <div className="relative">
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="p-1.5 sm:p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors"
            >
              <User className="w-4 h-4 sm:w-5 h-5 text-gray-600" />
            </button>
            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2"
                >
                  <button 
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors font-bold text-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <main className="w-full h-full pt-16">
        {loading ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="font-bold text-gray-400 uppercase tracking-widest text-sm">Initializing Map...</p>
          </div>
        ) : (
          <>
            <MapView 
              restrooms={filteredRestrooms} 
              onSelectRestroom={setSelectedRestroom} 
              userLocation={userLocation}
              emergencyMode={emergencyMode}
              shouldCenter={shouldCenter}
              onCenterComplete={() => setShouldCenter(false)}
            />
            <Filters filters={filters} setFilters={setFilters} count={filteredRestrooms.length} />
          </>
        )}
      </main>

      <EmergencyButton 
        onClick={handleEmergency} 
        onUpgrade={() => setIsPaymentModalOpen(true)}
        active={emergencyMode} 
        isPremium={isPremium}
      />

      <button 
        onClick={() => setIsAddModalOpen(true)}
        className="fixed top-20 sm:top-24 right-4 sm:right-6 z-[1000] bg-white text-gray-900 p-3 sm:p-4 rounded-2xl shadow-xl border border-gray-100 hover:scale-105 active:scale-95 transition-transform"
      >
        <Plus className="w-5 h-5 sm:w-6 h-6" />
      </button>

      <RestroomDetails 
        restroom={selectedRestroom} 
        userLocation={userLocation}
        onClose={() => setSelectedRestroom(null)}
        onReport={() => setIsReportModalOpen(true)}
        onReview={() => setIsReviewModalOpen(true)}
      />

      <AddRestroomModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSubmit={handleAddRestroom}
        userLocation={userLocation}
      />

      <ReviewModal 
        isOpen={isReviewModalOpen} 
        onClose={() => setIsReviewModalOpen(false)} 
        onSubmit={handleAddReview}
        restroom={selectedRestroom}
      />

      <ReportModal 
        isOpen={isReportModalOpen} 
        onClose={() => setIsReportModalOpen(false)} 
        onSubmit={handleAddReport}
        restroom={selectedRestroom}
      />

      <PaymentModal 
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSuccess={() => setIsPremium(true)}
      />

      <AnimatePresence>
        {emergencyMode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[4000] bg-primary text-white p-6 rounded-3xl shadow-2xl text-center w-[90%] max-w-sm border-4 border-white"
          >
            <div className="flex items-center gap-4">
              <div className="bg-white p-3 rounded-2xl shrink-0">
                <MapPin className="w-8 h-8 text-primary animate-bounce" />
              </div>
              <div className="text-left">
                <h2 className="text-lg font-black uppercase tracking-tight">Premium Active</h2>
                <p className="text-sm font-bold opacity-90">
                  Routing to nearest verified restroom...
                </p>
              </div>
            </div>
            <div className="mt-4 flex gap-1 justify-center">
              <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
              <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { Map, NavigationControl } from '@maptiler/sdk';
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore"; // Firestore imports
import { signInWithEmailAndPassword } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Import Firebase Storage
import { sendPasswordResetEmail } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { getDocs, collection, addDoc, deleteDoc } from "firebase/firestore";
import { getDoc } from "firebase/firestore";
import { fetchSignInMethodsForEmail } from "firebase/auth";
import Lottie from "lottie-react";
import axios from 'axios';
import animationData from './assets/animations/Animation - 1732083326926.json';
import newanimationData from './assets/animations/Animation - 1732084638317.json';
import successAnimation from './assets/animations/Animation - 1732088091629.json';
import animationnData from './assets/animations/Animation - 1733522992517.json';
import animationnDataa from './assets/animations/Animation - 1733522063537.json';
import failedAnimation from './assets/animations/Animation - 1733299048515.json'; 
import backgroundAnimation from './assets/animations/Animation - 1733306980902.json';
import reviewSuccessAnimation from './assets/animations/Animation - 1732088091629.json';
import notificationSound from './assets/sounds/pop-2-74387.mp3';


import './App.css';




// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyB_Qe_fmo5x6g5C7Gy7EQCalk_Sj6_0Vh0",
    authDomain: "breast-cancer-prediction-2db20.firebaseapp.com",
    projectId: "breast-cancer-prediction-2db20",
    storageBucket: "breast-cancer-prediction-2db20.firebasestorage.app",
    messagingSenderId: "679776173614",
    appId: "1:679776173614:web:58f7ebb39512bc664ce9bf",
    measurementId: "G-WG7TLH2L1B"
};
  
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
  const auth = getAuth(app);
  const db = getFirestore(app); // Initialize Firestore
  const user = auth.currentUser;
  


  const App = () => {
    const [user, setUser] = useState(null);
    const [activePage, setActivePage] = useState('homepage');
    const [callbackMessage, setCallbackMessage] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [citySuggestions, setCitySuggestions] = useState([]);
    const [citySearchVisible, setCitySearchVisible] = useState(false);
    const [formData, setFormData] = useState({
      username: '',
      email: '',
      password: '',
    });
    const [errorMessage, setErrorMessage] = useState('');
    const mapContainer = useRef(null); // Reference for the map container
    const [isVisible, setIsVisible] = useState(false); // State for scroll reveal
    const [isCreateAccountOpen, setCreateAccountOpen] = useState(false);
    const [isLoginOpen, setLoginOpen] = useState(false);
    const [isAnimating, setAnimating] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [activeDashboardPage, setActiveDashboardPage] = useState('account-settings');
    const [isDropdownVisible, setDropdownVisible] = useState(false);
    const storage = getStorage(app); // Initialize Firebase Storage
    const [medicalRecords, setMedicalRecords] = useState([]); // Manage medical records
    const [modalVisible, setModalVisible] = useState(false);  // Modal state for uploading
    const [customTitle, setCustomTitle] = useState(""); // Track custom title input
    const [consultations, setConsultations] = useState([]);
    const [showFailedAnimation, setShowFailedAnimation] = useState(false);
    const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [isReviewVisible, setIsReviewVisible] = useState(true);
    const [review, setReview] = useState("");
    const [rating, setRating] = useState(0);
    const reviewFormRef = useRef(null); // Reference to the review form container
    const [hover, setHover] = useState(0); // To manage hover effects
    const [showReviewSuccess, setShowReviewSuccess] = useState(false);
    const [explanation, setExplanation] = useState([]); // State to store SHAP explanation
   
    const [prediction, setPrediction] = useState('');
    const [inputData, setInputData] = useState({
        meanRadius: '',
        meanTexture: '',
        meanPerimeter: '',
        meanArea: '',
        meanSmoothness: '',
        meanCompactness: '',
        meanConcavity: '',
        meanConcavePoints: '',
        meanSymmetry: '',
        meanFractalDimension: '',
        radiusError: '',
        textureError: '',
        perimeterError: '',
        areaError: '',
        smoothnessError: '',
        compactnessError: '',
        concavityError: '',
        concavePointsError: '',
        symmetryError: '',
        fractalDimensionError: '',
        worstRadius: '',
        worstTexture: '',
        worstPerimeter: '',
        worstArea: '',
        worstSmoothness: '',
        worstCompactness: '',
        worstConcavity: '',
        worstConcavePoints: '',
        worstSymmetry: '',
        worstFractalDimension: ''
    });

    // Handle form input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setInputData({
            ...inputData,
            [name]: value
        });
    };

    // Handle form submission
    const handlePredictSubmit = async (e) => {
      e.preventDefault();
  
      const predictData = { ...inputData };
  
      try {
          const response = await axios.post('http://127.0.0.1:5000/predict', predictData);
  
          // Set the prediction result
          setPrediction(response.data.prediction);
  
          // Set the SHAP explanation
          setExplanation(response.data.explanation || []);
      } catch (error) {
          console.error('Error during prediction:', error.response || error.message);
          setPrediction('An error occurred. Please try again.');
          setExplanation([]);
      }
  };


    const toggleDropdown = () => {
        setDropdownVisible(!isDropdownVisible);
      };

    
    const toggleTheme = () => {
        const newTheme = !isDarkMode;
        setIsDarkMode(newTheme);
        document.body.className = newTheme ? "dark-mode" : "light-mode"; // Apply the class to the body
        localStorage.setItem("theme", newTheme ? "dark" : "light"); // Save preference
    };




    const toggleReviewVisibility = () => {
      const audio = new Audio(notificationSound); // Create audio object
      audio.play(); // Play the sound
      setIsReviewVisible(!isReviewVisible);
  };
  
    const handleReviewSubmit = async (e) => {
      e.preventDefault();
  
      if (!user) {
          alert("You must be logged in to submit a review.");
          return;
      }
  
      try {
          const reviewData = {
              review: review,
              rating: rating,
              userId: user.uid, // Ensure user is logged in
              timestamp: new Date(),
          };
  
          // Add the review to Firestore
          const docRef = await addDoc(collection(db, "reviews"), reviewData);
          console.log("Review written with ID: ", docRef.id);
  
          setReview(""); // Reset form
          setRating(0); // Reset rating
          setIsReviewVisible(false); // Close review form
  
          // Show success animation
          setShowReviewSuccess(true);
          setTimeout(() => setShowReviewSuccess(false), 3000);
      } catch (error) {
          console.error("Error submitting review:", error);
          alert("Failed to submit the review. Please try again.");
      }
  };
  // Function to get the rating text based on hover or selected rating
  const getRatingText = () => {
    if (hover === 1 || rating === 1) {
        return 'Very Bad';
    } else if (hover === 2 || rating === 2) {
        return 'Bad';
    } else if (hover === 3 || rating === 3) {
        return 'Average';
    } else if (hover === 4 || rating === 4) {
        return 'Good';
    } else if (hover === 5 || rating === 5) {
        return 'Excellent';
    }
    return '';
};
  
  
    

      // Handlers for opening/closing modals
      const openLoginModal = () => setLoginOpen(true);
      const closeLoginModal = () => setLoginOpen(false);
      const openCreateAccountModal = () => setCreateAccountOpen(true);
      const closeCreateAccountModal = () => setCreateAccountOpen(false);

     // Google Login Handler
     const handleLogin = async () => {
      const provider = new GoogleAuthProvider();
      try {
          const result = await signInWithPopup(auth, provider);
          const user = result.user;
  
          // Save user to Firestore
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);
  
          if (!userDocSnap.exists()) {
              await setDoc(userDocRef, {
                  username: user.displayName || "User",
                  email: user.email,
                  photoURL: user.photoURL || "default-avatar.png",
                  createdAt: new Date().toISOString(),
              });
              console.log("User added to Firestore:", user.uid);
          } else {
              console.log("User already exists in Firestore:", user.uid);
          }
  
          setUser({
              uid: user.uid,
              displayName: user.displayName || "User",
              email: user.email,
              photoURL: user.photoURL || "default-avatar.png",
          });
  
          console.log("User signed in:", user);
          alert(`Welcome, ${user.displayName}!`);
          closeLoginModal();
      } catch (error) {
          console.error("Login failed:", error.message);
          alert("Login failed. Please try again.");
      }
  };
  

  // Logout Handler
  const handleLogout = async () => {
    try {
        await signOut(auth);
        setUser(null); // Clear user state
        setActivePage('homepage'); // Redirect to homepage
        console.log("User signed out.");
    } catch (error) {
        console.error("Logout failed:", error);
    }
};

   // Handle Create Account
   const handleCreateAccountSubmit = async (e) => {
    e.preventDefault();
    const { username, email, password } = formData;

    if (username.length < 3) {
        setErrorMessage("Username must be at least 3 characters long.");
        return;
    }
    if (password.length < 6) {
        setErrorMessage("Password must be at least 6 characters long.");
        return;
    }

    try {
        // Check if email already exists
        const signInMethods = await fetchSignInMethodsForEmail(auth, email);
        if (signInMethods.length > 0) {
            setErrorMessage("Email is already in use. Try logging in instead.");
            return;
        }

        // Create account
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Save to Firestore
        await setDoc(doc(db, "users", user.uid), {
            username,
            email,
            createdAt: new Date().toISOString(),
        });

        console.log("User created and saved:", user);
        setFormData({ username: "", email: "", password: "" });
        setErrorMessage("");
        closeCreateAccountModal();
        alert("Account created successfully!");
    } catch (error) {
        console.error("Error creating account:", error);
        setErrorMessage(error.message);
    }
};

const handleEmailPasswordLogin = async (e) => {
    e.preventDefault();
    const { email, password } = formData;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        setUser({
            uid: user.uid, // Add UID here
            displayName: user.displayName || "User",
            email: user.email,
            photoURL: user.photoURL || "default-avatar.png"
        });

        console.log("Logged in with email/password:", user);
        closeLoginModal();
    } catch (error) {
        console.error("Login failed:", error.message);
        setErrorMessage("Invalid email or password. Please try again.");
    }
};
const fetchMedicalRecords = async () => {
  if (!user || !user.uid) return;

  const records = [];
  try {
    const querySnapshot = await getDocs(collection(db, "users", user.uid, "medicalRecords"));
    querySnapshot.forEach((doc) => {
      records.push({ id: doc.id, ...doc.data() });
    });
    setMedicalRecords(records);
  } catch (error) {
    console.error("Error fetching medical records:", error);
  }
};
const handleDeleteRecord = async (recordId) => {
  try {
    await deleteDoc(doc(db, "users", user.uid, "medicalRecords", recordId));
    fetchMedicalRecords(); // Refresh records
    alert("Record deleted successfully!");
  } catch (error) {
    console.error("Error deleting record:", error);
  }
};
const addMedicalRecord = async (userId, title, fileURL) => {
  try {
    // Reference to the user's medicalRecords collection
    const medicalRecordsRef = collection(db, "users", userId, "medicalRecords");

    // Add a new record
    await addDoc(medicalRecordsRef, {
      title: title,
      fileURL: fileURL,
      uploadedAt: new Date().toISOString(),
    });

    console.log("Medical record added successfully!");
  } catch (error) {
    console.error("Error adding medical record:", error);
  }
};
const fetchConsultations = async () => {
  if (!user || !user.uid) return;

  try {
    const consultationsRef = collection(db, "users", user.uid, "consultations");
    const querySnapshot = await getDocs(consultationsRef);
    const consultationsData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setConsultations(consultationsData);
  } catch (error) {
    console.error("Error fetching consultations:", error);
  }
};




    const states = [
        "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
        "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
        "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
        "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
        "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
        "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Jammu and Kashmir",
        "Ladakh"
    ];

    const citiesOfWestBengal = [
        "Kolkata", "Siliguri", "Durgapur", "Howrah", "Asansol", 
        "Bardhaman", "Malda", "Bhatpara", "Berhampore", "Kalyani", 
        "Bongaon", "Habra", "Ranaghat", "Krishnanagar", "Panchla"
    ];
    const medicalRecordTypes = [
      "X-Ray",
      "CT Scan",
      "MRI",
      "Blood Report",
      "Ultrasound",
      "Prescription",
      "Surgery Report",
      "Pathology Report",
      "Vaccination Record",
      "ECG",
  ];


  useEffect(() => {
    const timer = setInterval(() => {
        const audio = new Audio(notificationSound); // Notification sound
        audio.play(); // Play sound
        setIsReviewVisible(true);
    }, 60000); // 1 minute interval

    return () => clearInterval(timer);
}, []);
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
                setUser({
                    uid: firebaseUser.uid,
                    displayName: firebaseUser.displayName || "User",
                    email: firebaseUser.email,
                    photoURL: firebaseUser.photoURL || "default-avatar.png"
                });
            } else {
                setUser(null);
            }
        });
    
        return () => unsubscribe();
    }, []);
    useEffect(() => {
        const handleOutsideClick = (event) => {
          if (!event.target.closest('.avatar-container')) {
            setDropdownVisible(false);
          }
        };
      
        document.addEventListener('click', handleOutsideClick);
      
        return () => {
          document.removeEventListener('click', handleOutsideClick);
        };
      }, []);
    

    useEffect(() => {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme) {
            const isDark = savedTheme === "dark";
            setIsDarkMode(isDark);
            document.body.className = isDark ? "dark-mode" : "light-mode";
        }
    }, []);
    
    
    useEffect(() => {
        // Dynamically load the Tawk.to script
        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://embed.tawk.to/67399b492480f5b4f59f3ab3/1icsgd6ag';
        script.charset = 'UTF-8';
        script.setAttribute('crossorigin', '*');
        document.body.appendChild(script);

        // Cleanup function to remove the script when the component unmounts
        return () => {
            document.body.removeChild(script);
        };
    }, []); // Run only once when the component mounts
    useEffect(() => {
      const handleScroll = () => {
          const revealPoint = window.innerHeight / 1.5;
          const element = document.getElementById('reveal-image');
          if (element && element.getBoundingClientRect().top < revealPoint) {
              setIsVisible(true);
          }
      };

      window.addEventListener('scroll', handleScroll);
      return () => {
          window.removeEventListener('scroll', handleScroll);
      };
  }, []);
    useEffect(() => {
      let map;
      if (activePage === 'find-doctors') {
          map = new Map({
              container: mapContainer.current,
              style: 'https://api.maptiler.com/maps/streets/style.json?key=mGIuMUIdpRDNV8G8mRk3', // Replace with your MapTiler API key
              center: [88.3639, 22.5726], // Default center coordinates (Kolkata, India)
              zoom: 10,
          });
          map.addControl(new NavigationControl(), 'top-right');
      }

      return () => {
          if (map) {
              map.remove(); // Cleanup the map on component unmount
          }
      };
  }, [activePage]);
  // Call this function whenever the 'medical-records' page is active
useEffect(() => {
  if (activeDashboardPage === 'medical-records') {
    fetchMedicalRecords();
  }
}, [activeDashboardPage, user]);



    useEffect(() => {
        showPage('homepage'); // Show the homepage initially
    }, []);

    const showPage = (pageId) => {
        setActivePage(pageId);
    };
    const handleUploadRecord = async (e) => {
      e.preventDefault();
      const userId = auth.currentUser?.uid; // Retrieve userId from Firebase Authentication
    
      if (!userId) {
        console.error("User is not logged in.");
        return;
      }
    
      try {
        await addDoc(collection(db, "users", userId, "medicalRecords"), {
          title: "Sample Record",
          fileURL: "https://example.com/sample.pdf",
          uploadedAt: new Date().toISOString(),
        });
        console.log("Record uploaded successfully!");
      } catch (error) {
        console.error("Error uploading record:", error);
      }
    };

    // Call this function when the Consultations page is active
useEffect(() => {
  if (activeDashboardPage === 'consultations') {
    fetchConsultations();
  }
}, [activeDashboardPage, user]);
    
  
    
    


    
    

    const openConsultationForm = () => {
        document.getElementById('consultForm').style.display = 'block';
    };

    const handleVideoConsultSubmit = async (e) => {
      e.preventDefault();
    
      const consultData = {
        firstName: e.target.firstName.value,
        lastName: e.target.lastName.value,
        contactNo: e.target.contactNo.value,
        healthIssue: e.target.healthIssue.value,
        consultDate: e.target.consultDate.value,
        callbackTime: e.target.callbackTime.value,
        submittedAt: new Date().toISOString(),
      };
    
      // Check for missing or invalid fields
  if (!consultData.firstName || !consultData.lastName) {
    setCallbackMessage("Please provide your first and last name.");
    return;
  }

  if (!consultData.contactNo.match(/^\d{10}$/)) {
    setCallbackMessage("Please enter a valid 10-digit contact number.");
    return;
  }

  if (!consultData.healthIssue) {
    setCallbackMessage("Please describe your health issue.");
    return;
  }

  if (!consultData.consultDate || !consultData.callbackTime) {
    setCallbackMessage("Please select both a date and a callback time.");
    return;
  }
    
      const userId = auth.currentUser?.uid; // Ensure the user is logged in
    
      if (!userId) {
        setShowFailedAnimation(true); // Show animation and message
        setTimeout(() => setShowFailedAnimation(false), 3000); // Hide after 3 seconds
        return;
    }
    
      try {
        // Save consultation to Firestore under the user's specific path
        await setDoc(
          doc(db, "users", userId, "consultations", `${Date.now()}`),
          consultData
        );
    
        // Show success animation and message
        setSuccessMessage(
          `You will get a call back on ${consultData.consultDate} at ${consultData.callbackTime}.`
      );
      setShowSuccessAnimation(true);
      setTimeout(() => setShowSuccessAnimation(false), 5000); // Hide after 5 seconds

    
        e.target.reset(); // Clear the form
        document.getElementById("consultForm").style.display = "none";
      } catch (error) {
        console.error("Error saving consultation data:", error);
        setCallbackMessage("There was an error. Please try again.");
      }
    };
    
    const handleDeleteConsultation = async (consultationId) => {
      try {
          const consultationsRef = doc(db, "users", user.uid, "consultations", consultationId);
          await deleteDoc(consultationsRef);
  
          // Update local state
          setConsultations((prev) => prev.filter((c) => c.id !== consultationId));
          alert("Consultation deleted successfully!");
      } catch (error) {
          console.error("Error deleting consultation:", error);
          alert("Failed to delete the consultation. Please try again.");
      }
  };
    
      
  const handleRescheduleConsultation = (consultationId) => {
    const consultationToEdit = consultations.find((c) => c.id === consultationId);
    if (!consultationToEdit) return;

    // Pre-fill a form with existing data (this can be a modal)
    setFormData({
        ...consultationToEdit,
    });
    setModalVisible(true); // Assume you have a modal state
};
    
const handleSubmitReschedule = async (e) => {
  e.preventDefault();
  const updatedConsultation = {
      consultDate: e.target.consultDate.value,
      callbackTime: e.target.callbackTime.value,
  };

  try {
      const consultationsRef = doc(db, "users", user.uid, "consultations", formData.id);
      await setDoc(consultationsRef, updatedConsultation, { merge: true });

      // Update local state
      setConsultations((prev) =>
          prev.map((c) =>
              c.id === formData.id ? { ...c, ...updatedConsultation } : c
          )
      );

      alert("Consultation rescheduled successfully!");
      setModalVisible(false);
  } catch (error) {
      console.error("Error rescheduling consultation:", error);
      alert("Failed to reschedule the consultation. Please try again.");
  }
};
   
    
const handlePasswordReset = async () => {
  if (!formData.email) {
      alert("Please enter your email to reset your password.");
      return;
  }

  try {
      await sendPasswordResetEmail(auth, formData.email);
      alert("Password reset email sent! Please check your inbox.");
  } catch (error) {
      console.error("Error sending password reset email:", error);
      alert("Failed to send password reset email. Please try again.");
  }
};

      

    const handleStateInput = (e) => {
        const input = e.target.value.toLowerCase();
        const filteredStates = states.filter(state => state.toLowerCase().includes(input));
        setSuggestions(filteredStates);
        setCitySearchVisible(false);
    };

    const handleStateSelect = (state) => {
        setFormData({ ...formData, state });
        setSuggestions([]);
        if (state === "West Bengal") {
            setCitySearchVisible(true);
        } else {
            setCitySearchVisible(false);
        }
    };

    const handleCityInput = (e) => {
        const input = e.target.value.toLowerCase();
        const filteredCities = citiesOfWestBengal.filter(city => city.toLowerCase().includes(input));
        setCitySuggestions(filteredCities);
    };

   

    const validateEmail = (email) => {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(String(email).toLowerCase());
  };

  return (
      <div>

{showReviewSuccess && (
    <div className="review-success-overlay">
        <div className="review-success-content">
            <Lottie animationData={reviewSuccessAnimation} loop={false} />
            <p>Thanks for your review!</p>
        </div>
    </div>
)} 
           <header>
         

           
           <h1>Breast Cancer Prediction</h1>
                <button onClick={openCreateAccountModal}>Create Account</button>
                <button onClick={openLoginModal}>Login</button>
                <button onClick={toggleTheme}>
        {isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
    </button>
              <nav>
                  <ul>
                  {user && <li><a href="#" onClick={() => showPage('dashboard')}>Dashboard</a></li>}
                      <li><a href="#" onClick={() => showPage('homepage')}>Homepage</a></li>
                      <li><a href="#" onClick={() => showPage('predict')}>Predict</a></li>
                      <li><a href="#" onClick={() => showPage('find-doctors')}>Find Doctors</a></li>
                      <li><a href="#" onClick={() => showPage('video-consult')}>Video Consult</a></li>
                      <li><a href="#" onClick={() => showPage('about')}>About</a></li>
                      
                      
                  </ul>
              </nav>
          </header>
           {/* Failed Animation and Message */}
        {showFailedAnimation && (
            <div className="animationnn-overlay">
                <Lottie animationData={failedAnimation} loop={false} autoplay />
                <p className="error-message">You must be logged in to book a consultation.</p>
            </div>
        )}
        {showSuccessAnimation && (
    <div className="animationnn-overlay">
        <Lottie animationData={successAnimation} loop={false} autoplay />
        <p className="success-message">{successMessage}</p>
    </div>
)}


{modalVisible && (
    <div className="modall-overlay" onClick={() => setModalVisible(false)}>
        <div className="modall open" onClick={(e) => e.stopPropagation()}>
            <h2>Reschedule Consultation</h2>
            <form onSubmit={handleSubmitReschedule}>
                <label>
                    New Date:
                    <input type="date" name="consultDate" defaultValue={formData.consultDate} required />
                </label>
                <label>
                    New Time:
                    <select name="callbackTime" defaultValue={formData.callbackTime} required>
                        <option value="10:00 AM">10:00 AM</option>
                        <option value="11:00 AM">11:00 AM</option>
                        <option value="12:00 PM">12:00 PM</option>
                        <option value="1:00 PM">1:00 PM</option>
                        <option value="2:00 PM">2:00 PM</option>
                        <option value="3:00 PM">3:00 PM</option>
                        <option value="4:00 PM">4:00 PM</option>
                        <option value="5:00 PM">5:00 PM</option>
                        <option value="6:00 PM">6:00 PM</option>
                        <option value="7:00 PM">7:00 PM</option>
                        <option value="8:00 PM">8:00 PM</option>
                    </select>
                </label>
                <button type="submit">Submit</button>
                <button type="button" onClick={() => setModalVisible(false)}>Cancel</button>
            </form>
        </div>
    </div>
)}

           {/* Create Account Modal */}
           {isCreateAccountOpen && (
                <div className="modal-overlay" onClick={closeCreateAccountModal}>
                    <div className="modal open" onClick={(e) => e.stopPropagation()}>
                        <h2>Create Account</h2>
                        <form onSubmit={handleCreateAccountSubmit}>
                            <label>Username:</label>
                            <input
                                type="text"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                required
                            />
                            <label>Email:</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                            <label>Password:</label>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                            <button type="submit">Create Account</button>
                        </form>
                        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
                    </div>
                </div>
            )}

          {/* Login Modal */}
{isLoginOpen && (
    <div className="modal-overlay" onClick={closeLoginModal}>
        <div className="modal open" onClick={(e) => e.stopPropagation()}>
            <h2>Login</h2>
            <form onSubmit={handleEmailPasswordLogin}>
                <label>Email:</label>
                <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                />
                <label>Password:</label>
                <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                />
                <button type="submit">Login</button>
            </form>
            <p>Or</p>
            <button onClick={handleLogin}>Sign in with Google</button>
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
        </div>
    </div>
)}

             {/* Display User Info */}
             {user ? (
                <section className="user-section">
                    
                    <div className="avatar-container">
  <img
    src={user.photoURL || "default-avatar.png"} // Replace with a placeholder URL if no avatar
    alt="User Avatar"
    className="avatar"
  />
</div>
                </section>
            ) : (
                <section>
                    
                </section>
            )}
            <div className={`animations-overlay ${isAnimating ? 'show' : 'hide'}`}>
    <Lottie animationData={successAnimation} loop={false} autoplay={true} />
</div>

          <main>
          {activePage === 'homepage' && (
  <section id="homepage" className="page active">
    <section id="home" className="page active">
      <div className="animation-overlay">
        <Lottie animationData={newanimationData} loop autoplay />
      </div>
      <h2 className="animated-text">Welcome to the Breast Cancer Prediction App</h2>
      <p className="empowering-text animated-text">Empowering you with knowledge and support.</p>
    </section>
    <section className="info-section">
      <h2>What is Breast Cancer?</h2>
      <p>Breast cancer is a type of cancer that starts in the breast...</p>
      <button id="readMoreButton" className="animated-button" onClick={() => window.open('https://www.mayoclinic.org/diseases-conditions/breast-cancer/symptoms-causes/syc-20352470', '_blank')}>Read More</button>
    </section>
    <section className="info-section">
      <h2>Signs and Symptoms</h2>
      <ul>
        <li>Lump or mass in the breast or underarm</li>
        <li>Change in size or shape of the breast</li>
        <li>Unexplained pain in the breast or nipple</li>
        <li>Skin changes on the breast or nipple</li>
      </ul>
    </section>
    <footer>
      <p>© 2024 Group No. 46. All rights reserved.</p>
      <p>
        Follow us: 
        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a> |
        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">Twitter</a> |
        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn</a> |
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a>
      </p>
      <div className="social-icons">
        <img src="https://www.teahub.io/photos/full/11-115962_facebook-logo-png-transparent-background-facebook-png.png" alt="Facebook" />
        <img src="https://www.pngkey.com/png/full/2-27646_twitter-logo-png-transparent-background-logo-twitter-png.png" alt="Twitter" />
        <img src="https://static-00.iconduck.com/assets.00/linkedin-icon-2048x2048-ya5g47j2.png" alt="LinkedIn" />
        <img src="https://freelogopng.com/images/all_img/1658586823instagram-logo-transparent.png" alt="Instagram" />
      </div>
    </footer>
  </section>
                  
              )}
              {activePage === 'dashboard' && user && (
  <section id="dashboard" className="page active">
    {/* Dashboard Navigation */}
    <nav className="dashboard-nav">
      <ul>
        <li><a href="#" onClick={() => setActiveDashboardPage('account-settings')}>Account Settings</a></li>
        <li><a href="#" onClick={() => setActiveDashboardPage('prediction-history')}>Prediction History</a></li>
        <li><a href="#" onClick={() => setActiveDashboardPage('medical-records')}>Medical Records</a></li>
        <li><a href="#" onClick={() => setActiveDashboardPage('consultations')}>Consultations</a></li>
      </ul>
    </nav>

    {/* Render Selected Dashboard Page */}
    
    {activeDashboardPage === 'account-settings' && (
  <section id="account-settings">
    <div className="account-settings-overlay"> <Lottie animationData={backgroundAnimation} loop={true} autoplay /></div>
    
    <h3>Account Settings</h3>
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (!user || !user.uid) {
          alert("User not logged in or UID missing.");
          return;
        }
        try {
          const file = e.target.avatar.files[0];
          let avatarUrl = user.photoURL;

          if (file) {
            const avatarRef = ref(storage, `avatars/${user.uid}`);
            await uploadBytes(avatarRef, file);
            avatarUrl = await getDownloadURL(avatarRef);
          }

          // Update Firestore with new data
          await setDoc(
            doc(db, "users", user.uid),
            {
              username: e.target.username.value,
              email: e.target.email.value,
              photoURL: avatarUrl,
            },
            { merge: true }
          );

          // Update local user state
          setUser((prev) => ({
            ...prev,
            displayName: e.target.username.value,
            email: e.target.email.value,
            photoURL: avatarUrl,
          }));

          alert("Profile updated successfully!");
        } catch (error) {
          console.error("Error updating profile:", error);
          alert("An error occurred while updating your profile.");
        }
      }}
    >
      <p>
        <strong>User ID:</strong> {user.uid}
      </p>
      <label>
        Username:
        <input type="text" name="username" defaultValue={user.displayName} required />
      </label>
      <label>
        Email:
        <input type="email" name="email" defaultValue={user.email} required />
      </label>
      <label>
        Avatar:
        <input type="file" name="avatar" accept="image/*" />
      </label>
      
      <button type="submit">Save Changes</button>
    </form>
    <button onClick={handlePasswordReset}>Change Password</button>
  </section>
)}
 

    
     {/* Review Box */}
     {isReviewVisible && (
                <div className={`review-overlay ${isReviewVisible ? 'show' : ''}`}>
                    <div className="review-box">
                        <span
                            className="close-button"
                            onClick={() => setIsReviewVisible(false)}
                        >
                            &times;
                        </span>
                        <h3>Submit Your Review</h3>
                        <form onSubmit={handleReviewSubmit}>
                            <div className="input-group">
                                <textarea
                                    id="reviewText"
                                    value={review}
                                    onChange={(e) => setReview(e.target.value)}
                                    placeholder=" "
                                />
                                <label htmlFor="reviewText">Your Review</label>
                            </div>

                            <div className="star-rating">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <span
                                        key={star}
                                        className={`star ${
                                            star <= (hover || rating) ? 'filled' : 'empty'
                                        }`}
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHover(star)}
                                        onMouseLeave={() => setHover(0)}
                                    >
                                        ★
                                    </span>
                                ))}
                            </div>

                            {/* Tooltip Text */}
                            <div className="rating-text">
                                {getRatingText()}
                            </div>

                            <button className="submit-btn" type="submit" disabled={rating === 0 || !review}>
                                Submit
                            </button>
                        </form>
                    </div>
                </div>
            )}


{activeDashboardPage === 'consultations' && (
  <section id="consultations">
    <h3>My Consultations</h3>
    {consultations.length === 0 ? (
    <p>You have not booked any consultations yet.</p>
) : (
    <ul>
        {consultations.map((consult) => (
            <li key={consult.id}>
                <h4>{consult.healthIssue}</h4>
                <p>Date: {consult.consultDate}</p>
                <p>Callback Time: {consult.callbackTime}</p>
                <p>Contact: {consult.contactNo}</p>
                <button onClick={() => handleDeleteConsultation(consult.id)}>Delete</button>
                <button onClick={() => handleRescheduleConsultation(consult.id)}>Reschedule</button>
            </li>
        ))}
    </ul>
)}
  </section>
)}
      
    
    
    {activeDashboardPage === 'prediction-history' && (
      <section id="prediction-history">
        <h3>Prediction History</h3>
        <p>View your past predictions here.</p>
      </section>
    )}
    {activeDashboardPage === 'medical-records' && (
  <section id="medical-records">
    <h3>Medical Records</h3>
    <button onClick={() => setModalVisible(true)}>Upload New Record</button>
    <ul>
      {medicalRecords.map((record) => (
        <li key={record.id}>
          <h4>{record.title}</h4>
          <a href={record.fileURL} target="_blank" rel="noopener noreferrer">View</a>
          <button onClick={() => handleDeleteRecord(record.id)}>Delete</button>
        </li>
      ))}
    </ul>

    {/* Upload Modal */}
    {modalVisible && (
      <div className="modal-overlay" onClick={() => setModalVisible(false)}>
        <div className="modal open" onClick={(e) => e.stopPropagation()}>
          <h2>Upload Medical Record</h2>
          <form onSubmit={handleUploadRecord}>
    <label>Title:</label>
    <select
        name="title"
        required
        onChange={(e) => setCustomTitle(e.target.value === "Custom" ? "" : e.target.value)}
    >
        <option value="" disabled selected>
            Select Record Type
        </option>
        {medicalRecordTypes.map((type, index) => (
            <option key={index} value={type}>
                {type}
            </option>
        ))}
        <option value="Custom">Custom</option> {/* Option for custom title */}
    </select>

    {customTitle === "" && (
        <input
            type="text"
            name="customTitle"
            placeholder="Enter custom title"
            onChange={(e) => setCustomTitle(e.target.value)}
            required
        />
    )}

    <label>File:</label>
    <input type="file" name="fileInput" accept="image/*,application/pdf" required />

    <button type="submit">Upload</button>
</form>

        </div>
      </div>
    )}
  </section>
)}

  </section>
)}

{activePage === 'predict' && (
            <section id="predict" className="page active">
                <h2>Predict Breast Cancer</h2>
                <div className="animationn-container">
                <Lottie animationData={animationnData} loop={true} />
            </div>
            <div className="aniimationn-container">
                <Lottie animationData={animationnDataa} loop={true} />
            </div>
                <form onSubmit={handlePredictSubmit}>
                    <h2>Enter the 30 Features</h2>
                    {Object.keys(inputData).map((key) => (
                        <div key={key}>
                            <label>{key.replace(/([A-Z])/g, ' $1').toUpperCase()}:</label>
                            <input
                                type="number"
                                name={key}
                                value={inputData[key]}
                                onChange={handleChange}
                                required
                                step="any"
                            />
                        </div>
                    ))}
                    <button type="submit">Submit</button>
                </form>

                {prediction && <h2>Prediction: {prediction}</h2>}

                {explanation.length > 0 && (
                    <div>
                        <h3>Feature Contributions (SHAP Explanation):</h3>
                        <ul>
                            {explanation.map((item, index) => (
                                <li key={index}>{item}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </section>
        )}




              {activePage === 'find-doctors' && (
                  <section id="find-doctors" className="page active">
                    
                      <div className="search-container">
                          <input type="text" id="stateInput" placeholder="Enter your state..." onInput={handleStateInput} />
                          <ul className="suggestions-list">
                              {suggestions.map((state, index) => (
                                  <li key={index} onClick={() => handleStateSelect(state)}>{state}</li>
                              ))}
                          </ul>
                      </div>
                      {citySearchVisible && (
                          <div className="search-container">
                              <input type="text" id="cityInput" placeholder="Enter your city..." onInput={handleCityInput} />
                              <ul className="suggestions-list">
                                  {citySuggestions.map((city, index) => (
                                      <li key={index}>{city}</li>
                                  ))}
                              </ul>
                          </div>
                      )}
                       {/* Map Container */}
                       <div ref={mapContainer} style={{ height: '500px', width: '100%' }}></div>
                  </section>
              )}

              {activePage === 'video-consult' && (
                  <section id="video-consult" className="page active">
                      <div className="anview-logo">
                      <div className="header">
                            <h1 className="animatedd-text">Free Video Consultation</h1>
                        
        <p className="empowering-text animated-text">Talk to Expert Doctors</p>
        <div className="lottie-container">
        <Lottie
    animationData={animationData}
    loop={true}
    style={{ height: 300, width: 300 }}
/>
            </div>
        
                            
                        </div>
                        <div className="features-section">
                    <h2>What you get:</h2>
                    <div className="features-container">
                        <div className="feature-card">
                            <img src="https://i.postimg.cc/HkWjk6Ym/ashkan-forouzani-DPEPYPBZp-B8-unsplash.jpg" alt="Doctor Consultation" />
                            <h3>Unlimited conversations with doctors</h3>
                            <p>
                                Chat with board-certified doctors until you're satisfied. About any health issue—from diabetes to mental health, and everything in between.
                            </p>
                        </div>
                        <div className="feature-card">
                            <img src="https://i.postimg.cc/C1B1RVh8/national-cancer-institute-odgg-KTy-A5o0-unsplash.jpg" alt="All areas of medicine" />
                            <h3>Across all areas of medicine</h3>
                            <p>
                                We know life can be hard. So we try to make it simple: no forms or outrageous fees, no appointments that take weeks to book.
                            </p>
                        </div>
                        <div className="feature-card">
                            <img src="https://i.postimg.cc/m2xcFhFg/pexels-shkrabaanthony-5214997.jpg" alt="Family" />
                            <h3>For you and your family</h3>
                            <p>
                                Share your membership in order to get the most bang for your buck and keep the entire family cared for.
                            </p>
                        </div>
                        <div className="feature-card">
                            <img src="https://i.postimg.cc/TPH12P6G/piron-guillaume-U4-Fy-Cp3-Kz-Y-unsplash.jpg" alt="At any hour" />
                            <h3>At any hour</h3>
                            <p>
                                A team of doctors is standing by around the clock so you can stop any health issue quickly and effectively.
                            </p>
                        </div>
                    </div>
                </div>
                            
                      
                      
                       
                    </div>
                    <div className="consult-button-container">
        <button className="consult-now-button" onClick={openConsultationForm}>Consult Now</button>
    </div>
                    
    <div id="consultForm" className="modals">
  <form id="videoConsultForm" onSubmit={handleVideoConsultSubmit}>
    <label>First Name: <input type="text" name="firstName" required /></label>
    <label>Last Name: <input type="text" name="lastName" required /></label>
    <label>Contact No: <input type="tel" name="contactNo" required /></label>
    <label>Health Issue: <textarea name="healthIssue" required /></label>
    <label>Select Date: <input type="date" name="consultDate" required /></label>
    <label>Callback Time:
      <select name="callbackTime" required>
        <option value="">Select Time</option>
        <option value="10:00 AM">10:00 AM</option>
        <option value="11:00 AM">11:00 AM</option>
        <option value="12:00 PM">12:00 PM</option>
        <option value="1:00 PM">1:00 PM</option>
        <option value="2:00 PM">2:00 PM</option>
        <option value="3:00 PM">3:00 PM</option>
        <option value="4:00 PM">4:00 PM</option>
        <option value="5:00 PM">5:00 PM</option>
        <option value="6:00 PM">6:00 PM</option>
        <option value="7:00 PM">7:00 PM</option>
        <option value="8:00 PM">8:00 PM</option>
      </select>
    </label>
    <button type="submit">Submit</button>
    <button type="button" onClick={() => document.getElementById('consultForm').style.display = 'none'}>Close</button>
  </form>
</div>

                    <p id="callbackMessage">{callbackMessage}</p>
                </section>
                )}

{activePage === 'about' && (
  <section id="about" className="page active">
    <h2>About Us</h2>
    <p className="vision-text">
      Our mission is to empower women with knowledge and tools to prevent breast cancer. We aim to make a meaningful difference in women's lives through innovation, research, and community support.
    </p>
    
    <section className="vision-section">
      <h2>Our Vision</h2>
      <div className="vision-content">
        <img
          src="https://i.postimg.cc/cLTr163T/pexels-krivitskiy-1156546.jpg" // Replace with a relevant image link
          alt="Vision"
          className="vision-image animatedd-text"
        />
        <p className="vision-text">
          We envision a world where breast cancer is preventable. By utilizing advanced technology and fostering awareness, we strive to reduce breast cancer cases and ensure early detection for better outcomes.At our core, we are driven by the dream of a world where breast cancer is no longer a life-threatening concern. We believe in harnessing the power of technology, education, and community awareness to create a safer and healthier future for women everywhere.  Our approach combines cutting-edge Machine Learning tools for early detection with a robust platform for spreading awareness about prevention strategies.
        </p>
        
      </div>
      
      
      <p className="vision-text">
        Together, we envision a global movement where knowledge and proactive care eliminate fear and stigma surrounding breast cancer. We are committed to being a catalyst for this change, making early detection and prevention a reality for millions of women.
      </p>
    </section>
    <h2>About Our Mentor :</h2>
    <section className="feature-carddd">
    <img src="https://i.postimg.cc/9FgBYz9k/Screenshot-2024-11-18-001455.png" alt="Doctor Consultation" />
      
      <p className="vision-text">
        <strong>Dr. Abhishek Bandyopadhyay</strong>, the Head of the Department of AI & ML at Asansol Engineering College, has been an Assistant Professor in the Department of Computer Science and Engineering since October 1, 2012. His research focuses on Optical WDM Networks, Routing and Wavelength Assignment, and Survivable Traffic Grooming.
      </p>
      <ul className="vision-text">
        <li>Published extensively in indexed journals and Multiple conference publications presented at IEEE and Springer events:ICACNI 2015, ICACCI 2014.</li>
        <li>Member of Computer Society of India (CSI) : A prestigious organization promoting the growth and application of information technology in India.</li>
        <li>Life Member of the Institution of Engineers (India): contributing to the engineering advancements and professional excellence across disciplines.</li>
      </ul>
    </section>
    <h2>Meet the team :</h2>
    <div className="features-container">
        
                        <div className="feature-cardd">
                            <img src="https://i.postimg.cc/sDmhXbKm/amit.jpg" alt="Doctor Consultation" />
                            <h3>Amit Kiran Deb</h3>
                            <p>
                                Web Application Penetration tester and Application Security Enthusiast 
                            </p>
                        </div>
                        <div className="feature-cardd">
                            <img src="https://i.postimg.cc/GtfmNBDS/anki.jpg" alt="All areas of medicine" />
                            <h3>Ankita Banerjee</h3>
                            <p>
                                Machine Learning Enthusiast
                            </p>
                        </div>
                        <div className="feature-cardd">
                            <img src="https://i.postimg.cc/wTrqTdnD/anin.jpg" alt="Family" />
                            <h3>Anindita Sircar</h3>
                            <p>
                               Back-End Developer
                            </p>
                        </div>
                        <div className="feature-cardd">
                            <img src="https://i.postimg.cc/bwFS0b72/ani.jpg" alt="At any hour" />
                            <h3>Aniket Das</h3>
                            <p>
                               Front-End Developer
                            </p>
                        </div>
                    </div>
  </section>
)}

{/*{activePage === 'create-account' && (
                    <section id="create-account" className="page active">
                        <h2>Create Account</h2>
                        <form onSubmit={handleCreateAccountSubmit}>
                            <label>
                                Username:
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    required
                                />
                            </label>
                            <label>
                                Email:
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </label>
                            <label>
                                Password:
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                            </label>
                            <button type="submit">Create Account</button>
                        </form>
                        {errorMessage && <p className="error-message">{errorMessage}</p>}
                    </section>
                )}


{activePage === 'login' && (
          <section id="login" className="page active">
            {!user ? (
              <section className="login-section">
                <h2>Login</h2>
                <button onClick={handleLogin} className="login-button">
                  Sign in with Google
                </button>
              </section>
            ) : (
              <section className="user-section">
                <h2>Welcome, {user.displayName}!</h2>
                <p>Email: {user.email}</p>
                <button onClick={handleLogout} className="logout-button">
                  Logout
                </button>
              </section>
            )}
          </section>
        )}*/}
        {/* Avatar Section */}
        {user && user.photoURL && (
  <div className="avatar-container">
    <img
      src={user.photoURL || "default-avatar.png"} // Replace with a placeholder URL if no avatar
      alt="User Avatar"
      className="avatar"
      onClick={toggleDropdown}
    />
    {isDropdownVisible && (
      <div className="user-info-dropdown">
        <p><strong>Name:</strong> {user.displayName}</p>
        <p><strong>Email:</strong> {user.email}</p>
        {/* Add more user information if needed */}
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>
    )}
  </div>
)}

 
 

            </main>
            
        </div>
    );
};

export default App;
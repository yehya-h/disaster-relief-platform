// Load user's reports to show which incidents they've already voted onimport React, 
import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  StyleSheet,
  ScrollView,
  Modal,
  Dimensions,
} from 'react-native';
import { useSelector } from 'react-redux';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { getMoreIncidents, getIncidentReportsByReporterId, submitVote } from '../api/incidentApi';
import { getCountryNameFromCoords } from '../services/geocoding/geocodingService';
import { formatRelativeTime } from '../utils/formatRelativeTime';

// import colors from '../constants/colors';
import { useTheme } from '../hooks/useThem';


const { width: screenWidth } = Dimensions.get('window');

export default function Posts() {
  const { colors, isDarkMode } = useTheme(); 

const ImageSlider = ({ images, onImagePress }) => {
  const [index, setIndex] = useState(0);

  if (!images.length) return null;

  return (
    <View style={styles.imageSliderContainer}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={event => {
          const slideIndex = Math.round(
            event.nativeEvent.contentOffset.x /
              event.nativeEvent.layoutMeasurement.width,
          );
          setIndex(slideIndex);
        }}
        scrollEventThrottle={16}
      >
        {images.map((image, idx) => (
          <TouchableOpacity key={idx} onPress={() => onImagePress(image)}>
            <Image source={{ uri: image }} style={styles.sliderImage} />
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={styles.sliderControls}>
        <TouchableOpacity
          style={[styles.sliderButton, { opacity: index === 0 ? 0.3 : 1 }]}
          onPress={() => {
            if (index > 0) setIndex(index - 1);
          }}
          disabled={index === 0}
        >
          <MaterialCommunityIcons
            name="chevron-left"
            size={24}
            color={colors.textColor}
          />
        </TouchableOpacity>

        <View style={styles.sliderIndicator}>
          <Text style={styles.sliderIndicatorText}>
            {index + 1} / {images.length}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.sliderButton,
            { opacity: index === images.length - 1 ? 0.3 : 1 },
          ]}
          onPress={() => {
            if (index < images.length - 1) setIndex(index + 1);
          }}
          disabled={index === images.length - 1}
        >
          <MaterialCommunityIcons
            name="chevron-right"
            size={24}
            color={colors.textColor}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.blueGray,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reportsText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '400',
  },
  lastUpdatedText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '400',
  },
  card: {
    backgroundColor: colors.darkestBlueGray,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    borderRadius: 8,
    marginBottom: 15,
  },
  imageSliderContainer: {
    marginBottom: 15,
    position: 'relative',
  },
  sliderImage: {
    width: screenWidth - 80, // Full width minus padding
    height: 200,
    resizeMode: 'cover',
    borderRadius: 8,
  },
  sliderControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 8,
  },
  sliderButton: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    minWidth: 40,
    alignItems: 'center',
  },
  sliderIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderIndicatorText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationIcon: {
    marginRight: 8,
  },
  locationText: {
    flex: 1,
    fontSize: 16,
    color: colors.textColor,
    fontWeight: '400',
  },
  descriptionText: {
    fontSize: 16,
    color: colors.textColor,
    fontWeight: '400',
    textAlign: 'justify',
    marginBottom: 16,
    lineHeight: 22,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  votingSection: {
    flex: 1,
  },
  voteCount: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'flex-end',
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginLeft: 8,
    alignItems: 'center',
    borderRadius: 6,
    minWidth: 60,
    borderWidth: 1,
  },
  realButton: {
    borderColor: colors.green,
    backgroundColor: 'transparent',
  },
  fakeButton: {
    borderColor: colors.orange,
    backgroundColor: 'transparent',
  },
  realButtonPressed: {
    borderColor: colors.green,
    backgroundColor: colors.green,
  },
  fakeButtonPressed: {
    borderColor: colors.orange,
    backgroundColor: colors.orange,
  },
  realButtonText: {
    color: colors.green,
    fontSize: 14,
    fontWeight: '500',
  },
  fakeButtonText: {
    color: colors.orange,
    fontSize: 14,
    fontWeight: '500',
  },
  realButtonTextPressed: {
    color: colors.textColor,
    fontSize: 14,
    fontWeight: '500',
  },
  fakeButtonTextPressed: {
    color: colors.textColor,
    fontSize: 14,
    fontWeight: '600',
  },
  footerContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.textColor,
    fontWeight: '500',
  },
  viewMoreButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  viewMoreText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
  },
  errorText: {
    color: colors.orange,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 16,
    textAlign: 'center',
  },
  // Modal styles for image viewing
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: '90%',
    height: '80%',
    maxWidth: screenWidth * 0.9,
    maxHeight: '80%',
  },
});

  const [posts, setPosts] = useState([]);
  const [chunk, setChunk] = useState(1);
  const [totalChunks, setTotalChunks] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [pressedButton, setPressedButton] = useState({});
  const [userReports, setUserReports] = useState([]); // Track user's reports
  const [locationNames, setLocationNames] = useState({}); // Cache for location names
  const userId = useSelector(state => state.user.userId);
  const userRole = useSelector(state => state.user.role);

  // Function to get location name for a post
  const getLocationName = useCallback(async (postId, coordinates) => {
    // Check if we already have the location name cached
    if (locationNames[postId]) {
      return locationNames[postId];
    }

    try {
      const locationName = await getCountryNameFromCoords(
        coordinates[1], // lat
        coordinates[0]  // lon
      );
      
      // Cache the result
      setLocationNames(prev => ({
        ...prev,
        [postId]: locationName
      }));
      
      return locationName;
    } catch (error) {
      console.error('Error getting location name:', error);
      const fallbackName = 'Unknown Location';
      setLocationNames(prev => ({
        ...prev,
        [postId]: fallbackName
      }));
      return fallbackName;
    }
  }, [locationNames]);

  const loadUserReports = useCallback(async () => {
    // Don't load reports for guest users
    if (userRole === undefined || userRole === null || userRole === 1) return;
    
    try {
      const reports = await getIncidentReportsByReporterId(userId);
      // console.log('User reports loaded:', reports);
      setUserReports(reports);
    } catch (err) {
      console.error('Error loading user reports:', err);
    }
  }, [userId]);

  const loadIncidents = useCallback(async chunkNum => {
    setLoading(true);
    setError(null);

    try {
      const { incidents, formsByIncident, totalchunks } =
        await getMoreIncidents(chunkNum);

      const merged = incidents.map(incident => {
        const forms = formsByIncident[incident._id] || [];

        const images = forms.map(f => f?.imageUrl).filter(Boolean);
        const sortedForms = [...forms].sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp),
        );

        const latestForm = sortedForms[0];
        const firstForm = sortedForms[sortedForms.length - 1];

        return {
          id: incident._id,
          images,
          numReports: forms.length,
          lastUpdated: latestForm?.timestamp,
          location: firstForm?.location,
          description: firstForm?.description,
          // Add the virtual counts
          fakeReportsCount: incident.fakeReportsCount || 0,
          confirmationCount: incident.confirmationCount || 0,
        };
      });

      setPosts(prev => {
        const existingIds = new Set(prev.map(p => p.id));
        const newPosts = merged.filter(p => !existingIds.has(p.id));
        const updatedPosts = [...prev, ...newPosts];
        
        // Trigger location name fetching for new posts
        newPosts.forEach(post => {
          if (post.location?.coordinates) {
            getLocationName(post.id, post.location.coordinates);
          }
        });
        
        return updatedPosts;
      });

      setTotalChunks(totalchunks);
    } catch (err) {
      console.error('Error loading incidents', err);
      setError('Failed to load incidents.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadIncidents(chunk);
    loadUserReports();
  }, [chunk, loadIncidents, loadUserReports]);

  const handleViewMore = () => {
    if (chunk < totalChunks && !loading) {
      setChunk(prev => prev + 1);
    }
  };

  const handleImagePress = image => {
    setSelectedImage(image);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  // Check if user has already voted on this incident
  const getUserVoteForIncident = (incidentId) => {
    const userVote = userReports.find(report => 
      report.incidentId === incidentId
    );
    return userVote?.reportType || null;
  };

  const handleButtonPress = async (postId, buttonType) => {
    const existingVote = getUserVoteForIncident(postId);
    
    // If user already voted with the same type, don't allow voting again
    if (existingVote === buttonType) {
      return;
    }

    // Update the pressed button state
    setPressedButton(prev => ({
      ...prev,
      [`${postId}-${buttonType}`]: true,
      // Clear the opposite button if it was pressed
      [`${postId}-${buttonType === 'real' ? 'fake' : 'real'}`]: false,
    }));

    try {
      // Make an API call to submit the vote
      await submitVote(postId, buttonType === 'real' ? 'confirmed' : 'fake');
      
      // Update local state to reflect the new vote
      const reportType = buttonType === 'real' ? 'confirmed' : 'fake';
      
      // Add to user reports
      setUserReports(prev => {
        // Remove any existing vote for this incident
        const filtered = prev.filter(report => report.incidentId !== postId);
        return [...filtered, { incidentId: postId, reportType, reporterId: userId }];
      });

      // Update the post counts locally
      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          const updatedPost = { ...post };
          
          // If user had a previous vote, decrement that count
          if (existingVote === 'confirmed') {
            updatedPost.confirmationCount = Math.max(0, updatedPost.confirmationCount - 1);
          } else if (existingVote === 'fake') {
            updatedPost.fakeReportsCount = Math.max(0, updatedPost.fakeReportsCount - 1);
          }
          
          // Increment the new vote count
          if (buttonType === 'real') {
            updatedPost.confirmationCount += 1;
          } else {
            updatedPost.fakeReportsCount += 1;
          }
          
          return updatedPost;
        }
        return post;
      }));

    } catch (error) {
      console.error('Error submitting vote:', error);
      // Revert the button state on error
      setPressedButton(prev => ({
        ...prev,
        [`${postId}-${buttonType}`]: false,
      }));
    }
  };

  const renderItem = ({ item: post }) => {
    const userVote = getUserVoteForIncident(post.id);
    
    return (
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.reportsText}>
            {post.numReports} {post.numReports === 1 ? 'report' : 'reports'}
          </Text>
          <Text style={styles.lastUpdatedText}>
            {formatRelativeTime(post.lastUpdated)}
          </Text>
        </View>

        {post.images.length === 1 ? (
          <TouchableOpacity onPress={() => handleImagePress(post.images[0])}>
            <Image source={{ uri: post.images[0] }} style={styles.image} />
          </TouchableOpacity>
        ) : post.images.length > 1 ? (
          <ImageSlider images={post.images} onImagePress={handleImagePress} />
        ) : null}

        <View style={styles.locationRow}>
          <MaterialCommunityIcons
            name="map-marker-radius-outline"
            size={18}
            color={colors.orange}
            style={styles.locationIcon}
          />
          <Text style={styles.locationText}>
            {locationNames[post.id] || 'Loading location...'}
          </Text>
        </View>

        <Text style={styles.descriptionText}>{post.description}</Text>

        <View style={styles.buttonRow}>
          <View style={styles.votingSection}>
            <Text style={styles.voteCount}>{post.confirmationCount} Real</Text>
            <Text style={styles.voteCount}>{post.fakeReportsCount} Fake</Text>
          </View>
          {/* Only show voting buttons if user is not guest (userRole !== 1) */}
          {userRole !== 1 && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  userVote === 'confirmed' || pressedButton[`${post.id}-real`]
                    ? styles.realButtonPressed
                    : styles.realButton,
                ]}
                onPress={() => handleButtonPress(post.id, 'real')}
                disabled={userVote === 'confirmed'}
              >
                <Text
                  style={[
                    userVote === 'confirmed' || pressedButton[`${post.id}-real`]
                      ? styles.realButtonTextPressed
                      : styles.realButtonText,
                  ]}
                >
                  Real
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  userVote === 'fake' || pressedButton[`${post.id}-fake`]
                    ? styles.fakeButtonPressed
                    : styles.fakeButton,
                ]}
                onPress={() => handleButtonPress(post.id, 'fake')}
                disabled={userVote === 'fake'}
              >
                <Text
                  style={[
                    userVote === 'fake' || pressedButton[`${post.id}-fake`]
                      ? styles.fakeButtonTextPressed
                      : styles.fakeButtonText,
                  ]}
                >
                  Fake
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {error && <Text style={styles.errorText}>{error}</Text>}

      <FlatList
        data={posts}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.scrollContainer}
        ListFooterComponent={
          <View style={styles.footerContainer}>
            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.orange} />
                <Text style={styles.loadingText}>Loading posts...</Text>
              </View>
            )}
            {!loading && chunk < totalChunks && (
              <TouchableOpacity
                onPress={handleViewMore}
                style={styles.viewMoreButton}
              >
                <Text style={styles.viewMoreText}>View More</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />

      <Modal
        visible={!!selectedImage}
        transparent={true}
        animationType="fade"
        onRequestClose={closeImageModal}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalOverlay}
            onPress={closeImageModal}
          >
            <Image
              source={{ uri: selectedImage }}
              style={styles.modalImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

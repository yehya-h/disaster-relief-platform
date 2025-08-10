import React, { useEffect, useState, useCallback } from 'react';
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
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { getMoreIncidents } from '../api/incidentApi';
import { formatRelativeTime } from '../utils/formatRelativeTime';

import Colors from '../constants/colors';

const { width: screenWidth } = Dimensions.get('window');

export default function Posts() {
  const [posts, setPosts] = useState([]);
  const [chunk, setChunk] = useState(1);
  const [totalChunks, setTotalChunks] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [pressedButton, setPressedButton] = useState({});

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
        };
      });

      setPosts(prev => {
        const existingIds = new Set(prev.map(p => p.id));
        const newPosts = merged.filter(p => !existingIds.has(p.id));
        return [...prev, ...newPosts];
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
  }, [chunk, loadIncidents]);

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

  const handleButtonPress = (postId, buttonType) => {
    setPressedButton(prev => ({
      ...prev,
      [`${postId}-${buttonType}`]: !prev[`${postId}-${buttonType}`],
    }));
  };

  const renderItem = ({ item: post }) => (
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
          color={Colors.orange}
          style={styles.locationIcon}
        />
        <Text style={styles.locationText}>{JSON.stringify(post.location)}</Text>
      </View>

      <Text style={styles.descriptionText}>{post.description}</Text>

      <View style={styles.buttonRow}>
        <View style={styles.votingSection}>
          <Text style={styles.voteCount}>4 Real</Text>
          <Text style={styles.voteCount}>6 Fake</Text>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              pressedButton[`${post.id}-real`]
                ? styles.realButtonPressed
                : styles.realButton,
            ]}
            onPress={() => handleButtonPress(post.id, 'real')}
          >
            <Text
              style={[
                pressedButton[`${post.id}-real`]
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
              pressedButton[`${post.id}-fake`]
                ? styles.fakeButtonPressed
                : styles.fakeButton,
            ]}
            onPress={() => handleButtonPress(post.id, 'fake')}
          >
            <Text
              style={[
                pressedButton[`${post.id}-fake`]
                  ? styles.fakeButtonTextPressed
                  : styles.fakeButtonText,
              ]}
            >
              Fake
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

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
                <ActivityIndicator size="large" color={Colors.orange} />
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
            color={Colors.textColor}
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
            color={Colors.textColor}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.blueGray,
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
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '400',
  },
  lastUpdatedText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '400',
  },
  card: {
    backgroundColor: '#2a2d3a', // Brighter background color
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
    color: Colors.textSecondary,
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
    color: Colors.textColor,
    fontWeight: '400',
  },
  descriptionText: {
    fontSize: 16,
    color: Colors.textColor,
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
    color: Colors.textSecondary,
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
    borderColor: Colors.green,
    backgroundColor: 'transparent',
  },
  fakeButton: {
    borderColor: Colors.orange,
    backgroundColor: 'transparent',
  },
  realButtonPressed: {
    borderColor: Colors.green,
    backgroundColor: Colors.green,
  },
  fakeButtonPressed: {
    borderColor: Colors.orange,
    backgroundColor: Colors.orange,
  },
  realButtonText: {
    color: Colors.green,
    fontSize: 14,
    fontWeight: '500',
  },
  fakeButtonText: {
    color: Colors.orange,
    fontSize: 14,
    fontWeight: '500',
  },
  realButtonTextPressed: {
    color: Colors.textColor,
    fontSize: 14,
    fontWeight: '500',
  },
  fakeButtonTextPressed: {
    color: Colors.textColor,
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
    color: Colors.textColor,
    fontWeight: '500',
  },
  viewMoreButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  viewMoreText: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
  },
  errorText: {
    color: Colors.orange,
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

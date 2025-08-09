import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  Button,
  ActivityIndicator,
  FlatList,
  StyleSheet,
} from 'react-native';
import { getMoreIncidents } from '../api/incidentApi';
import { formatRelativeTime } from '../utils/formatRelativeTime';
// import { getCountryNameFromCoords } from '../services/geocoding/geocodingService';

// Utility: Date formatter
// const formatDate = timestamp => {
//   if (!timestamp) return 'N/A';
//   return new Date(timestamp).toLocaleString();
// };

export default function Posts() {
  const [posts, setPosts] = useState([]);
  const [chunk, setChunk] = useState(1);
  const [totalChunks, setTotalChunks] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const renderItem = ({ item: post }) => (
    <View style={styles.card}>
      <Text style={styles.metaText}>
        {/* {post.numReports} reports — Last updated: {formatDate(post.lastUpdated)} */}
        {post.numReports} reports — Last updated:{' '}
        {formatRelativeTime(post.lastUpdated)}
      </Text>

      {post.images.length === 1 ? (
        <Image source={{ uri: post.images[0] }} style={styles.image} />
      ) : (
        <ImageSlider images={post.images} />
      )}

      <Text style={styles.label}>
        <Text style={styles.bold}>Location: </Text>
        {JSON.stringify(post.location)}
      </Text>

      <Text style={styles.label}>
        <Text style={styles.bold}>Description: </Text>
        {post.description}
      </Text>

      <View style={styles.buttonRow}>
        <Button title="Real" color="#4CAF50" onPress={() => {}} />
        <Button title="Fake" color="#F44336" onPress={() => {}} />
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
        ListFooterComponent={
          <>
            {loading && <ActivityIndicator size="large" color="#0000ff" />}
            {!loading && chunk < totalChunks && (
              <Button title="View More" onPress={handleViewMore} />
            )}
          </>
        }
      />
    </View>
  );
}

const ImageSlider = ({ images }) => {
  const [index, setIndex] = useState(0);

  if (!images.length) return null;

  return (
    <View>
      <Image source={{ uri: images[index] }} style={styles.image} />
      <View style={styles.sliderNav}>
        {index > 0 && <Button title="←" onPress={() => setIndex(index - 1)} />}
        {index < images.length - 1 && (
          <Button title="→" onPress={() => setIndex(index + 1)} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
  },
  card: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 16,
    padding: 12,
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  metaText: {
    color: 'gray',
    marginBottom: 4,
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    borderRadius: 4,
  },
  label: {
    marginTop: 8,
  },
  bold: {
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  sliderNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
});

// import React, { useEffect, useState } from 'react';
// import { ScrollView, View, Text, Image, Button } from 'react-native';
// import { getMoreIncidents } from '../api/incidentApi';

// export default function Posts() {
//   const [posts, setPosts] = useState([]);
//   const [chunk, setChunk] = useState(1);
//   const [totalChunks, setTotalChunks] = useState(1);

//   useEffect(() => {
//     loadIncidents(chunk);
//   }, [chunk]);

//   const loadIncidents = async chunkNum => {
//     try {
//       const { incidents, formsByIncident, totalchunks } =
//         await getMoreIncidents(chunkNum);

//       const merged = incidents.map(incident => {
//         const forms = formsByIncident[incident._id] || [];
//         const images = forms.map(form => form?.imageUrl);
//         const sortedForms = forms.sort(
//           (a, b) => new Date(b.timestamp) - new Date(a.timestamp),
//         );

//         const latestForm = sortedForms[0];
//         const firstForm = sortedForms[sortedForms.length - 1];

//         return {
//           id: incident._id,
//           images: images || [],
//           numReports: forms.length,
//           lastUpdated: latestForm?.timestamp,
//           location: firstForm?.location,
//           description: firstForm?.description,
//         };
//       });

//       setPosts(prev => [...prev, ...merged]);
//       setTotalChunks(totalchunks);
//     } catch (error) {
//       console.error('Error loading incidents', error);
//     }
//   };

//   const handleViewMore = () => {
//     if (chunk < totalChunks) {
//       setChunk(prev => prev + 1);
//     }
//   };

//   return (
//     <ScrollView style={{ padding: 16 }}>
//       {posts.map(post => (
//         <View
//           key={post.id}
//           style={{
//             borderWidth: 1,
//             borderColor: '#ccc',
//             marginBottom: 16,
//             padding: 12,
//           }}
//         >
//           <Text style={{ color: 'gray', marginBottom: 4 }}>
//             {post.numReports} reports — Last updated:{' '}
//             {new Date(post.lastUpdated).toLocaleString()}
//           </Text>

//           {post.images.length === 1 ? (
//             <Image
//               source={{ uri: post.images[0] }}
//               style={{ width: '100%', height: 200, resizeMode: 'cover' }}
//             />
//           ) : (
//             <ImageSlider images={post.images} />
//           )}

//           <Text style={{ marginTop: 8 }}>
//             <Text style={{ fontWeight: 'bold' }}>Location: </Text>
//             {JSON.stringify(post.location)}
//           </Text>
//           <Text>
//             <Text style={{ fontWeight: 'bold' }}>Description: </Text>
//             {post.description}
//           </Text>

//           <View style={{ flexDirection: 'row', marginTop: 12 }}>
//             <Button title="Real" color="#4CAF50" onPress={() => {}} />
//             <Button title="Fake" color="#F44336" onPress={() => {}} />
//           </View>
//         </View>
//       ))}

//       {chunk < totalChunks && (
//         <Button title="View More" onPress={handleViewMore} />
//       )}
//     </ScrollView>
//   );
// }

// const ImageSlider = ({ images }) => {
//   const [index, setIndex] = useState(0);

//   return (
//     <View>
//       <Image
//         source={{ uri: images[index] }}
//         style={{ width: '100%', height: 200, resizeMode: 'cover' }}
//       />
//       <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
//         {index > 0 && <Button title="←" onPress={() => setIndex(index - 1)} />}
//         {index < images.length - 1 && (
//           <Button title="→" onPress={() => setIndex(index + 1)} />
//         )}
//       </View>
//     </View>
//   );
// };

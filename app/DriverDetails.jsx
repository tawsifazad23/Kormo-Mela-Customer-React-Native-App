import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, SafeAreaView, ActivityIndicator, Image, ScrollView, Alert, Button, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import YoutubePlayer from 'react-native-youtube-iframe';
import { LogBox } from 'react-native';
LogBox.ignoreLogs(['Warning: ...']); // Ignore log notification by message
LogBox.ignoreAllLogs();//Ignore all log notifications

const RequestDetails = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { requestId } = route.params;
  const [requestDetails, setRequestDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchRequestDetails = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        setErrorMessage('No token found. Please log in.');
        setLoading(false);
        return;
      }

      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/user/request-details/${requestId}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRequestDetails(data);
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message || 'Failed to fetch request details.');
      }
    } catch (error) {
      setErrorMessage('An error occurred. Please try again.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRequestDetails();
  }, []);

  const handleRetry = () => {
    setLoading(true);
    setErrorMessage('');
    fetchRequestDetails();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </SafeAreaView>
    );
  }

  if (errorMessage) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>{errorMessage}</Text>
        <Button title="Retry" onPress={handleRetry} />
      </SafeAreaView>
    );
  }

  if (!requestDetails) {
    return (
      <SafeAreaView style={styles.noDataContainer}>
        <Text style={styles.noDataText}>No request details found.</Text>
        <Button title="Retry" onPress={handleRetry} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Request Details</Text>
        </View>
        <Image
          source={{ uri: 'https://dummyimage.com/100x100/000/fff' }} // Replace with actual profile image URL
          style={styles.profileImage}
        />
        <Text style={styles.driverName}>
          {requestDetails.service_provider.first_name} {requestDetails.service_provider.last_name}
        </Text>
        <Text style={styles.driverRating}>Rating: {requestDetails.service_provider.rating || 'N/A'}</Text>
        <Text style={styles.driverDetails}>
          Years in Industry: {requestDetails.service_provider.years_in_industry}
        </Text>
        <Text style={styles.driverDetails}>
          Vehicle Type: {requestDetails.service_provider.vehicle_type}
        </Text>
        <Text style={styles.driverDetails}>
          App Verified Date: {new Date(requestDetails.service_provider.app_verified_date).toLocaleDateString()}
        </Text>
        <Text style={styles.sectionTitle}>Interview Video</Text>
        <View style={styles.videoContainer}>
          <YoutubePlayer
            height={200}
            play={false}
            videoId={'zpyzV4xgjYY'} // The video ID from the YouTube link
          />
        </View>
        <Text style={styles.sectionTitle}>Job Details</Text>
        <Text style={styles.jobDetail}>Job ID: {requestDetails.job_posting.id}</Text>
        <Text style={styles.jobDetail}>Service Type: {requestDetails.job_posting.service_type}</Text>
        <Text style={styles.jobDetail}>Service Period: {requestDetails.job_posting.service_period}</Text>
        <Text style={styles.jobDetail}>Service Rate: {requestDetails.job_posting.service_rate} Taka</Text>
        <Text style={styles.jobDetail}>Location: {requestDetails.job_posting.onboarding_location}</Text>
        <Text style={styles.jobDetail}>Job Summary: {requestDetails.job_posting.job_summary}</Text>
        <Text style={styles.jobDetail}>
          Requested On: {new Date(requestDetails.sent_request_time).toLocaleString()}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  container: {
    flexGrow: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 18,
    color: '#888',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    marginBottom: 20,
  },
  driverName: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  driverRating: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 10,
  },
  driverDetails: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 20,
    textAlign: 'center',
  },
  jobDetail: {
    fontSize: 18,
    marginBottom: 10,
  },
  videoContainer: {
    width: '100%',
    height: 200,
    marginBottom: 20,
  },
});

export default RequestDetails;

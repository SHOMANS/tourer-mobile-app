import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
// import DateTimePicker from '@react-native-community/datetimepicker';
import { useAppStore } from '../store/appStore';
import { Colors } from '../config/colors';

export default function BookingScreen({ route, navigation }: any) {
  const { packageId } = route.params;
  const {
    selectedPackage,
    packagesLoading,
    packagesError,
    fetchPackageById,
    createBooking,
    bookingsLoading,
    bookingsError,
    accessToken,
    logout,
  } = useAppStore();

  // Booking form state
  const [startDate, setStartDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [guests, setGuests] = useState(1);
  const [guestNames, setGuestNames] = useState(['']);
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (packageId) {
      fetchPackageById(packageId);
    }
  }, [packageId]);

  useEffect(() => {
    // Initialize guest names array when guests count changes
    const newGuestNames = Array(guests).fill('').map((_, index) =>
      guestNames[index] || ''
    );
    setGuestNames(newGuestNames);
  }, [guests]);

  const handleDateChange = (dateString: string) => {
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      setStartDate(date);
    }
  };

  const handleGuestNameChange = (index: number, name: string) => {
    const updatedNames = [...guestNames];
    updatedNames[index] = name;
    setGuestNames(updatedNames);
  };

  const calculateTotalPrice = () => {
    if (!selectedPackage) return 0;
    return parseFloat(selectedPackage.price.toString()) * guests;
  };

  const calculateEndDate = () => {
    if (!selectedPackage) return null;
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + selectedPackage.duration - 1);
    return endDate;
  };

  const handleBooking = async () => {
    if (!accessToken) {
      Alert.alert(
        'Login Required',
        'Please log in to book this tour.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => logout() }
        ]
      );
      return;
    }

    // Validation
    const emptyNames = guestNames.filter(name => !name.trim());
    if (emptyNames.length > 0) {
      Alert.alert('Error', 'Please provide names for all guests.');
      return;
    }

    if (!contactEmail.trim()) {
      Alert.alert('Error', 'Please provide a contact email.');
      return;
    }

    try {
      const bookingData = {
        packageId,
        startDate: startDate.toISOString(),
        endDate: calculateEndDate()?.toISOString(),
        guests,
        guestNames: guestNames.filter(name => name.trim()),
        contactInfo: {
          email: contactEmail,
          phone: contactPhone,
          specialRequests: specialRequests,
        },
        notes,
        totalPrice: calculateTotalPrice(),
        currency: selectedPackage?.currency || 'USD',
      };

      await createBooking(bookingData);

      Alert.alert(
        'Booking Confirmed!',
        'Your booking has been submitted successfully. You will receive a confirmation email shortly.',
        [
          {
            text: 'View Booking',
            onPress: () => navigation.navigate('MyBookings')
          },
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      Alert.alert(
        'Booking Failed',
        'Sorry, we couldn\'t process your booking. Please try again.'
      );
    }
  };

  if (packagesLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading tour details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (packagesError || !selectedPackage) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {packagesError || 'Tour not found'}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Book Your Tour</Text>
        </View>

        {/* Tour Summary */}
        <View style={styles.tourSummary}>
          <Text style={styles.tourTitle}>{selectedPackage.title}</Text>
          <Text style={styles.tourLocation}>📍 {selectedPackage.locationName}</Text>
          <Text style={styles.tourDuration}>⏱️ {selectedPackage.duration} days</Text>
          <Text style={styles.tourPrice}>${selectedPackage.price} per person</Text>
        </View>

        {/* Booking Form */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Booking Details</Text>

          {/* Start Date */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tour Start Date</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={startDate.toISOString().split('T')[0]}
              onChangeText={handleDateChange}
            />
          </View>

          {/* End Date Display */}
          {calculateEndDate() && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tour End Date</Text>
              <Text style={styles.endDateText}>
                {calculateEndDate()?.toLocaleDateString()}
              </Text>
            </View>
          )}

          {/* Number of Guests */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Number of Guests</Text>
            <View style={styles.guestsSelector}>
              <TouchableOpacity
                style={[styles.guestButton, guests <= 1 && styles.guestButtonDisabled]}
                onPress={() => setGuests(Math.max(1, guests - 1))}
                disabled={guests <= 1}
              >
                <Text style={styles.guestButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.guestsCount}>{guests}</Text>
              <TouchableOpacity
                style={[styles.guestButton, guests >= (selectedPackage.maxGuests || 10) && styles.guestButtonDisabled]}
                onPress={() => setGuests(Math.min(selectedPackage.maxGuests || 10, guests + 1))}
                disabled={guests >= (selectedPackage.maxGuests || 10)}
              >
                <Text style={styles.guestButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Guest Names */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Guest Names</Text>
            {guestNames.map((name, index) => (
              <TextInput
                key={index}
                style={styles.input}
                placeholder={`Guest ${index + 1} Name`}
                value={name}
                onChangeText={(text) => handleGuestNameChange(index, text)}
              />
            ))}
          </View>

          {/* Contact Information */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contact Email *</Text>
            <TextInput
              style={styles.input}
              placeholder="your@email.com"
              value={contactEmail}
              onChangeText={setContactEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contact Phone</Text>
            <TextInput
              style={styles.input}
              placeholder="+1 234 567 8900"
              value={contactPhone}
              onChangeText={setContactPhone}
              keyboardType="phone-pad"
            />
          </View>

          {/* Special Requests */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Special Requests</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Dietary restrictions, accessibility needs, etc."
              value={specialRequests}
              onChangeText={setSpecialRequests}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Additional Notes */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Additional Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Any additional information..."
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />
          </View>
        </View>
      </ScrollView>

      {/* Fixed Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.priceContainer}>
          <Text style={styles.totalLabel}>Total Price:</Text>
          <Text style={styles.totalPrice}>${calculateTotalPrice().toFixed(2)}</Text>
        </View>

        <TouchableOpacity
          style={[styles.bookButton, bookingsLoading && styles.bookButtonDisabled]}
          onPress={handleBooking}
          disabled={bookingsLoading}
        >
          {bookingsLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.bookButtonText}>Confirm Booking</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 16,
  },
  tourSummary: {
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tourTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  tourLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  tourDuration: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  tourPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  formSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: 'white',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
  },
  endDateText: {
    fontSize: 16,
    color: '#666',
    padding: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  guestsSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 8,
  },
  guestButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guestButtonDisabled: {
    backgroundColor: '#ccc',
  },
  guestButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  guestsCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 20,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: 'white',
  },
  priceContainer: {
    flex: 1,
  },
  totalLabel: {
    fontSize: 14,
    color: '#666',
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  bookButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  bookButtonDisabled: {
    backgroundColor: '#ccc',
  },
  bookButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
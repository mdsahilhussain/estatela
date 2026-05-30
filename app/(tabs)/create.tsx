import { MAX_PRICE, MIN_PRICE, TYPES_LIST } from '@/constants/data';
import { icons } from '@/constants/icons';
import { useSupabase } from '@/hooks/useSupabase';
import clsx from 'clsx';
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useRouter } from 'expo-router';
import { styled } from 'nativewind';
import { useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const INITIAL_FORM: FormState = {
  title: "",
  description: "",
  price: "",
  type: "apartment",
  bedrooms: 1,
  bathrooms: 1,
  areaSqft: "",
  address: "",
  city: "",
  latitude: "",
  longitude: "",
  isFeatured: false,
  images: [],
  localImages: [],
};

export default function CreateScreen() {
  const router = useRouter();
  const authSupabase = useSupabase();

  // Local state for form data
  const [form, setForm] = useState<FormState>(INITIAL_FORM);

  // State for handling loading states
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [uploadingImages, setUploadingImages] = useState<boolean>(false);
  const [detectingLocation, setDetectingLocation] = useState<boolean>(false);

  // Generic handler for form input changes
  const handleInputChange = (fields: Partial<FormState>) =>
    setForm((prev) => ({ ...prev, ...fields }));

  // Handler to remove an image from the form
  const handleRemoveImage = (index: number) => {
    handleInputChange({
      images: form.images.filter((_, i) => i !== index),
      localImages: form.localImages.filter((_, i) => i !== index),
    });
  }

  // Image picking and uploading logic
  const handlePickImages = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission Required",
        "Please allow access to your photo library."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsMultipleSelection: true,
      quality: 0.7,
      base64: true,
      selectionLimit: 6,
    });

    if (result.canceled) return;

    setUploadingImages(true);

    const uploadedUrls: string[] = [];
    const previewUris: string[] = [];

    for (const asset of result.assets) {
      try {
        const filename = `property_${Date.now()}_${Math.random()
          .toString(36)
          .slice(2)}.jpg`;

        const base64 = asset.base64!;
        const buffer = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

        const { error } = await authSupabase.storage
          .from("property-images")
          .upload(filename, buffer, {
            contentType: "image/jpeg",
            upsert: false,
          });

        if (error) throw error;

        const { data: urlData } = authSupabase.storage
          .from("property-images")
          .getPublicUrl(filename);

        uploadedUrls.push(urlData.publicUrl);
        previewUris.push(asset.uri);
      } catch (err) {
        console.error("Upload error:", err);
        Alert.alert("Upload Failed", "One or more images failed to upload.");
      }
    }

    handleInputChange({
      images: [...form.images, ...uploadedUrls],
      localImages: [...form.localImages, ...previewUris],
    });
    setUploadingImages(false);
  };

  // Location detection logic
  const handleDetectLocation = async () => {
    setDetectingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "Please allow location access to detect coordinates.");
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      handleInputChange({
        latitude: location.coords.latitude.toString(),
        longitude: location.coords.longitude.toString(),
      });
    } catch (error) {
      console.error("Location error:", error);
      Alert.alert("Error", "Failed to detect location. Please try again.");
    } finally {
      setDetectingLocation(false);
    }
  }

  // Form submission logic with validation
  const handleSubmit = async () => {
    if (!form.title.trim())
      return Alert.alert("Validation Error", "Title is required.");

    if (!form.price.trim())
      return Alert.alert("Validation Error", "Price is required.");

    const priceValue = Number(form.price);
    if (isNaN(priceValue) || priceValue < MIN_PRICE)
      return Alert.alert("Validation Error", `Price must be a number greater than ₹${MIN_PRICE}.`);
    if (priceValue > MAX_PRICE)
      return Alert.alert("Validation Error", `Price cannot exceed ₹${MAX_PRICE.toLocaleString('en-IN')}.`);

    if (!form.address.trim())
      return Alert.alert("Validation Error", "Address is required.");

    if (!form.city.trim())
      return Alert.alert("Validation Error", "City is required.");

    if (form.images.length === 0)
      return Alert.alert("Validation Error", "At least one photo is required.");

    setSubmitting(true);

    const { error } = await authSupabase.from("properties").insert({
      title: form.title.trim(),
      description: form.description.trim(),
      price: priceValue,
      type: form.type,
      bedrooms: form.bedrooms,
      bathrooms: form.bathrooms,
      area_sqft: form.areaSqft ? Number(form.areaSqft) : null,
      address: form.address.trim(),
      city: form.city.trim(),
      latitude: form.latitude ? Number(form.latitude) : null,
      longitude: form.longitude ? Number(form.longitude) : null,
      is_featured: form.isFeatured,
      images: form.images,
    });

    setSubmitting(false);

    if (error) {
      Alert.alert("Submission Failed", "Failed to create property. Please try again.");
      console.error("Submission error:", error);
      return;
    }

    setForm(INITIAL_FORM);
    Alert.alert("Success", "Property created successfully!", [
      {
        text: "OK",
        onPress: () => router.replace("/(tabs)"),
      },
    ]);
  }

  // helper ui components 
  const Counter = ({ label, value, onChange }: { label: string; value: number; onChange: (newValue: number) => void }) => (
    <View className='flex-1'>
      <Text className='create-property-section-title'>{label}</Text>
      <View className='flex-row items-center overflow-hidden gap-1'>
        <Pressable className='p-2.5 rounded-full bg-foreground size-9' onPress={() => onChange(value - 1)} disabled={value <= 1}>
          <Image source={icons.remove} className='w-full h-full' />
        </Pressable>
        <View className='border border-border/40 grow h-8 rounded-2xl items-center justify-center'>
          <Text className='text-center text-gray-800 font-bold text-base'>{value}</Text>
        </View>
        <Pressable className='p-2.5 rounded-full bg-foreground size-9' onPress={() => onChange(value + 1)}>
          <Image source={icons.add} className='w-full h-full' />
        </Pressable>
      </View>
    </View>
  );

  const Toggle = ({ label, value, onChange, description }: { label: string; value: boolean; onChange: (v: boolean) => void; description?: string; }) => (
    <Pressable
      onPress={() => onChange(!value)}
      className="flex-row items-center justify-between px-4 py-3 rounded-2xl border bg-card border-border/20"
    >
      <View className="flex-1 mr-3">
        <Text
          className="font-semibold text-foreground"
        >
          {label}
        </Text>
        {description && (
          <Text className="text-xs text-muted-foreground mt-0.5">{description}</Text>
        )}
      </View>
      <View
        className={clsx("size-8 p-2 rounded-full border items-center justify-center", value ? "bg-foreground" : "bg-background border-border/40"
        )}
      >
        {value && <Image source={icons.check_background} className="w-full h-full" />}
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView className='screen-safe-area' accessibilityLabel='Create Screen'>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"} className='flex-1'>
        <Text accessibilityRole="header" className='screen-title'>Add Property</Text>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps='handled'>
          <View className='create-property-section'>
            <Text className='create-property-section-title'>
              Photos {' '}
              <Text className='text-muted-foreground font-normal'>(up to 6)</Text>
            </Text>
            <View className='flex-row flex-wrap gap-3' >
              {form.localImages.map((uri, index) => (
                <View className='relative' key={index}>
                  <Image source={{ uri }} className='size-24 rounded-2xl' resizeMode='cover' />
                  {index === 0 && (
                    <View className='create-property-image-cover'>
                      <Text className='text-card text-[9px] font-bold'>COVER</Text>
                    </View>
                  )}
                  <Pressable className='create-property-image-remove' onPress={() => { handleRemoveImage(index) }}>
                    <Image source={icons.close_white} className='size-4' />
                  </Pressable>
                </View>
              ))}

              {form.localImages.length < 6 && (
                <Pressable className='create-property-image-add will-change-variable' onPress={handlePickImages} disabled={uploadingImages}>
                  {uploadingImages ? (
                    <ActivityIndicator size="small" color="#0a0a0a" />
                  ) : <><Image source={icons.camera} className='size-6' /><Text className='text-muted text-xs mt-1'>
                    Add</Text></>}
                </Pressable>
              )}
            </View>
          </View>

          {/* Base information  */}
          <View className='create-property-section'>
            <Text className='create-property-section-title'>
              Title
            </Text>
            <TextInput className='create-property-input' placeholder='e.g. Modern 3BHK in Delhi' value={form.title} onChangeText={(text) => handleInputChange({ title: text })} placeholderTextColor="#9CA3AF" />
          </View>
          <View className='create-property-section'>
            <Text className='create-property-section-title'>
              Description
            </Text>
            <TextInput className='create-property-input' placeholder='e.g. Description of the property' value={form.description} onChangeText={(text) => handleInputChange({ description: text })} multiline placeholderTextColor="#9CA3AF" />
          </View>

          {/* Price of the property  */}
          <View className='create-property-section'>
            <Text className='create-property-section-title'>
              Price (INR)
            </Text>
            <TextInput className='create-property-input' placeholder='e.g. 500000' value={form.price} onChangeText={(text) => handleInputChange({ price: text })} keyboardType='numeric' placeholderTextColor="#9CA3AF" />
            <Text className='text-muted-foreground text-xs mt-1.5 ml-1'>Valid range: ₹ 1 - ₹ {MAX_PRICE.toLocaleString('en-IN')}</Text>
          </View>

          {/* Property type  */}
          <View className='create-property-section'>
            <Text className='create-property-section-title'>
              Property Type
            </Text>
            <View className='flex-row flex-wrap gap-2'>
              {TYPES_LIST?.map((type) => (
                <Pressable key={type} className={clsx("create-property-type-option", form.type === type && "bg-blue-100! border-accent!")} onPress={() => handleInputChange({ type })}>
                  <Text className={clsx("create-property-type-option-text", form.type === type ? "text-accent" : "text-muted")} numberOfLines={1}>{type}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Bedrooms / Bathrooms  */}
          <View className='flex-row gap-4 mb-2'>
            <Counter label='Bedrooms' value={form.bedrooms} onChange={(newValue) => handleInputChange({ bedrooms: newValue })} />
            <Counter label='Bathrooms' value={form.bathrooms} onChange={(newValue) => handleInputChange({ bathrooms: newValue })} />
          </View>

          {/* Area square feet  */}
          <View className='create-property-section'>
            <Text className='create-property-section-title'>Area (sq ft)</Text>
            <TextInput
              className='create-property-input'
              placeholder="e.g. 1200"
              placeholderTextColor="#9CA3AF"
              value={form.areaSqft}
              onChangeText={(v) => handleInputChange({ areaSqft: v })}
              keyboardType="numeric"
            />
          </View>

          {/* Location  */}
          <View className='create-property-section'>
            <Text className='create-property-section-title'>
              Address
            </Text>
            <TextInput className='create-property-input' placeholder='Street address' value={form.address} onChangeText={(text) => handleInputChange({ address: text })} placeholderTextColor="#9CA3AF" />
          </View>

          {/* Location  */}
          <View className='create-property-section'>
            <Text className='create-property-section-title'>
              City
            </Text>
            <TextInput className='create-property-input' placeholder='e.g. Delhi NCR' value={form.city} onChangeText={(text) => handleInputChange({ city: text })} placeholderTextColor="#9CA3AF" />
          </View>

          {/* Coordinates  */}
          <View className='create-property-section'>
            <View className='flex-row items-center justify-between mb-1.5'>
              <Text className='create-property-section-title'>
                Coordinates
              </Text>
              <Pressable
                onPress={handleDetectLocation}
                disabled={detectingLocation}
                className='create-property-coordinates'>
                {detectingLocation ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Image source={icons.location_background} className='size-5' />
                )
                }
                <Text className='text-xs text-background ml-1'>{detectingLocation ? "Detecting..." : "Detect Location"}</Text>
              </Pressable>
            </View>

            <View className='flex-row gap-3'>
              <View className='flex-1'>
                <TextInput
                  className='create-property-input mb-2'
                  placeholder="Latitude"
                  placeholderTextColor="#9CA3AF"
                  value={form.latitude}
                  onChangeText={(v) => handleInputChange({ latitude: v })}
                  keyboardType="numeric"
                />
              </View>
              <View className='flex-1'>
                <TextInput
                  className='create-property-input mb-2'
                  placeholder="Longitude"
                  placeholderTextColor="#9CA3AF"
                  value={form.longitude}
                  onChangeText={(v) => handleInputChange({ longitude: v })}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          {/* Toggles  */}
          <View className='gap-3 mb-3'>
            <Toggle label='Featured Property' value={form.isFeatured} onChange={(v) => handleInputChange({ isFeatured: v })} description='Highlight this property as a featured listing.' />
          </View>

          {/* Submit button */}
          <Pressable
            onPress={handleSubmit}
            disabled={submitting || uploadingImages || detectingLocation}
            className={clsx('bg-foreground rounded-2xl py-4 items-center mb-6', (submitting || uploadingImages || detectingLocation) && "opacity-70")}
          >
            {submitting ? (<ActivityIndicator size="small" color="#fff" />) : (<Text className='text-white font-semibold text-base'>Submit Property</Text>)}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
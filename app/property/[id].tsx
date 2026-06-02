import { icons } from "@/constants/icons";
import { useSavedProperty } from "@/hooks/useSavedProperty";
import { useSupabase } from "@/hooks/useSupabase";
import { supabase } from "@/lib/supabase";
import { formatPrice } from "@/lib/utils";
import { captureError, sentryBreadcrumbs } from "@/src/lib/sentry";
import { useUserStore } from "@/store/userStore";
import clsx from "clsx";
import { useLocalSearchParams, useRouter } from "expo-router";
import { styled } from "nativewind";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Linking,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  Text,
  View
} from "react-native";
import ImageViewing from "react-native-image-viewing";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

const { width } = Dimensions.get("window");
const SafeAreaView = styled(RNSafeAreaView);

export default function PropertyDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const isAdmin = useUserStore((state) => state?.isAdmin ?? false)
  const ADMIN_NUMBER = "916200083799";
  const { isSaved, saveLoading, toggleSave } = useSavedProperty(id ?? "");

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [expend, setExpend] = useState<boolean>(false);
  const [imageViewerVisible, setImageViewerVisible] = useState<boolean>(false);

  const authSupabase = useSupabase();

  const fetchProperty = async () => {
    try {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      setProperty(data as unknown as Property ?? null);
      setLoading(false);
    } catch (error) {
      console.log("Error fetching property:", error);
      captureError(error, "fetch_property_detail", { propertyId: id });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperty();
  }, [id]);

  useEffect(() => {
    if (property?.id) {
      sentryBreadcrumbs.propertyView(property.id);
    }
  }, [property?.id]);

  function onScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setActiveIndex(index);
  }

  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${property?.longitude! - 0.003
    }%2C${property?.latitude! - 0.003}%2C${property?.longitude! + 0.003}%2C${property?.latitude! + 0.003
    }&layer=mapnik&marker=${property?.latitude}%2C${property?.longitude}`;

  const isLongDesc = (property?.description?.length ?? 0) > 150;
  const displayDesc =
    expend || !isLongDesc
      ? property?.description
      : property?.description?.slice(0, 150) + "...";


  const handleContactAgent = () => {
    sentryBreadcrumbs.contactSubmission(property?.id);
    const message = `Hello, I'm interested in the property "${property?.title}". Is it still available?`;
    const url = `https://wa.me/${ADMIN_NUMBER}?text=${encodeURIComponent(message)}`;
    Linking.openURL(url).catch((error) => {
      captureError(error, "open_contact_agent", { propertyId: property?.id });
      Alert.alert("Error", "Failed to open WhatsApp. Please try again.");
    });
  }

  const handleMarkSold = () => {
    Alert.alert("Mark as Sold", "Are you sure you want to mark this property as sold?", [
      { text: 'Cancel', style: "cancel" }, {
        text: 'Yes, Mark as Sold',
        onPress: async () => {
          const { data, error } = await authSupabase
            .from("properties")
            .update({ is_sold: true })
            .eq("id", id)
            .select();

          console.log("property data:", data);
          console.log("property id:", property?.id);
          console.log("property error:", error);
          console.log("property id:", id);
          if (error) {
            captureError(error, "mark_property_sold", { propertyId: id });
            Alert.alert("Error", "Failed to mark property as sold. Please try again.");
          } else {
            Alert.alert("Success", "Property marked as sold.");
            setProperty((prev) => (prev ? { ...prev, is_sold: true } : prev));
          }
        },
      }
    ])
  }

  const handleDeleteProperty = () => {
    Alert.alert("Delete Property", "Are you sure you want to delete this property?", [
      { text: 'Cancel', style: "cancel" }, {
        text: 'Yes, Delete',
        onPress: async () => {
          const { error } = await authSupabase
            .from("properties")
            .delete()
            .eq("id", id);

          if (error) {
            captureError(error, "delete_property", { propertyId: id });
            Alert.alert("Error", "Failed to delete property. Please try again.");
          } else {
            Alert.alert("Success", "Property deleted.");
            router.back();
          }
        },
      }
    ])
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#0a0a0a" />
      </View>
    );
  }

  if (!property) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="">Property not found</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background pb-6">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View>
          <View className={clsx(property?.is_sold && "opacity-60")}>
            <FlatList
              data={property?.images}
              keyExtractor={(_, i) => i.toString()}
              renderItem={({ item }) => (
                <Pressable onPress={() => setImageViewerVisible(true)}>
                  <Image
                    source={{ uri: item }}
                    style={{ width, height: 400 }}
                  />
                </Pressable>
              )}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={onScroll}
              scrollEventThrottle={16}
            />
          </View>

          {/* Image carousel indicator */}
          <View className="image-carousel-indicator">
            <Text className="image-carousel-indicator-text">
              {activeIndex + 1} / {property?.images.length}
            </Text>
          </View>

          {/* Dot indicator  */}
          {property?.images.length > 1 && (
            <View className="image-carousel-dot-indicator">
              {property?.images.map((_, index) => (
                <View
                  key={index}
                  className={clsx(
                    "image-carousel-dot",
                    activeIndex === index && "image-carousel-dot-active"
                  )}
                />
              ))}
            </View>
          )}

          {/* Back and save buttons */}
          <SafeAreaView className="property-header-controls">
            <View className="property-header">
              <Pressable
                className="property-header-btn"
                onPress={() => router.back()}
              >
                <Image
                  source={icons.back_arrow}
                  alt="back icon"
                  className="w-full h-full"


                />
              </Pressable>
              <Pressable
                className="property-header-btn"
                onPress={toggleSave}
                disabled={saveLoading}
              >
                <Image
                  source={isSaved ? icons.full_heart : icons.heart}
                  alt="back icon"
                  className="w-full h-full"


                />
              </Pressable>
            </View>
          </SafeAreaView>
        </View>

        {/* Content  */}
        <View
          className={clsx(
            "property-content",
            property?.is_sold && "opacity-40"
          )}
        >
          {/* Badges  */}
          <View className="property-badges">
            <View className="property-badge">
              <Text className="property-badge-text" numberOfLines={1}>
                {property?.type}
              </Text>
            </View>
            {property?.is_sold && (
              <View className="property-badge border-destructive/50! bg-destructive/10!">
                <Text className="property-badge-text text-destructive!">
                  Sold
                </Text>
              </View>
            )}
            {property?.is_featured && (
              <View className="property-badge border-accent/50! bg-accent/10!">
                <Text className="property-badge-text text-accent!">
                  Featured
                </Text>
              </View>
            )}
          </View>

          {/* Title and price */}
          <View className="property-header-info">
            <Text className="property-title">{property?.title}</Text>
            <Text className="property-price">
              {formatPrice(property?.price)}
            </Text>
          </View>

          {/* Specs row  */}
          <View className="property-specs-row">
            <View className="property-spec">
              <Image
                source={icons.bed}
                alt="bed icon"
                className="property-spec-icon"
              />
              <Text className="property-spec-text">
                {property?.bedrooms} {property?.bedrooms > 1 ? "Beds" : "Bed"}
              </Text>
            </View>
            <View className="property-spec">
              <Image
                source={icons.water}
                alt="bath icon"
                className="property-spec-icon"
              />
              <Text className="property-spec-text">
                {property?.bathrooms}{" "}
                {property?.bathrooms > 1 ? "Baths" : "Bath"}
              </Text>
            </View>
            <View className="property-spec">
              <Image
                source={icons.size}
                alt="location icon"
                className="property-spec-icon"
              />
              <Text className="property-spec-text" numberOfLines={1}>
                {property?.area_sqft} ft²
              </Text>
            </View>
          </View>

          {/* Description  */}
          <View className="property-description">
            <Text className="property-description-title">Description</Text>
            <Text className={clsx("property-description-text")}>
              {displayDesc}
            </Text>
            {isLongDesc && (
              <Pressable onPress={() => setExpend(!expend)}>
                <Text className="property-description-toggle">
                  {expend ? "Show less" : "Show more"}
                </Text>
              </Pressable>
            )}
          </View>

          {/* Location */}
          <View className="property-location">
            <Text className="property-location-title">Location</Text>
            <View className="property-location-info">
              <Image
                source={icons.location}
                alt="location icon"
                className="property-location-icon"
              />
              <Text className="property-location-text">
                {property?.address}, {property?.city}
              </Text>
            </View>
            {/* Map */}
            <Pressable
              onPress={() => {
                router.push({
                  pathname: "/property/map",
                  params: {
                    latitude: property?.latitude,
                    longitude: property?.longitude,
                    title: property?.title,
                    address: `${property?.address}, ${property?.city}`,
                  },
                });
              }}
              className="rounded-2xl overflow-hidden mt-4 relative"
              style={{ width: "100%", height: 250 }}
            >
              <WebView
                source={{ uri: mapUrl }}
                scrollEnabled={false}
                pointersEvents="none"
                style={{ flex: 1 }}
              />
              {/* Tap to expand */}
              <View className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm rounded-full px-3 py-1 border border-foreground/20 flex-row items-center gap-1">
                <Image
                  source={icons.size}
                  alt="location icon"
                  className="property-location-icon"


                />
                <Text className="text-foreground text-sm font-semibold">
                  Tap to expand
                </Text>
              </View>
            </Pressable>
          </View>
          {/* Contact Agent */}
          <Pressable className="property-cta mt-6!" onPress={handleContactAgent}>
            <View className="property-cta-btn">
              <Image
                source={icons.whatsapp}
                alt="location icon"
                className="size-6"


              />
              <Text className="text-background text-md font-semibold capitalize">
                Connect with agent
              </Text>
            </View>
          </Pressable>

          {isAdmin && (
            <View className="flex-row items-center gap-2">
              {/* Mark sold  */}
              {!property?.is_sold && (<Pressable onPress={handleMarkSold} className="property-cta grow bg-amber-100! border border-amber-500">
                <View className="property-cta-btn">
                  <Image
                    source={icons.check}
                    alt="location icon"
                    className="size-6"


                  />
                  <Text className="text-amber-500 text-md font-semibold capitalize">
                    Mark Sold
                  </Text>
                </View>
              </Pressable>)}
              {/* Delete  */}
              <Pressable onPress={handleDeleteProperty} className="property-cta grow bg-destructive!">
                <View className="property-cta-btn">
                  <Image
                    source={icons.bin}
                    alt="location icon"
                    className="size-6"


                  />
                  <Text className="text-background text-md font-semibold capitalize">
                    Delete
                  </Text>
                </View>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Image viewer */}
      <ImageViewing
        images={property.images.map((uri) => ({ uri }))}
        imageIndex={activeIndex}
        visible={imageViewerVisible}
        onRequestClose={() => setImageViewerVisible(false)}
      />
    </View>
  );
}

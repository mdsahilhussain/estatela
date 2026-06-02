import { useAuth, useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { styled } from "nativewind";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Pressable,
  Text,
  View,
} from "react-native";

import { captureError, clearSentryUser, sentryBreadcrumbs } from "@/src/lib/sentry";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

export default function SettingScreen() {
  const { user, isLoaded } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSignOut = async () => {
    try {
      sentryBreadcrumbs.logout();
      await signOut();
      clearSentryUser();
      router.replace("/sign-in");
    } catch (error) {
      console.error("Error signing out:", error);
      captureError(error, "clerk_sign_out");
    }
  };

  const handleUpdateProfileImage = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "Permission Required",
          "Please allow access to your photo library to update your profile picture."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (result.canceled) return;

      setIsUpdating(true);

      const base64Image = result.assets[0].base64;
      const uri = result.assets[0].uri;
      const filename = uri.split("/").pop() || "profile.jpg";
      const match = /\.(\w+)$/.exec(filename);
      const mimeType = match ? `image/${match[1]}` : "image/jpeg";
      const dataUrl = `data:${mimeType};base64,${base64Image}`;

      await user?.setProfileImage({ file: dataUrl });

      Alert.alert("Success", "Profile picture updated successfully!");
    } catch (error) {
      console.error("Error updating profile image:", error);
      captureError(error, "clerk_update_profile_image");
      Alert.alert(
        "Error",
        "Failed to update profile picture. Please try again."
      );
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isLoaded || !user) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#0a0a0a" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="screen-safe-area" accessibilityLabel='Setting Screen'>
      {/* Avatar + Name */}
      <View className="items-center py-8">
        <View className="relative">
          <Image
            source={{ uri: user.imageUrl }}
            className="w-24 h-24 rounded-full mb-4"
          />
          <Pressable
            onPress={handleUpdateProfileImage}
            disabled={isUpdating}
            className="absolute bottom-3 right-0 bg-accent rounded-full p-2"
          >
            {isUpdating ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons name="camera" size={16} color="white" />
            )}
          </Pressable>
        </View>
        <Text className="text-xl font-bold text-foreground">
          {user.firstName} {user.lastName}
        </Text>
        <Text className="text-fm mt-1">
          {user.emailAddresses[0].emailAddress}
        </Text>
      </View>

      {/* Menu Items */}
      <View className="gap-2">
        <MenuItem
          icon="heart-outline"
          label="Saved Properties"
          onPress={() => router.push("/(tabs)/favorite")}
        />
        <MenuItem
          icon="notifications-outline"
          label="Notifications"
          onPress={() =>
            Alert.alert("Coming Soon", "Notifications coming soon!")
          }
        />
        <MenuItem
          icon="settings-outline"
          label="Settings"
          onPress={() => Alert.alert("Coming Soon", "Settings coming soon!")}
        />
        <MenuItem
          icon="help-circle-outline"
          label="Help & Support"
          onPress={() =>
            Linking.openURL(
              "mailto:mdsahil.hussain9@gmail.com?subject=Help%20%26%20Support%20-%20Kribb%20App"
            )
          }
        />
      </View>

      {/* Sign Out */}
      <View className="mt-auto">
        <Pressable
          onPress={handleSignOut}
          className="flex-row items-center justify-center gap-2 bg-destructive/10 py-4 rounded-2xl border border-destructive/30"
        >
          <Ionicons name="log-out-outline" size={20} className="text-destructive" />
          <Text className="text-destructive font-semibold text-base">Sign Out</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function MenuItem({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-4 bg-card px-4 py-4 rounded-2xl"
    >
      <Ionicons name={icon} size={22} className="text-muted" />
      <Text className="flex-1 text-foreground font-medium text-base">
        {label}
      </Text>
      <Ionicons name="chevron-forward" size={18} className="text-muted-foreground" />
    </Pressable>
  );
}

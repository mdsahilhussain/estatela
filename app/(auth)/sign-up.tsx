import { icons } from '@/constants/icons';
import { useAuth, useSignUp } from '@clerk/expo';
import { type Href, Link, router } from 'expo-router';
import { styled } from 'nativewind';
import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
const SafeAreaView = styled(RNSafeAreaView);

export default function SignUp() {
  const { errors, signUp, fetchStatus } = useSignUp()
  const { isSignedIn } = useAuth()
  const [firstName, setFirstName] = useState<string>('')
  const [lastName, setLastName] = useState<string>('');
  const [emailAddress, setEmailAddress] = useState<string>('')
  const [password, setPassword] = useState<string>('');
  const [code, setCode] = useState<string>('')

  const isLoading = fetchStatus === 'fetching';

  // Validation states
  const [emailTouched, setEmailTouched] = useState(false);
  const [firstNameTouched, setFirstNameTouched] = useState(false);
  const [lastNameTouched, setLastNameTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  // Client-side validation
  const emailValid = emailAddress.length === 0 || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress);
  const passwordValid = password.length > 0;
  const firstNameValid = firstName.length > 0;
  const lastNameValid = lastName.length > 0;
  const formValid = emailAddress.length > 0 && passwordValid && emailValid && firstNameValid && lastNameValid;


  const handleSubmit = async () => {
    if (!formValid) return;

    const { error } = await signUp.password({
      firstName,
      lastName,
      emailAddress,
      password
    })

    if (error) {
      alert(error.message)
      return
    }

    if (!error) {
      await signUp.verifications.sendEmailCode();
    }
  }

  const handleVerify = async () => {
    const { error } = await signUp.verifications.verifyEmailCode({
      code,
    });

    if (error) {
      alert(error.message)
      return
    }

    if (signUp.status === 'complete') {
      await signUp.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) {
            console.log(session?.currentTask);
            return;
          }

          const url = decorateUrl('/(tabs)');
          if (url.startsWith('http')) {
            // Only use window.location on web platform
            if (typeof window !== 'undefined' && window.location) {
              window.location.href = url;
            } else {
              // On native, just use router navigation
              router.replace('/(tabs)' as Href);
            }
          } else {
            router.replace(url as Href);
          }
        },
      });
    } else {
      console.error('Sign-up attempt not complete:', signUp);
    }
  };
  // Don't show anything if already signed in or sign-up is complete
  if (signUp.status === 'complete' || isSignedIn) {
    return null;
  }

  // Show verification screen if email needs verification
  if (
    signUp.status === 'missing_requirements' &&
    signUp.unverifiedFields.includes('email_address') &&
    signUp.missingFields.length === 0
  ) {
    return (
      <SafeAreaView className="screen-safe-area">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="auth-screen"
        >
          <ScrollView
            className="auth-scroll"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View className="auth-content">
              {/* Branding */}
              <View className="auth-brand-block">
                <View className='auth-logo-wrap'>
                  <Image source={icons.logo} className='auth-logo-mark' />
                  <Text className='auth-logo-mark-text' numberOfLines={1}>Estatela</Text>
                </View>
                <Text className="auth-title">Verify your email</Text>
                <Text className="auth-subtitle">
                  We sent a verification code to {emailAddress}
                </Text>
              </View>

              {/* Verification Form */}
              <View className="auth-card">
                <View className="auth-form">
                  <View className="auth-field">
                    <Text className="auth-label">Verification Code</Text>
                    <TextInput
                      className="auth-input"
                      value={code}
                      placeholder="Enter 6-digit code"
                      placeholderTextColor="rgba(0, 0, 0, 0.4)"
                      onChangeText={setCode}
                      keyboardType="number-pad"
                      autoComplete="one-time-code"
                      maxLength={6}
                    />
                    {errors.fields.code && (
                      <Text className="auth-error">{errors.fields.code.message}</Text>
                    )}
                  </View>

                  <Pressable
                    className={`auth-button ${(!code || fetchStatus === 'fetching') && 'auth-button-disabled'}`}
                    onPress={handleVerify}
                    disabled={!code || fetchStatus === 'fetching'}
                  >
                    <Text className="auth-button-text">
                      {fetchStatus === 'fetching' ? 'Verifying...' : 'Verify Email'}
                    </Text>
                  </Pressable>

                  <Pressable
                    className="auth-secondary-button"
                    onPress={() => signUp.verifications.sendEmailCode()}
                    disabled={fetchStatus === 'fetching'}
                  >
                    <Text className="auth-secondary-button-text">Resend Code</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className='screen-safe-area'>
      <KeyboardAvoidingView behavior={Platform.OS === "android" ? "height" : 'padding'}
        className='auth-screen'>
        <ScrollView className='auth-scroll' keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View className="auth-content">
            {/* Branding  */}
            <View className='auth-brand-block'>
              <View className='auth-logo-wrap'>
                <Image source={icons.logo} className='auth-logo-mark' />
                <Text className='auth-logo-mark-text' numberOfLines={1}>Estatela</Text>
              </View>
              <View>
                <Text className='auth-title' numberOfLines={1}>Create your account</Text>
                <Text className='auth-subtitle' numberOfLines={2}> Start tracking your subscriptions and never miss a payment</Text>
              </View>

              {/* Verfication form  */}
              <View className='auth-form'>
                <View className='flex-row items-start gap-2'>
                  <View className="auth-field grow">
                    <Text className="auth-label">First Name</Text>
                    <TextInput
                      className={`auth-input ${firstNameTouched && !firstNameValid && 'auth-input-error'}`}
                      autoCapitalize="words"
                      value={firstName}
                      placeholder="John"
                      placeholderTextColor="rgba(0, 0, 0, 0.4)"
                      onChangeText={setFirstName}
                      onBlur={() => setFirstNameTouched(true)}
                      keyboardType="default"
                      autoComplete="name"
                    />
                    {firstNameTouched && !firstNameValid && (
                      <Text className="auth-error">Please enter your first name</Text>
                    )}
                    {errors.fields.firstName && (
                      <Text className="auth-error">{errors.fields.firstName.message}</Text>
                    )}
                  </View>
                  <View className="auth-field grow">
                    <Text className="auth-label">Last Name</Text>
                    <TextInput
                      className={`auth-input ${lastNameTouched && !lastNameValid && 'auth-input-error'}`}
                      autoCapitalize="words"
                      value={lastName}
                      placeholder="dev"
                      placeholderTextColor="rgba(0, 0, 0, 0.4)"
                      onChangeText={setLastName}
                      onBlur={() => setLastNameTouched(true)}
                      keyboardType="default"
                      autoComplete="name"
                    />
                    {lastNameTouched && !lastNameValid && (
                      <Text className="auth-error">Please enter your last name</Text>
                    )}
                    {errors.fields.lastName && (
                      <Text className="auth-error">{errors.fields.lastName.message}</Text>
                    )}
                  </View>
                </View>
                <View className="auth-field">
                  <Text className="auth-label">Email Address</Text>
                  <TextInput
                    className={`auth-input ${emailTouched && !emailValid && 'auth-input-error'}`}
                    autoCapitalize="none"
                    value={emailAddress}
                    placeholder="name@example.com"
                    placeholderTextColor="rgba(0, 0, 0, 0.4)"
                    onChangeText={setEmailAddress}
                    onBlur={() => setEmailTouched(true)}
                    keyboardType="email-address"
                    autoComplete="email"
                  />
                  {emailTouched && !emailValid && (
                    <Text className="auth-error">Please enter a valid email address</Text>
                  )}
                  {errors.fields.emailAddress && (
                    <Text className="auth-error">{errors.fields.emailAddress.message}</Text>
                  )}
                </View>
                <View className="auth-field">
                  <Text className="auth-label">Password</Text>
                  <TextInput
                    className={`auth-input ${passwordTouched && !passwordValid && 'auth-input-error'}`}
                    value={password}
                    placeholder="Enter your password"
                    placeholderTextColor="rgba(0, 0, 0, 0.4)"
                    secureTextEntry
                    onChangeText={setPassword}
                    onBlur={() => setPasswordTouched(true)}
                    autoComplete="password"
                  />
                  {passwordTouched && !passwordValid && (
                    <Text className="auth-error">Password is required</Text>
                  )}
                  {errors.fields.password && (
                    <Text className="auth-error">{errors.fields.password.message}</Text>
                  )}
                </View>

                <Pressable
                  className={`auth-button ${(!formValid || isLoading) && 'auth-button-disabled'}`}
                  onPress={handleSubmit}
                  disabled={!formValid || isLoading}
                >
                  <Text className="auth-button-text">
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
          {/* Sign-In Link */}
          <View className="auth-link-row">
            <Text className="auth-link-copy">Already have an account?</Text>
            <Link href="/(auth)/sign-in" asChild>
              <Pressable>
                <Text className="auth-link">Sign In</Text>
              </Pressable>
            </Link>
          </View>

          {/* Required for Clerk's bot protection */}
          <View nativeID="clerk-captcha" />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
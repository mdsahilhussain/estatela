import { icons } from '@/constants/icons';
import { captureError, sentryBreadcrumbs } from '@/lib/sentry';
import { useAuth, useSignIn } from '@clerk/expo';
import { type Href, Link, router } from 'expo-router';
import { styled } from 'nativewind';
import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
const SafeAreaView = styled(RNSafeAreaView);

export default function SignIn() {
  const { errors, signIn, fetchStatus } = useSignIn()
  const { isSignedIn } = useAuth()
  const [emailAddress, setEmailAddress] = useState<string>('')
  const [password, setPassword] = useState<string>('');
  const [code, setCode] = useState<string>("")

  const isLoading = fetchStatus === 'fetching'

  // Validation states
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  // Client-side validation
  const emailValid = emailAddress.length === 0 || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress);
  const passwordValid = password.length > 0;
  const formValid = emailAddress.length > 0 && password.length > 0 && emailValid;


  const handleSubmit = async () => {
    if (!formValid) return;

    try {
      const { error } = await signIn.password({
        emailAddress: emailAddress,
        password
      })

      if (error) {
        alert(error.message)
        return
      }
      if (signIn.status === 'complete') {
        sentryBreadcrumbs.login('password');
        await signIn.finalize({
          navigate: ({ session, decorateUrl }) => {
            if (session?.currentTask) {
              console.info(session.currentTask)
              return
            }

            const url = decorateUrl('/(tabs)')

            if (url.startsWith('http')) {
              if (typeof window !== 'undefined' && window.location) {
                window.location.href = url;
              } else {
                router.replace('/(tabs)' as Href)
              }
            } else {
              router.replace(url as Href)
            }
          }
        })
      } else if (signIn.status === "needs_second_factor") {
        // Handle MFA if needed (not implemented in this basic flow)
        // await signIn.mfa.sendPhoneCode();
        await signIn.mfa.sendEmailCode();
        console.info('MFA required');
      } else if (signIn.status === 'needs_client_trust') {
        const emailCodeFactor = signIn.supportedSecondFactors.find(
          (factor) => factor.strategy === 'email_code'
        )
        if (emailCodeFactor) {
          await signIn.mfa.sendEmailCode();
        }
      } else {
        console.error('Sign-in attempt not complete:', signIn)
      }
    } catch (error: unknown) {
      console.error('Sign-in error:', error);
      if (error instanceof Error) {
        captureError({
          message: error.message,
        }, 'clerk_sign_in', { method: 'password' });
      }
      alert('An unexpected error occurred. Please try again.');
    }
  }

  const handleVerify = async () => {
    try {
      await signIn.mfa.verifyEmailCode({
        code,
      });

      if (signIn.status === 'complete') {
        sentryBreadcrumbs.login('mfa_email_code');
        await signIn.finalize({
          navigate: ({ session, decorateUrl }) => {
            if (session?.currentTask) {
              console.info(session?.currentTask);
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
        console.error('Sign-in attempt not complete:', signIn);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        captureError({
          message: error.message,
        }, 'clerk_sign_in_mfa', { method: 'mfa_email_code' });
      }
      alert('Failed to verify code. Please try again.');
    }
  };


  const handleResendCode = async () => {
    try {
      await signIn.mfa.sendEmailCode();
      alert('Verification code sent!');
    } catch (error) {
      console.error(error)
      captureError(error, 'clerk_resend_mfa_code');
      alert('Failed to resend code. Please try again.');
    }
  };

  // Don't show anything if already signed in or sign-up is complete
  if (!signIn || signIn.status === 'complete' || isSignedIn) {
    return null;
  }

  // Show verification screen if email needs verification
  if (signIn.status === 'needs_client_trust' || signIn.status === 'needs_second_factor') {
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
                    onPress={handleResendCode}
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
                <Text className='auth-title' numberOfLines={1}>Welcome back</Text>
                <Text className='auth-subtitle' numberOfLines={2}>Sign in to continue managing your subscriptions</Text>
              </View>

              {/* Verfication form  */}
              <View className='auth-form'>
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
                  {errors.fields.identifier && (
                    <Text className="auth-error">{errors.fields.identifier.message}</Text>
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
                    {isLoading ? 'Signing In...' : 'Sign In'}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
          {/* Sign-Up Link */}
          <View className="auth-link-row">
            <Text className="auth-link-copy">Don&apos;t have an account?</Text>
            <Link href="/(auth)/sign-up" asChild>
              <Pressable>
                <Text className="auth-link">Create Account</Text>
              </Pressable>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

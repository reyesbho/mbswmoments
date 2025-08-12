import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  visible: boolean;
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
  onPress?: () => void;
  actionText?: string;
  showIcon?: boolean;
}

export default function Toast({
  visible,
  message,
  type = 'info',
  duration = 4000,
  onClose,
  onPress,
  actionText,
  showIcon = true,
}: ToastProps) {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Trigger haptic feedback
      if (type === 'error') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } else if (type === 'success') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }

      // Animate in
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide after duration
      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: '#27AE60',
          icon: 'checkmark',
          iconColor: '#FFFFFF',
          textColor: '#FFFFFF',
        };
      case 'error':
        return {
          backgroundColor: '#E74C3C',
          icon: 'close',
          iconColor: '#FFFFFF',
          textColor: '#FFFFFF',
        };
      case 'warning':
        return {
          backgroundColor: '#F39C12',
          icon: 'warning',
          iconColor: '#FFFFFF',
          textColor: '#FFFFFF',
        };
      case 'info':
      default:
        return {
          backgroundColor: '#3498DB',
          icon: 'information-circle',
          iconColor: '#FFFFFF',
          textColor: '#FFFFFF',
        };
    }
  };

  const toastStyles = getToastStyles();

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <View
        style={[
          styles.content,
          { backgroundColor: toastStyles.backgroundColor }
        ]}
      >
        {showIcon && (
          <View style={styles.iconContainer}>
            <Ionicons
              name={toastStyles.icon as any}
              size={20}
              color={toastStyles.iconColor}
            />
          </View>
        )}
        
        <View style={[
          styles.messageContainer,
          !showIcon && { marginLeft: 0 }
        ]}>
          <Text style={[styles.message, { color: toastStyles.textColor }]}>
            {message}
          </Text>
        </View>

        {actionText && onPress && (
          <TouchableOpacity onPress={onPress} style={styles.actionButton}>
            <Text style={[styles.actionText, { color: toastStyles.textColor }]}>
              {actionText}
            </Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity onPress={hideToast} style={styles.closeButton}>
          <Ionicons name="close" size={16} color={toastStyles.textColor} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    minHeight: 48,
  },
  iconContainer: {
    marginRight: 12,
    width: 20,
    alignItems: 'center',
  },
  messageContainer: {
    flex: 1,
  },
  message: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 18,
  },
  actionButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 4,
    marginRight: 8,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  closeButton: {
    padding: 4,
    marginLeft: 4,
  },
});

// Hook para usar el toast
export const useToast = () => {
  const [toast, setToast] = React.useState<{
    visible: boolean;
    message: string;
    type: ToastType;
    actionText?: string;
    onPress?: () => void;
    showIcon?: boolean;
  }>({
    visible: false,
    message: '',
    type: 'info',
    showIcon: true,
  });

  const showToast = (
    message: string,
    type: ToastType = 'info',
    actionText?: string,
    onPress?: () => void,
    showIcon: boolean = true
  ) => {
    setToast({
      visible: true,
      message,
      type,
      actionText,
      onPress,
      showIcon,
    });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, visible: false }));
  };

  const showSuccess = (message: string, actionText?: string, onPress?: () => void, showIcon: boolean = true) => {
    showToast(message, 'success', actionText, onPress, showIcon);
  };

  const showError = (message: string, actionText?: string, onPress?: () => void, showIcon: boolean = true) => {
    showToast(message, 'error', actionText, onPress, showIcon);
  };

  const showWarning = (message: string, actionText?: string, onPress?: () => void, showIcon: boolean = true) => {
    showToast(message, 'warning', actionText, onPress, showIcon);
  };

  const showInfo = (message: string, actionText?: string, onPress?: () => void, showIcon: boolean = true) => {
    showToast(message, 'info', actionText, onPress, showIcon);
  };

  return {
    toast,
    showToast,
    hideToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};

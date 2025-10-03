import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../../config/colors';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
  margin?: number;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  padding = 16,
  margin = 0,
}) => {
  return (
    <View style={[styles.card, { padding, margin }, style]}>
      {children}
    </View>
  );
};

interface InfoRowProps {
  label: string;
  value: string;
  labelStyle?: any;
  valueStyle?: any;
}

export const InfoRow: React.FC<InfoRowProps> = ({
  label,
  value,
  labelStyle,
  valueStyle,
}) => {
  return (
    <View style={styles.infoRow}>
      <Text style={[styles.label, labelStyle]}>{label}:</Text>
      <Text style={[styles.value, valueStyle]}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.background.card,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  label: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontWeight: '500',
    flex: 1,
  },
  value: {
    fontSize: 14,
    color: Colors.text.primary,
    fontWeight: '400',
    flex: 2,
    textAlign: 'right',
  },
});
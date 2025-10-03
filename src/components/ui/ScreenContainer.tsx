import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Colors } from '../../config/colors';

interface ScreenContainerProps {
  children: React.ReactNode;
  title?: string;
  showHeader?: boolean;
  headerComponent?: React.ReactNode;
}

export const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children,
  title,
  showHeader = false,
  headerComponent,
}) => {
  return (
    <SafeAreaView style={styles.container}>
      {showHeader && (
        <View style={styles.header}>
          {headerComponent || (
            title && <Text style={styles.title}>{title}</Text>
          )}
        </View>
      )}
      <View style={styles.content}>
        {children}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  content: {
    flex: 1,
  },
});
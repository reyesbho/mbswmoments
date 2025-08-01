import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export function HeaderView({title, children, hasBackButton=false }: {title: string, children?: React.ReactNode, hasBackButton?: boolean }) {
  const router = useRouter();

    return (
        <View style={styles.header}>
          {hasBackButton && (
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#2C3E50" />
                </TouchableOpacity>
            )}
            <Text style={styles.headerTitle}>{title}</Text>
            
            {children && children}
      </View>   
    )
}

const styles = StyleSheet.create({
    header: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingTop: 10,
      paddingBottom: 10,
      backgroundColor: 'white',
      gap: 20,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#2C3E50',
    }
  });
  
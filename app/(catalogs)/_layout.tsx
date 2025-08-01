import { Stack } from "expo-router";

export default function CatalogsLayout(){
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="products" />
        </Stack>
    )
}
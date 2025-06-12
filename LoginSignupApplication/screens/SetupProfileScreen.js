// /screens/SetupProfileScreen.js
import React, { useState, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    Image, Alert, StyleSheet, ActivityIndicator, Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../supabaseClient';

export default function SetupProfileScreen({ navigation }) {
    const [username, setUsername] = useState('');
    const [age, setAge] = useState('');
    const [avatarUri, setAvatarUri] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        (async () => {
            if (Platform.OS !== 'web') {
                const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert('Permission required', 'Need gallery access to choose avatar.');
                }
            }
        })();
    }, []);

    const pickAvatar = async () => {
        try {
            const res = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });
            if (!res.canceled && res.assets?.length > 0) {
                setAvatarUri(res.assets[0].uri);
            }
        } catch (err) {
            console.error('ImagePicker Error:', err);
            Alert.alert('Error', 'Could not open image picker.');
        }
    };

    const saveProfile = async () => {
        if (!username.trim() || !age.trim() || !avatarUri) {
            return Alert.alert('Missing fields', 'Please provide username, age, and avatar.');
        }

        setLoading(true);
        try {
            const {
                data: { user },
                error: userErr,
            } = await supabase.auth.getUser();
            if (userErr || !user) throw userErr || new Error('No user session');

            const userId = user.id;
            const ext = avatarUri.split('.').pop();
            const fileName = `${userId}/avatar.${ext}`;

            // Upload the image file to Supabase Storage
            const { error: uploadErr } = await supabase.storage
                .from('avatars')
                .upload(fileName, {
                    uri: avatarUri,
                    type: `image/${ext}`,
                    name: fileName,
                }, {
                    upsert: true,
                    contentType: `image/${ext}`,
                });
            if (uploadErr) throw uploadErr;

            // Upsert profile in Supabase DB
            const { error: dbErr } = await supabase
                .from('profiles')
                .upsert({
                    id: userId,
                    username: username.trim(),
                    age: parseInt(age, 10),
                    avatar_url: fileName, // Keep path in DB
                }, { returning: 'minimal' });
            if (dbErr) throw dbErr;

            // Get public URL and cache it
            const { data: { publicUrl }, error: urlErr } = supabase
                .storage
                .from('avatars')
                .getPublicUrl(fileName);
            if (urlErr) throw urlErr;

            // Save profile data in local storage with avatar URL
            const toCache = {
                id: userId,
                username: username.trim(),
                age: parseInt(age, 10),
                avatar_url: publicUrl,
            };
            await AsyncStorage.setItem('profile', JSON.stringify(toCache));

            navigation.replace('MainTab');
        } catch (err) {
            console.error('SetupProfile Error:', err);
            Alert.alert('Error', err.message || 'Could not save profile.');
        } finally {
            setLoading(false);
        }
    };


    return (
        <View style={styles.container}>
            <Text style={styles.header}>Set Up Your Profile</Text>

            <TouchableOpacity style={styles.avatarBox} onPress={pickAvatar}>
                {avatarUri ? (
                    <Image source={{ uri: avatarUri }} style={styles.avatar} />
                ) : (
                    <Text style={styles.avatarText}>Tap to choose avatar</Text>
                )}
            </TouchableOpacity>

            <TextInput
                style={styles.input}
                placeholder="Username"
                placeholderTextColor="#999"
                value={username}
                onChangeText={setUsername}
            />
            <TextInput
                style={styles.input}
                placeholder="Age"
                placeholderTextColor="#999"
                keyboardType="number-pad"
                value={age}
                onChangeText={setAge}
            />

            <TouchableOpacity
                style={[styles.button, loading && { opacity: 0.6 }]}
                onPress={saveProfile}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>Continue</Text>
                )}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F5FF', padding: 20, justifyContent: 'center' },
    header: { fontSize: 24, fontWeight: '600', color: '#8A2BE2', textAlign: 'center', marginBottom: 20 },
    avatarBox: {
        alignSelf: 'center', width: 120, height: 120, borderRadius: 60,
        backgroundColor: '#EDE7F6', justifyContent: 'center', alignItems: 'center',
        marginBottom: 20, overflow: 'hidden'
    },
    avatar: { width: '100%', height: '100%' },
    avatarText: { color: '#999', fontSize: 14 },
    input: {
        borderWidth: 1, borderColor: '#D0BFE5', borderRadius: 6,
        padding: 12, marginBottom: 15, backgroundColor: '#fff', fontSize: 16
    },
    button: { backgroundColor: '#8A2BE2', padding: 14, borderRadius: 6, alignItems: 'center' },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

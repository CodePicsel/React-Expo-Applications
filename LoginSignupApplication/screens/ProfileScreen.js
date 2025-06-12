// screens/ProfileScreen.js
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Modal,
    TextInput,
    Alert,
    Platform,
    KeyboardAvoidingView,
} from 'react-native';
import { CommonActions } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../supabaseClient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

export default function ProfileScreen({ navigation }) {
    // In a real app, you’d fetch these from context or an API
    const [profile, setProfile] = useState(null);
    const [username, setUsername] = useState('');

    // For the edit modal
    const [modalVisible, setModalVisible] = useState(false);
    const [newPhotoUri, setNewPhotoUri] = useState(null);
    const [newUsername, setNewUsername] = useState(username);

    // Permissions for image picker
    const [hasPermission, setHasPermission] = useState(null);
    useEffect(() => {
        (async () => {
            const status = await ImagePicker.requestMediaLibraryPermissionsAsync();
            setHasPermission(status.status === 'granted');
        })();
    }, []);
    useEffect(() => {
        const fetchProfile = async () => {
            const {
                data: { user },
                error: userErr
            } = await supabase.auth.getUser();
            if (userErr || !user) return Alert.alert("Error", "Could not load user");

            const userId = user.id;

            // Try loading from cache first
            const cached = await AsyncStorage.getItem('profile');
            if (cached) {
                try {
                    setProfile(JSON.parse(cached));
                    setUsername(JSON.parse(cached))
                } catch (err) {
                    console.warn("Error parsing cached profile:", err);
                }
            }

            // Now fetch fresh from Supabase
            const { data, error } = await supabase
                .from('profiles')
                .select('username, age, avatar_url')
                .eq('id', userId)
                .single();

            if (data && data.avatar_url) {
                const { data: urlData, error: urlErr } = supabase
                    .storage
                    .from('avatars')
                    .getPublicUrl(data.avatar_url);
                if (urlErr) return;

                const updatedProfile = {
                    username: data.username,
                    age: data.age,
                    avatar_url: urlData.publicUrl,
                };
                setProfile(updatedProfile);
                await AsyncStorage.setItem('profile', JSON.stringify(updatedProfile));
            } else if (error) {
                console.error("Profile fetch error:", error.message);
            }
        };

        fetchProfile();
    }, []);


    if (!profile) {
        return <Text style={{ textAlign: 'center', marginTop: 50 }}>Loading...</Text>;
    }

    const logout = async () => {
        try {
            await supabase.auth.signOut();
            await AsyncStorage.removeItem('profile');
            navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'Auth' }],
                })
            );
        } catch (err) {
            console.log("Logour Error:", err);
            Alert.alert("Error", "Could not log out");
        }
    };

    // Open image library for new profile pic (square)
    const pickNewPhoto = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.7,
            });
            if (!result.canceled && result.assets?.length > 0) {
                setNewPhotoUri(result.assets[0].uri);
            }
        } catch (err) {
            console.error('Error picking new photo:', err);
            Alert.alert('Error', 'Could not open image library.');
        }
    };

    const onSaveChanges = () => {
        if (newUsername.trim() === '') {
            Alert.alert('Invalid Username', 'Username cannot be empty.');
            return;
        }
        // Update main profile state
        setUsername(newUsername.trim());
        if (newPhotoUri) {
            setProfile(newPhotoUri);
        }
        // Reset modal fields and close
        setModalVisible(false);
        setNewPhotoUri(null);
    };

    if (hasPermission === false) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>
                    Permission to access gallery is required!
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Main Profile Header */}
            <View style={styles.headerContainer}>
                {profile && (
                    <Image source={{ uri: profile.avatar_url }} style={styles.profilePhoto} />)}
                {username && (
                    <Text style={styles.usernameText}>{username.username}</Text>)}

                {/* Edit Button (circular) */}
                <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => {
                        setNewUsername(username);
                        setNewPhotoUri(null);
                        setModalVisible(true);
                    }}
                >
                    <Ionicons name="pencil" size={20} color="#8A2BE2" />
                </TouchableOpacity>

                {/* Logout Button */}
                <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                    <Text style={styles.logoutButtonText}>Log Out</Text>
                </TouchableOpacity>
            </View>

            {/* My Posts Section */}
            <Text style={styles.sectionTitle}>My Example Posts</Text>
            <ScrollView
                contentContainerStyle={styles.postsContainer}
                showsVerticalScrollIndicator={false}
            >
                {/* Placeholder posts */}
                {[1, 2, 3, 4].map((id) => (
                    <View key={id} style={styles.postCard}>
                        <Text style={styles.postTitle}>Post Title #{id}</Text>
                        <Text style={styles.postExcerpt}>
                            This is an example excerpt for post #{id}.
                        </Text>
                    </View>
                ))}
                <View style={{ height: 20 }} />
            </ScrollView>

            {/* Edit Profile Modal */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                        style={styles.modalContainer}
                    >
                        <View style={styles.modalContent}>
                            <Text style={styles.modalHeader}>Edit Profile</Text>

                            {/* New Profile Photo Preview */}
                            <TouchableOpacity
                                style={styles.newPhotoPlaceholder}
                                onPress={pickNewPhoto}
                            >
                                {newPhotoUri ? (
                                    <Image source={{ uri: newPhotoUri }} style={styles.newPhoto} />
                                ) : (
                                    <Image source={{ uri: profile }} style={styles.newPhoto} />
                                )}
                                <View style={styles.cameraIconOverlay}>
                                    <Ionicons name="camera" size={24} color="#FFF" />
                                </View>
                            </TouchableOpacity>
                            <Text style={styles.modalLabel}>Profile Photo</Text>

                            {/* New Username Input */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.modalLabel}>Username</Text>
                                <TextInput
                                    style={styles.modalInput}
                                    placeholder="Enter new username"
                                    placeholderTextColor="#999"
                                    value={newUsername}
                                    onChangeText={setNewUsername}
                                    autoCapitalize="none"
                                    maxLength={20}
                                />
                            </View>

                            {/* Action Buttons */}
                            <View style={styles.modalButtonRow}>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.cancelButton]}
                                    onPress={() => setModalVisible(false)}
                                >
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.saveButton]}
                                    onPress={onSaveChanges}
                                >
                                    <Text style={styles.saveButtonText}>Save</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>
        </View>
    );
}

// ----- STYLES -----
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5FF',
    },
    headerContainer: {
        backgroundColor: '#FFFFFF',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        paddingTop: 40,
        paddingBottom: 20,
        alignItems: 'center',
        position: 'relative',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    profilePhoto: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 3,
        borderColor: '#8A2BE2',
        marginBottom: 12,
    },
    usernameText: {
        fontSize: 22,
        fontWeight: '700',
        color: '#8A2BE2',
        marginBottom: 12,
    },
    // Circular edit button in top-right of header card
    editButton: {
        position: 'absolute',
        top: 30,
        right: 20,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#8A2BE2',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 4,
    },
    logoutButton: {
        backgroundColor: '#E57373',
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 20,
        marginTop: 8,
    },
    logoutButtonText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
    },
    sectionTitle: {
        marginTop: 20,
        marginLeft: 20,
        fontSize: 20,
        fontWeight: '600',
        color: '#8A2BE2',
    },
    postsContainer: {
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    postCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
    },
    postTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 6,
    },
    postExcerpt: {
        fontSize: 14,
        color: '#555',
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '90%',
        backgroundColor: '#F5F5FF',
        borderRadius: 16,
        overflow: 'hidden',
    },
    modalContent: {
        padding: 20,
        alignItems: 'center',
    },
    modalHeader: {
        fontSize: 22,
        fontWeight: '700',
        color: '#8A2BE2',
        marginBottom: 20,
    },
    newPhotoPlaceholder: {
        position: 'relative',
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#EDE7F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        overflow: 'hidden',
    },
    newPhoto: {
        width: '100%',
        height: '100%',
    },
    cameraIconOverlay: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#8A2BE2',
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalLabel: {
        fontSize: 14,
        color: '#555',
        marginBottom: 6,
        marginTop: 8,
    },
    inputGroup: {
        width: '100%',
        marginBottom: 16,
    },
    modalInput: {
        borderWidth: 1,
        borderColor: '#D0BFE5',
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
        color: '#333',
        backgroundColor: '#FFF',
    },
    modalButtonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 20,
    },
    modalButton: {
        flex: 0.48,
        paddingVertical: 12,
        borderRadius: 6,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#BDBDBD',
    },
    saveButton: {
        backgroundColor: '#8A2BE2',
    },
    cancelButtonText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
    },
    saveButtonText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5F5FF',
    },
    errorText: {
        color: 'red',
        fontSize: 16,
    },
});

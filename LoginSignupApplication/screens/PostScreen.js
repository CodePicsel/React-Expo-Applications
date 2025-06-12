// screens/PostScreen.js
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    ScrollView,
    StyleSheet,
    Platform,
    KeyboardAvoidingView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../supabaseClient';

export default function PostScreen() {
    const [imageUri, setImageUri] = useState(null);
    const [phileName, setPhileName] = useState('');
    const [description, setDescription] = useState('');
    const [uploading, setUploading] = useState(false);
    const [phileNameMeaning, setPhileNameMeaning] = useState('');
    const [hasGalleryPermission, setHasGalleryPermission] = useState(null);
    const [hasCameraPermission, setHasCameraPermission] = useState(null);

    useEffect(() => {
        (async () => {
            // Request media-library permission
            const galleryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
            setHasGalleryPermission(galleryStatus.status === 'granted');

            // Request camera permission
            const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
            setHasCameraPermission(cameraStatus.status === 'granted');
        })();
    }, []);

    if (hasGalleryPermission === false) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>
                    Permission to access gallery is required!
                </Text>
            </View>
        );
    }
    if (hasCameraPermission === false) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>
                    Permission to access camera is required!
                </Text>
            </View>
        );
    }

    // Pick image from library
    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images, // use MediaTypeOptions
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.7,
            });

            // Handle both possible result shapes:
            if (result.cancelled === false || result.canceled === false) {
                // Old API: result.uri; New API: result.assets[0].uri
                const uri = result.uri ?? (result.assets && result.assets[0]?.uri);
                if (uri) setImageUri(uri);
            }
        } catch (err) {
            console.error('Error picking image:', err);
            Alert.alert('Error', 'Could not open image library.');
        }
    };

    // Take a new photo
    const takePhoto = async () => {
        try {
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images, // use MediaTypeOptions
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.7,
            });

            if (result.cancelled === false || result.canceled === false) {
                const uri = result.uri ?? (result.assets && result.assets[0]?.uri);
                if (uri) setImageUri(uri);
            }
        } catch (err) {
            console.error('Error taking photo:', err);
            Alert.alert('Error', 'Could not open camera.');
        }
    };
    const onSubmit = async () => {
        if (!imageUri) {
            Alert.alert('Missing Image', 'Please select or take a photo first.');
            return;
        }
        if (phileName.trim() === '') {
            Alert.alert('Missing Title', 'Please enter a phileName.');
            return;
        }
        if (description.trim() === '') {
            Alert.alert('Missing Description', 'Please enter a description.');
            return;
        }

        // disable further taps
        setUploading(true);

        try {
            const ext = imageUri.split('.').pop();
            const fileName = `${Date.now()}.${ext}`;

            // Upload…
            const { error: uploadErr } = await supabase.storage
                .from('post-images')
                .upload(fileName, {
                    uri: imageUri,
                    type: `image/${ext}`,
                    name: fileName,
                }, {
                    upsert: true,
                    contentType: `image/${ext}`,
                });
            if (uploadErr) throw uploadErr;

            const { data: { publicUrl } } = supabase
                .storage
                .from('post-images')
                .getPublicUrl(fileName);

            const { data: { user }, error: userErr } = await supabase.auth.getUser();
            if (userErr || !user) throw userErr || new Error('No user session');
            const userId = user.id;

            const { error: dbErr } = await supabase
                .from('posts')
                .insert({
                    user_id: userId,
                    phile_name: phileName,
                    phile_name_meaning: phileNameMeaning,
                    description,
                    image_url: publicUrl,
                });
            if (dbErr) throw dbErr;

            Alert.alert('Success', 'Your post is live!');
            setImageUri(null);
            setPhileName('');
            setPhileNameMeaning('');
            setDescription('');
        } catch (err) {
            console.error(err);
            Alert.alert('Upload failed', err.message);
        } finally {
            // re-enable button
            setUploading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.container}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                keyboardShouldPersistTaps="handled"
            >
                <Text style={styles.header}>Create a New Post</Text>

                {/* Image Preview or Placeholder */}
                <View style={styles.imageContainer}>
                    {imageUri ? (
                        <Image source={{ uri: imageUri }} style={styles.previewImage} />
                    ) : (
                        <View style={styles.imagePlaceholder}>
                            <Text style={styles.imagePlaceholderText}>No image selected</Text>
                        </View>
                    )}
                </View>

                {/* Buttons to pick image or take photo */}
                <View style={styles.buttonRow}>
                    <TouchableOpacity
                        style={[styles.smallButton, styles.galleryButton]}
                        onPress={pickImage}
                    >
                        <Text style={styles.smallButtonText}>Choose from Gallery</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.smallButton, styles.cameraButton]}
                        onPress={takePhoto}
                    >
                        <Text style={styles.smallButtonText}>Take a Photo</Text>
                    </TouchableOpacity>
                </View>

                {/* Title Input */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Title</Text>
                    <TextInput
                        style={styles.titleInput}
                        placeholder="Enter post phileName"
                        placeholderTextColor="#999"
                        value={phileName}
                        onChangeText={setPhileName}
                        maxLength={100}
                    />
                </View>

                {/* Meaning Input */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Meaning</Text>
                    <TextInput
                        style={styles.titleInput}
                        placeholder="Enter meaning of title"
                        placeholderTextColor="#999"
                        value={phileNameMeaning}
                        onChangeText={setPhileNameMeaning}
                        maxLength={200}
                    />
                </View>

                {/* Description Input (multiline) */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Description</Text>
                    <TextInput
                        style={styles.descriptionInput}
                        placeholder="Write a description..."
                        placeholderTextColor="#999"
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                    />
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                    style={[styles.submitButton, uploading && { opacity: 0.6 }]}
                    onPress={onSubmit}
                    disabled={uploading}
                >
                    {uploading
                        ? <ActivityIndicator color="#FFF" />
                        : <Text style={styles.submitButtonText}>Upload Post</Text>
                    }
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>
        </KeyboardAvoidingView >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5FF',
    },
    scrollContainer: {
        padding: 20,
        alignItems: 'stretch',
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
    header: {
        paddingTop: 45,
        fontSize: 24,
        fontWeight: '600',
        color: '#8A2BE2',
        marginBottom: 20,
        textAlign: 'center',
    },
    imageContainer: {
        height: 200,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#EDE7F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    previewImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    imagePlaceholder: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    imagePlaceholderText: {
        color: '#999',
        fontSize: 16,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    smallButton: {
        flex: 0.48,
        paddingVertical: 12,
        borderRadius: 6,
        alignItems: 'center',
    },
    galleryButton: {
        backgroundColor: '#7C4DFF',
    },
    cameraButton: {
        backgroundColor: '#536DFE',
    },
    smallButtonText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '500',
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        color: '#555',
        marginBottom: 6,
    },
    titleInput: {
        borderWidth: 1,
        borderColor: '#D0BFE5',
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
        color: '#333',
        backgroundColor: '#FFF',
    },
    descriptionInput: {
        borderWidth: 1,
        borderColor: '#D0BFE5',
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
        color: '#333',
        backgroundColor: '#FFF',
        minHeight: 100,
    },
    submitButton: {
        backgroundColor: '#8A2BE2',
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    submitButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
});

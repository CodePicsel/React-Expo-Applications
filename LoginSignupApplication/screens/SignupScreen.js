import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    Alert, StyleSheet, ActivityIndicator
} from 'react-native';
import { supabase } from '../supabaseClient';

export default function SignupScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);

    const signUp = async () => {
        if (password !== confirm) {
            return Alert.alert('Error', 'Passwords do not match.');
        }
        setLoading(true);
        const { data, error } = await supabase.auth.signUp({ email, password });
        setLoading(false);
        if (error) {
            return Alert.alert('Signup error', error.message);
        }
        Alert.alert('Success', 'Account created! Please log in.');
        navigation.replace('Login');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Create Account</Text>
            <TextInput
                style={styles.input}
                placeholder="Email"
                keyboardType="email-address"
                placeholderTextColor="#999"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#999"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />
            <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor="#999"
                secureTextEntry
                value={confirm}
                onChangeText={setConfirm}
            />

            <TouchableOpacity
                style={styles.button}
                onPress={signUp}
                disabled={loading}
            >
                {loading
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.buttonText}>Sign Up</Text>
                }
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.replace('Login')}>
                <Text style={styles.link}>Already have an account? Log in</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#F5F5FF' },
    title: { fontSize: 28, fontWeight: '600', color: '#8A2BE2', textAlign: 'center', marginBottom: 30 },
    input: { borderWidth: 1, borderColor: '#D0BFE5', borderRadius: 6, padding: 12, marginBottom: 15, backgroundColor: '#fff' },
    button: { backgroundColor: '#8A2BE2', padding: 14, borderRadius: 6, alignItems: 'center', marginBottom: 20 },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    link: { textAlign: 'center', color: '#8A2BE2', marginTop: 10 },
});

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import { supabase } from '../supabaseClient';

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // On mount: if already logged in, redirect to MainTab
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session }, error }) => {
            if (session?.user) {
                navigation.replace('MainTab');
            }
        });
    }, []);

    // Check profile completeness and navigate accordingly
    const checkProfileAndNavigate = async () => {
        // 1) Ensure there’s a logged-in user
        const {
            data: { session },
            error: sessionErr
        } = await supabase.auth.getSession();

        if (sessionErr || !session?.user) {
            // No user session → go back to Login
            return navigation.replace('Login');
        }

        const userId = session.user.id;

        // 2) Now fetch the profile row (if any)
        const { data: profile, error: profErr } = await supabase
            .from('profiles')
            .select('username, avatar_url, age')
            .eq('id', userId)
            .maybeSingle();

        if (profErr) {
            console.error('Profile fetch error', profErr);
            // If fetch fails, send them to setup to recreate
            return navigation.replace('SetupProfile');
        }

        // 3) Decide where to go based on completeness
        if (!profile || !profile.username || !profile.avatar_url || !profile.age) {
            navigation.replace('SetupProfile');
        } else {
            navigation.replace('MainTab');
        }
    };

    const signIn = async () => {
        setLoading(true);
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        setLoading(false);
        if (error) {
            return Alert.alert('Login error', error.message);
        }
        // After successful login, check profile
        await checkProfileAndNavigate();
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome Back</Text>
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

            <TouchableOpacity
                style={styles.button}
                onPress={signIn}
                disabled={loading}
            >
                {loading
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.buttonText}>Login</Text>
                }
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.replace('Signup')}>
                <Text style={styles.link}>Don't have an account? Sign up</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        backgroundColor: '#F5F5FF'
    },
    title: {
        fontSize: 28,
        fontWeight: '600',
        color: '#8A2BE2',
        textAlign: 'center',
        marginBottom: 30
    },
    input: {
        borderWidth: 1,
        borderColor: '#D0BFE5',
        borderRadius: 6,
        padding: 12,
        marginBottom: 15,
        backgroundColor: '#fff'
    },
    button: {
        backgroundColor: '#8A2BE2',
        padding: 14,
        borderRadius: 6,
        alignItems: 'center',
        marginBottom: 20
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600'
    },
    link: {
        textAlign: 'center',
        color: '#8A2BE2',
        marginTop: 10
    }
});

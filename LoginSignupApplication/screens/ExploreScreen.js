// screens/ExploreScreen.js
import React, { useCallback, useEffect, useState } from 'react';
import {
    SafeAreaView,
    StatusBar,
    StyleSheet,
    View,
    FlatList,
    ActivityIndicator,
    Alert,
    Text,
    Platform,
} from 'react-native';
import { supabase } from '../supabaseClient';
import PhileCard from '../components/PhileCard';

export default function ExploreScreen({ navigation }) {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [philes, setPhiles] = useState([]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const { data: allPosts, error } = await supabase
                .from('posts')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;

            const grouped = allPosts.reduce((acc, p) => {
                (acc[p.phile_name] = acc[p.phile_name] || []).push(p);
                return acc;
            }, {});

            const phileList = Object.entries(grouped).map(([name, items]) => ({
                name,
                meaning: items[0].phile_name_meaning || '',
                posts: items,
            }));

            setPhiles(phileList);
            setPosts(allPosts);
        } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Could not load posts.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const handleExplore = phileName => {
        navigation.navigate('PhileDetail', { phileName });
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#8A2BE2" />
            </View>
        );
    }

    // No philes/posts
    if (philes.length === 0) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <StatusBar barStyle="dark-content" backgroundColor="#F5F5FF" />
                <View style={styles.centered}>
                    <Text style={styles.emptyText}>No posts available.</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#F5F5FF" />
            <View style={styles.headerBar}>
                <Text style={styles.headerText}>Philes</Text>
            </View>
            <FlatList
                data={philes}
                keyExtractor={item => item.name}
                renderItem={({ item }) => (
                    <PhileCard
                        phile={{ name: item.name, meaning: item.meaning }}
                        posts={item.posts}
                        onExplore={handleExplore}
                    />
                )}
                contentContainerStyle={styles.list}
                refreshing={refreshing}
                onRefresh={onRefresh}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F5F5FF',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#555',
    },
    list: {
        paddingVertical: 8,
    },
    headerBar: {
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderBottomColor: '#EEE',
        borderBottomWidth: 1,
    },
    headerText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#8A2BE2',
    },
});

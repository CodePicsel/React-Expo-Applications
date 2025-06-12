// screens/PhileDetailScreen.js
import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../supabaseClient';
import PostCard from '../components/PostCard';

export default function PhileDetailScreen({ route, navigation }) {
    const { phileName } = route.params;
    const [posts, setPosts] = useState([]);
    const [meanings, setMeanings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadPhileDetails() {
            setLoading(true);
            try {
                // 1) Fetch posts for this phile
                const { data: postData, error: postErr } = await supabase
                    .from('posts')
                    .select('*')
                    .eq('phile_name', phileName)
                    .order('created_at', { ascending: false });
                if (postErr) throw postErr;

                // 2) Extract distinct meanings
                const distinct = Array.from(
                    new Set(
                        postData.map(p => p.phile_name_meaning).filter(m => m && m.trim())
                    )
                );
                setMeanings(distinct);

                // 3) Fetch user profiles
                const userIds = [...new Set(postData.map(p => p.user_id))];
                const { data: profiles, error: profErr } = await supabase
                    .from('profiles')
                    .select('id, username, avatar_url')
                    .in('id', userIds);
                if (profErr) throw profErr;

                // 4) Map avatars to URLs
                const profilesWithUrls = profiles.map(p => {
                    const { data: { publicUrl } } = supabase
                        .storage
                        .from('avatars')
                        .getPublicUrl(p.avatar_url);
                    return { ...p, avatar_url: publicUrl };
                });

                // 5) Build lookup map & merge
                const profileMap = Object.fromEntries(
                    profilesWithUrls.map(u => [u.id, u])
                );
                const merged = postData.map(post => ({
                    ...post,
                    user: profileMap[post.user_id] || { username: 'Unknown', avatar_url: null },
                }));
                setPosts(merged);
            } catch (err) {
                console.error(err);
                Alert.alert('Error', 'Unable to load phile details.');
            } finally {
                setLoading(false);
            }
        }
        loadPhileDetails();
    }, [phileName]);

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#8A2BE2" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={24} color="#8A2BE2" />
                </TouchableOpacity>
                <Text style={styles.title}>{phileName}</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Meanings horizontal scroll */}
            {meanings.length > 0 && (
                <View style={styles.meaningContainer}>
                    <FlatList
                        data={meanings}
                        keyExtractor={(item, idx) => idx.toString()}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.meaningScroll}
                        style={styles.meaningList}
                        renderItem={({ item }) => (
                            <View style={styles.meaningChip}>
                                <Text style={styles.meaningText}>{item}</Text>
                            </View>
                        )}
                    />
                </View>
            )}

            {/* Posts list */}
            <FlatList
                data={posts}
                keyExtractor={item => item.id}
                renderItem={({ item }) => <PostCard post={item} />}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#F5F5FF' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderColor: '#EEE',
    },
    title: { fontSize: 20, fontWeight: '600', color: '#8A2BE2' },
    meaningContainer: {
        maxHeight: 40,
    },
    meaningList: {
        marginTop: 10,
        marginBottom: 8,
    },
    meaningScroll: {
        paddingHorizontal: 16,
        alignItems: 'center',
    },
    meaningChip: {
        backgroundColor: '#EDE7F6',
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 1,
        marginRight: 8,
    },
    meaningText: { fontSize: 12, color: '#555' },
    listContent: { paddingVertical: 8 },
});

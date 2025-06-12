// components/PostCard.js
import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

// Helper to display relative time
const timeAgo = (timestamp) => {
    const now = new Date();
    const posted = new Date(timestamp);
    const diffMs = now - posted;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHrs = Math.floor(diffMin / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    const diffDays = Math.floor(diffHrs / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return `${diffDays}d ago`;
};

export default function PostCard({ post }) {
    return (
        <View style={styles.card}>
            {/* Header */}
            <View style={styles.headerRow}>
                {post.user.avatar_url ? (
                    <Image source={{ uri: post.user.avatar_url }} style={styles.avatar} />
                ) : (
                    <View style={[styles.avatar, styles.avatarPlaceholder]} />
                )}
                <View style={styles.headerText}>
                    <Text style={styles.username}>{post.user.username || 'Unknown'}</Text>
                    <Text style={styles.timestamp}>{timeAgo(post.created_at)}</Text>
                </View>
            </View>

            {/* Image */}
            <Image source={{ uri: post.image_url }} style={styles.image} />

            {/* Content */}
            <View style={styles.content}>
                <Text style={styles.title}>{post.phile_name}</Text>
                {post.phile_name_meaning ? <Text style={styles.meaning}>{post.phile_name_meaning}</Text> : null}
                <Text numberOfLines={2} style={styles.description}>{post.description}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFF',
        marginVertical: 8,
        marginHorizontal: 16,
        borderRadius: 12,
        overflow: 'hidden',
        width: width - 32,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderColor: '#EEE',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    avatarPlaceholder: {
        backgroundColor: '#CCC',
    },
    headerText: {
        flex: 1,
    },
    username: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    timestamp: {
        fontSize: 12,
        color: '#888',
        marginTop: 2,
    },
    image: {
        width: '100%',
        height: 200,
    },
    content: {
        padding: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    meaning: {
        fontSize: 14,
        fontStyle: 'italic',
        color: '#666',
        marginVertical: 4,
    },
    description: {
        fontSize: 14,
        color: '#555',
    },
});

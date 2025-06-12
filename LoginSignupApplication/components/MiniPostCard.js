import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

// Simple inner post card: image + description + timestamp
const timeAgo = timestamp => {
    const now = new Date();
    const posted = new Date(timestamp);
    const diff = now - posted;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
};

export default function MiniPostCard({ post }) {
    return (
        <View style={styles.container}>
            <Image source={{ uri: post.image_url }} style={styles.image} />
            <View style={styles.footer}>
                <Text numberOfLines={2} style={styles.description}>{post.description}</Text>
                <Text style={styles.timestamp}>{timeAgo(post.created_at)}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 160,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#FFF',
        marginRight: 12,
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    image: {
        width: '100%',
        height: 100,
    },
    footer: {
        padding: 8,
    },
    description: {
        fontSize: 12,
        color: '#333',
    },
    timestamp: {
        fontSize: 10,
        color: '#888',
        marginTop: 4,
    },
});

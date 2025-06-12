// components/PhileCard.js
import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import MiniPostCard from './MiniPostCard';

export default function PhileCard({ phile, posts, onExplore }) {
    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.phileName}>{phile.name}</Text>
                    {phile.meaning ? <Text style={styles.meaning}>{phile.meaning}</Text> : null}
                </View>
                <TouchableOpacity onPress={() => onExplore(phile.name)}>
                    <Text style={styles.explore}>Explore  {'>'}</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={posts}
                horizontal
                keyExtractor={item => item.id}
                renderItem={({ item }) => <MiniPostCard post={item} />}
                showsHorizontalScrollIndicator={false}
                style={styles.list}
            />
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
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderColor: '#808080',
    },
    phileName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    meaning: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    explore: {
        fontSize: 14,
        color: '#8A2BE2',
        fontWeight: '600',
    },
    list: {
        paddingLeft: 12,
        paddingTop: 8,
        paddingBottom: 10,
    },
});

import React from 'react';
import { View, Text, Image, ScrollView, SafeAreaView } from 'react-native';

export default function App() {
return (
<SafeAreaView style={{ flex: 1, backgroundColor: '#FFF8F5' }}>
<ScrollView>
<View style={{ width: 430, height: 932, backgroundColor: '#FFF8F5', position: 'relative' }}>

          {/* Back Icon Container */}
          <View style={{ width: 30, height: 30, left: 13, top: 41, position: 'absolute', overflow: 'hidden' }}>
            <View style={{ width: 17.32, height: 27.76, left: 6.32, top: 1.12, position: 'absolute', backgroundColor: 'black' }} />
          </View>

          {/* Goal Header */}
          <Text style={{ left: 22, top: 211, position: 'absolute', color: 'black', fontSize: 20, fontWeight: '400' }}>
            Goal: <Text style={{ fontWeight: '400' }}>I want to visit the bahamas</Text>
          </Text>

          {/* --- Card 1 (Flights) --- */}
          <View style={{ width: 166, height: 228, left: 22, top: 298, position: 'absolute' }}>
            <Image
              source={{ uri: 'https://via.placeholder.com/166x228' }}
              style={{ width: 166, height: 228, borderRadius: 10 }}
            />
            <View style={{ width: 166, height: 91, position: 'absolute', bottom: 0, backgroundColor: '#537787', borderBottomRightRadius: 10, borderBottomLeftRadius: 10, padding: 11 }}>
              <Text style={{ color: 'white', fontSize: 15, fontWeight: '700' }}>Find & book flights</Text>
              <View style={{ flexDirection: 'row', marginTop: 15 }}>
                <Image source={{ uri: 'https://via.placeholder.com/15' }} style={{ width: 15, height: 15 }} />
                <Text style={{ color: 'white', fontSize: 10, marginLeft: 3 }}>Planning</Text>
                <Image source={{ uri: 'https://via.placeholder.com/15' }} style={{ width: 15, height: 15, marginLeft: 12 }} />
                <Text style={{ color: 'white', fontSize: 10, marginLeft: 3 }}>Decision</Text>
              </View>
              <Text style={{ color: 'white', fontSize: 15, fontWeight: '300', marginTop: 5 }}>60 mins</Text>
            </View>
          </View>

          {/* --- Card 2 (Lodging) --- */}
          <View style={{ width: 166, height: 228, left: 237, top: 298, position: 'absolute' }}>
            <Image
              source={{ uri: 'https://via.placeholder.com/166x228' }}
              style={{ width: 166, height: 228, borderRadius: 10 }}
            />
            <View style={{ width: 166, height: 91, position: 'absolute', bottom: 0, backgroundColor: '#E6BD6E', borderBottomRightRadius: 10, borderBottomLeftRadius: 10, padding: 11 }}>
              <Text style={{ color: 'white', fontSize: 15, fontWeight: '700' }}>Book lodging</Text>
              <View style={{ flexDirection: 'row', marginTop: 15 }}>
                <Image source={{ uri: 'https://via.placeholder.com/15' }} style={{ width: 15, height: 15 }} />
                <Text style={{ color: 'white', fontSize: 10, marginLeft: 3 }}>Planning</Text>
                <Image source={{ uri: 'https://via.placeholder.com/15' }} style={{ width: 15, height: 15, marginLeft: 12 }} />
                <Text style={{ color: 'white', fontSize: 10, marginLeft: 3 }}>Decision</Text>
              </View>
              <Text style={{ color: 'white', fontSize: 15, fontWeight: '300', marginTop: 5 }}>60 mins</Text>
            </View>
          </View>

          {/* --- Card 3 (Feedback) --- */}
          <View style={{ width: 166, height: 228, left: 22, top: 554, position: 'absolute' }}>
            <Image
              source={{ uri: 'https://via.placeholder.com/166x228' }}
              style={{ width: 166, height: 228, borderRadius: 10 }}
            />
            <View style={{ width: 166, height: 91, position: 'absolute', bottom: 0, backgroundColor: '#96C5BF', borderBottomRightRadius: 10, borderBottomLeftRadius: 10, padding: 11 }}>
              <Text style={{ color: 'white', fontSize: 15, fontWeight: '700' }}>Share plans and get feedback</Text>
              <View style={{ flexDirection: 'row', marginTop: 5 }}>
                <Image source={{ uri: 'https://via.placeholder.com/15' }} style={{ width: 15, height: 15 }} />
                <Text style={{ color: 'white', fontSize: 10, marginLeft: 3 }}>Planning</Text>
                <Image source={{ uri: 'https://via.placeholder.com/15' }} style={{ width: 15, height: 15, marginLeft: 12 }} />
                <Text style={{ color: 'white', fontSize: 10, marginLeft: 3 }}>Decision</Text>
              </View>
              <Text style={{ color: 'white', fontSize: 15, fontWeight: '300', marginTop: 5 }}>60 mins</Text>
            </View>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>

);
}

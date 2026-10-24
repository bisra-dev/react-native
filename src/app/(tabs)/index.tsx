import "@/global.css"
import { useUser } from "@clerk/expo";
import { FlatList, Image, Text, View } from "react-native";
import images from "@/constants/images";

import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";
import { HOME_BALANCE, HOME_SUBSCRIPTIONS, UPCOMING_SUBSCRIPTIONS } from "@/constants/data";
import { icons } from "@/constants/icons";
import { formatCurrency } from "@/lib/utils";
import dayjs from "dayjs";

import ListHeading from "@/components/ListHeading"
import UpcomingSubscriptionCard from "@/components/UpcomingSubscriptionCard"
import SubscriptionCard from "@/components/SubscriptionCard";
import { useState } from "react";
const SafeAreaView = styled(RNSafeAreaView);
 
export default function App() {
  const [expandedSubscriptionId, setexpandedSubscriptionId] = useState<string | null>(null);
  const { user } = useUser();
  const displayName = user?.fullName || user?.username || user?.primaryEmailAddress?.emailAddress || "Your account";
  return (
    <SafeAreaView className="flex-1 p-5 bg-background">
        <FlatList 
        ListHeaderComponent={() => (
          <>
            <View className="home-header">
              <View className="home-user">
                <Image
                  source={user?.hasImage ? { uri: user.imageUrl } : images.avatar}
                  className="home-avatar"
                />
                <Text className="home-user-name">
                  {displayName}
                </Text>
              </View>
              <Image source={icons.add} className="home-add-icon rounded-full border border-border bg-white" />
            </View>
            <View className="home-balance-card">
              <Text className="home-balance-label">Balance</Text>
              <View className="home-balance-row">
                <Text className="home-balance-amount">
                  {formatCurrency (HOME_BALANCE.amount)}
                </Text>
                <Text className="home-balance-date">
                  {dayjs(HOME_BALANCE.nextRenewalDate).format("MM/DD")}
                </Text>
              </View>
            </View>
            <View className="mb-5">
              <ListHeading title= "Upcoming" />
              <FlatList
                data={UPCOMING_SUBSCRIPTIONS}
                renderItem={({ item }) => (
                  <UpcomingSubscriptionCard {...item} />
                )}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                ListEmptyComponent={<Text className="home-empty-state">No upcoming subscriptions.</Text>}
              />
            </View>
            <ListHeading title= "All Subscriptions" />
          </>
        )}
          data={HOME_SUBSCRIPTIONS}
          keyExtractor={(item) => item.id} 
          renderItem={({item}) => (<SubscriptionCard
           {...item}
           expanded={expandedSubscriptionId === item.id} 
           onPress={() => setexpandedSubscriptionId((currentId) => (currentId === item.id ? null: item.id))}
          />)}
            extraData={expandedSubscriptionId}
            ItemSeparatorComponent={() => <View className="h-4" />}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={<Text className="home-empty-state">No Subscription Yet.</Text>}
            contentContainerClassName="pb-30"
          />
    </SafeAreaView>
  );
}
import { formatCurrency, formatStatusLabel, formatSubscriptionDateTime } from "@/lib/util";
import clsx from "clsx";
import { Image, Pressable, Text, View } from "react-native";

const SubscriptionCard = ({
    name,
    price,
    currency,
    icon,
    billing,
    color,
    category,
    plan,
    renewalDate,
    onPress,
    expanded,
    paymentMethod,
    startDate,
    status
}: SubscriptionCardProps) => {
    return (
        <Pressable
            onPress={onPress}
            className={clsx("sub-card", expanded ? "sub-card-expanded" : "bg-card")}
            style={!expanded && color ? { backgroundColor: color } : undefined}
        >
            <View className="sub-head">
                <View className="sub-main">
                    <View className="sub-icon">
                        <Image source={icon} className="w-full h-full" />
                    </View>
                    <View className="sub-copy">
                        <Text className="sub-title" numberOfLines={1}>
                            {name}
                        </Text>
                        <Text className="sub-meta" numberOfLines={1} ellipsizeMode="tail">
                            {category?.trim() ||
                                plan?.trim() ||
                                (renewalDate ? formatSubscriptionDateTime(renewalDate) : "")}
                        </Text>
                    </View>
                </View>
                <View className="sub-price-box">
                    <Text className="sub-price">{formatCurrency(price, currency)}</Text>
                    <Text className="sub-currency">{billing}</Text>
                </View>
            </View>
            {expanded && (
                <View className="sub-body">
                    <View className="sub-details">

                        <View className="sub-row">
                            <View className="sub-row-copy">
                                <Text className="sub-label">Payment:</Text>
                                <Text
                                    className="sub-value"
                                    numberOfLines={1}
                                    ellipsizeMode="tail"
                                >
                                    {paymentMethod?.trim() || "Not provided"}
                                </Text>
                            </View>
                        </View>

                        <View className="sub-row">
                            <View className="sub-row-copy">
                                <Text className="sub-label">Category:</Text>
                                <Text
                                    className="sub-value"
                                    numberOfLines={1}
                                    ellipsizeMode="tail"
                                >
                                    {category?.trim() || plan?.trim() || "Not provided"}    
                                </Text>
                            </View>
                        </View>

                        <View className="sub-row">
                            <View className="sub-row-copy">
                                <Text className="sub-label">Started:</Text>
                                <Text
                                    className="sub-value"
                                    numberOfLines={1}
                                    ellipsizeMode="tail"
                                >
                                    {startDate ? formatSubscriptionDateTime(startDate) : "Not provided"}
                                </Text>
                            </View>
                        </View>

                        <View className="sub-row">
                            <View className="sub-row-copy">
                                <Text className="sub-label">Renewal Date:</Text>
                                <Text
                                    className="sub-value"
                                    numberOfLines={1}
                                    ellipsizeMode="tail"
                                >
                                    {renewalDate ? formatSubscriptionDateTime(renewalDate) : "Not provided"}
                                </Text>
                            </View>
                        </View>

                        <View className="sub-row">
                            <View className="sub-row-copy">
                                <Text className="sub-label">Status:</Text>
                                <Text
                                    className="sub-value"
                                    numberOfLines={1}
                                    ellipsizeMode="tail"
                                >
                                    {status ? formatStatusLabel(status) : "Not provided"}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            )}
        </Pressable>
    );
};

export default SubscriptionCard;
